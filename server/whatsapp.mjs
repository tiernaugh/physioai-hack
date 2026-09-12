import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { receipt } from './pipeline.mjs';
import { requiredLive, patientMap } from './config.mjs';
export { requiredLive, patientMap } from './config.mjs';
const MAX_AUDIO = 8 * 1024 * 1024;

export async function readLimited(stream, limit) {
  const chunks = []; let size = 0;
  for await (const chunk of stream) {
    size += chunk.length;
    if (size > limit) throw new Error('Body too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export function verifySignature(raw, signature, secret) {
  if (typeof signature !== 'string' || !/^sha256=[a-f0-9]{64}$/.test(signature)) return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(raw).digest('hex');
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
export function metaClient(env, fetchImpl = fetch) {
  const root = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}`;
  const headers = { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` };
  async function api(path, options = {}) {
    const res = await fetchImpl(`${root}/${path}`, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(30000), redirect: 'error' });
    if (!res.ok) throw new Error('WhatsApp request failed');
    return res.json();
  }
  return {
    async download(audio) {
      const meta = await api(encodeURIComponent(audio.mediaId));
      if (Number(meta.file_size) > MAX_AUDIO) throw new Error('Audio too large');
      const url = new URL(meta.url);
      if (url.protocol !== 'https:' || url.username || url.password || !['facebook.com','fbsbx.com','fbcdn.net','whatsapp.net'].some(host => url.hostname === host || url.hostname.endsWith('.' + host))) throw new Error('Unexpected media host');
      const res = await fetchImpl(url.href, { headers, signal: AbortSignal.timeout(60000), redirect: 'error' });
      if (!res.ok || Number(res.headers.get('content-length')) > MAX_AUDIO) throw new Error('Media download failed');
      const bytes = await readLimited(res.body, MAX_AUDIO);
      return { type: 'data', value: bytes.toString('base64'), mimeType: meta.mime_type || audio.mimeType };
    },
    async reply(to, body) {
      return api(`${encodeURIComponent(env.WHATSAPP_PHONE_NUMBER_ID)}/messages`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: body.slice(0, 4000) } }) });
    },
  };
}

export function createWhatsAppServer({ store, processNote, env, client = metaClient(env) }) {
  const mapping = patientMap(env.WHATSAPP_PATIENT_MAP);
  let work = Promise.resolve();
  let stopped = false;
  async function deliver(id) {
    try {
      const note = await processNote(id);
      if (!note.whatsapp || note.replyStatus !== 'not_sent') return;
      // Only free-form service replies in a conservative window. Never send templates.
      const age = Date.now() - note.whatsapp.timestamp * 1000;
      if (!Number.isFinite(age) || age < 0 || age >= 23.9 * 3600000) {
        await store.update(id, { replyStatus: 'window_expired' }); return;
      }
      // Persist before sending: uncertain delivery won't be automatically resent.
      await store.update(id, { replyStatus: 'sending' });
      const text = receipt(note);
      try {
        await client.reply(note.whatsapp.sender, text);
        await store.update(id, { replyStatus: 'sent', reply: text });
      } catch { await store.update(id, { replyStatus: 'unknown' }); }
    } catch { /* The pipeline retains the failed note for admin retry. */ }
  }
  function enqueue(ids) {
    for (const id of ids) work = work.then(() => stopped ? undefined : deliver(id)).catch(() => {});
  }
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname !== '/webhook') { res.writeHead(404).end(); return; }
      if (req.method === 'GET') {
        const valid = url.searchParams.get('hub.mode') === 'subscribe' && url.searchParams.get('hub.verify_token') === env.WHATSAPP_VERIFY_TOKEN;
        res.writeHead(valid ? 200 : 403).end(valid ? url.searchParams.get('hub.challenge') || '' : ''); return;
      }
      if (req.method !== 'POST') { res.writeHead(405).end(); return; }
      if (Number(req.headers['content-length']) > 1024 * 1024) { res.writeHead(413).end(); return; }
      const raw = await readLimited(req, 1024 * 1024);
      if (!verifySignature(raw, req.headers['x-hub-signature-256'], env.WHATSAPP_APP_SECRET)) { res.writeHead(401).end(); return; }
      let body;
      try { body = JSON.parse(raw); } catch { res.writeHead(400).end(); return; }
      if (body.object !== 'whatsapp_business_account') { res.writeHead(400).end(); return; }
      const ids = [];
      for (const entry of body.entry || []) for (const change of entry.changes || []) {
        const value = change.value;
        if (value?.metadata?.phone_number_id !== env.WHATSAPP_PHONE_NUMBER_ID) continue;
        for (const msg of value.messages || []) {
          if (!Object.hasOwn(mapping, msg.from) || typeof msg.id !== 'string' || msg.id.length > 300) continue;
          if (!['audio','text'].includes(msg.type)) continue;
          if (msg.type === 'audio' && typeof msg.audio?.id !== 'string') continue;
          if (msg.type === 'text' && (typeof msg.text?.body !== 'string' || msg.text.body.length > 20000 || !msg.text.body.trim())) continue;
          // Persist media ID and routing BEFORE ACK; download/transcription run after ACK.
          await store.receive({ id: msg.id, patientId: mapping[msg.from], source: 'whatsapp',
            transcript: msg.type === 'text' ? msg.text.body : null,
            audio: msg.type === 'audio' ? { type: 'whatsapp', mediaId: msg.audio.id, mimeType: msg.audio.mime_type || 'audio/ogg' } : null,
            whatsapp: { sender: msg.from, timestamp: Number(msg.timestamp) } });
          ids.push(msg.id);
        }
      }
      res.writeHead(200).end();
      enqueue(ids);
    } catch { if (!res.headersSent) res.writeHead(500).end(); }
  });
  return { server, drain: () => work, resume: () => enqueue(store.list().filter(n => n.source === 'whatsapp' && n.status !== 'failed' && (n.status !== 'reviewed' || n.replyStatus === 'not_sent')).map(n => n.id)),
    stop: async () => { stopped = true; await new Promise(resolve => server.close(resolve)); await work; },
    status: () => ({ overall: server.listening ? 'webhook_listening' : 'stopped' }) };
}
export async function startWhatsApp(options) {
  const env = options.env || process.env;
  const missing = requiredLive.filter(key => !env[key]);
  if (missing.length) throw new Error(`Missing configuration: ${missing.join(', ')}`);
  if (env.ADMIN_TOKEN.length < 24) throw new Error('ADMIN_TOKEN must be at least 24 characters');
  if (!/^v\d+\.\d+$/.test(env.WHATSAPP_API_VERSION)) throw new Error('Invalid Graph API version');
  const connection = createWhatsAppServer({ ...options, env });
  await new Promise((resolve, reject) => { connection.server.once('error', reject); connection.server.listen(Number(env.WHATSAPP_PORT || 3000), env.WHATSAPP_HOST || '127.0.0.1', resolve); });
  connection.resume();
  return connection;
}
