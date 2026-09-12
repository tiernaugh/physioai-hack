import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { NoteStore } from './store.mjs';
import { createPipeline, demoTranscript, demoExtraction, receipt } from './pipeline.mjs';
import { requiredLive } from './config.mjs';
import { contextSchema, openAIAnalysis } from './analysis.mjs';
import { readLimited, metaClient } from './whatsapp.mjs';

const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
const equal = (a, b) => { const x = Buffer.from(a || ''), y = Buffer.from(b || ''); return x.length === y.length && timingSafeEqual(x, y); };

export function createApp({ store, processNote, mode = 'demo', env = process.env, channelStatus = () => 'not_connected', localReady = false, analysisProvider = 'off' }) {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname.startsWith('/api/')) {
        // Prevent cross-origin browser access and DNS rebinding to this local admin surface.
        const host = req.headers.host?.split(':')[0];
        if (!['localhost', '127.0.0.1'].includes(host)) return json(res, 403, { error: 'Local access only' });
        if (req.headers.origin && !['http://localhost:5173', 'http://127.0.0.1:5173', `http://${req.headers.host}`].includes(req.headers.origin)) return json(res, 403, { error: 'Origin rejected' });
        if (mode === 'live' && !equal(req.headers.authorization, `Bearer ${env.ADMIN_TOKEN}`)) return json(res, 401, { error: 'Enter the admin token to open the live inbox.' });
        if (req.method === 'GET' && url.pathname === '/api/voice/status') return json(res, 200, {
          mode, analysisProvider, transcriptionProvider: mode === 'demo' ? 'demo' : 'local-whisper', channel: channelStatus(), missing: requiredLive.filter(key => !env[key]), localReady,
        });
        if (req.method === 'GET' && url.pathname === '/api/voice/notes') return json(res, 200, store.publicNotes());
        if (req.method === 'POST' && url.pathname === '/api/voice/demo' && mode !== 'live') {
          const note = await store.receive({ id: `demo-${randomUUID()}`, patientId: 'demo-alex', source: 'demo', transcript: demoTranscript });
          const saved = await processNote(note.id);
          await store.update(note.id, { replyStatus: 'simulated', reply: receipt(saved) });
          return json(res, 201, { id: note.id });
        }
        if (req.method === 'POST' && url.pathname === '/api/voice/local' && mode === 'local') {
          if (Number(req.headers['content-length']) > 12 * 1024 * 1024) return json(res, 413, { error: 'File too large' });
          let input;
          try { input = JSON.parse((await readLimited(req, 12 * 1024 * 1024)).toString()); } catch { return json(res, 400, { error: 'Invalid upload' }); }
          if (!input || typeof input !== 'object') return json(res, 400, { error: 'Invalid upload' });
          const context = contextSchema.safeParse(input.context || []);
          if (!context.success) return json(res, 400, { error: 'Invalid note context' });
          const validText = typeof input.transcript === 'string' && input.transcript.trim() && input.transcript.length <= 20000;
          const validAudio = localReady && input.audio?.type === 'data' && typeof input.audio.value === 'string' && input.audio.value.length <= 11200000 && /^audio\//.test(input.audio.mimeType);
          if (!validText && !validAudio) return json(res, 400, { error: 'Enter a transcript or supply an audio file (local Whisper must be installed).' });
          const note = await store.receive({ id: `local-${randomUUID()}`, patientId: 'local-test', source: 'local', context: context.data,
            transcript: validText ? input.transcript.trim() : null, audio: validText ? null : input.audio });
          // Return immediately; the inbox can refresh while local transcription runs.
          void processNote(note.id).catch(() => {});
          return json(res, 202, { id: note.id });
        }
        const action = url.pathname.match(/^\/api\/voice\/notes\/([^/]+)\/(retry|review|analyse)$/);
        if (req.method === 'POST' && action) {
          const id = decodeURIComponent(action[1]), note = store.get(id);
          if (!note) return json(res, 404, { error: 'Note not found' });
          if (action[2] === 'analyse') {
            if (analysisProvider === 'off') return json(res, 409, { error: 'AI analysis is not configured on the voice service.' });
            if (!['saved', 'reviewed'].includes(note.status) || !note.transcript || note.source === 'demo') return json(res, 409, { error: 'Save a real transcript before analysing it.' });
            await store.update(id, { analysisStatus: 'pending', analysisError: null });
            void processNote(id, { analyseOnly: true }).catch(() => {});
            return json(res, 202, { ok: true });
          }
          if (action[2] === 'retry') {
            if (!['failed', 'received', 'transcribing', 'extracting'].includes(note.status)) return json(res, 409, { error: 'This note is already saved' });
            void processNote(id).catch(() => {});
            return json(res, 202, { ok: true });
          } else {
            if (!['saved', 'reviewed'].includes(note.status)) return json(res, 409, { error: 'Save the note before reviewing it' });
            await store.update(id, { status: 'reviewed', reviewedAt: new Date().toISOString() });
          }
          return json(res, 200, { ok: true });
        }
        return json(res, 404, { error: 'Endpoint not found' });
      }
      if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
      const root = resolve('dist');
      const file = resolve(root, `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`);
      if (!file.startsWith(root + sep)) return json(res, 403, { error: 'Forbidden' });
      try {
        const bytes = await readFile(file);
        const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[extname(file)] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type }); res.end(bytes);
      } catch { json(res, 404, { error: 'Run npm run build to build the inbox UI.' }); }
    } catch { json(res, 500, { error: 'The operation failed. Check the note status and retry.' }); }
  });
}

export async function main() {
  const mode = process.env.VOICE_MODE || 'local';
  if (!['demo', 'local', 'live'].includes(mode)) throw new Error('VOICE_MODE must be demo, local or live');
  // Demo records and live records never share a store.
  const store = await new NoteStore(resolve(process.env.VOICE_DATA_DIR || `data/voice-${mode}`)).init();
  let provider, localReady = false;
  if (mode === 'demo') provider = { transcribe: async () => { throw new Error('Demo accepts its fixture only'); },
    extract: async text => { if (text !== demoTranscript) throw new Error('Unknown demo fixture'); return demoExtraction; } };
  else {
    const missing = mode === 'live' ? requiredLive.filter(key => !process.env[key]) : [];
    if (missing.length) throw new Error(`Missing configuration: ${missing.join(', ')}`);
    provider = (await import('./providers.mjs')).providers();
    try { await provider.ready(); localReady = true; }
    catch { if (mode === 'live') throw new Error('Local transcription is not ready. Run the setup steps in WHATSAPP-SETUP.md.');
      console.log('Local transcription needs setup. Text reports still work; see WHATSAPP-SETUP.md.'); }
  }
  const analyser = mode === 'demo' ? null : openAIAnalysis();
  const processNote = createPipeline({ store, ...provider, analyser, download: mode === 'live' ? metaClient(process.env).download : undefined });
  let channels;
  if (mode === 'live') channels = await (await import('./whatsapp.mjs')).startWhatsApp({ store, processNote });
  // Resume work durably captured before a restart. Failed notes require an explicit retry.
  for (const note of store.list().reverse().filter(n => n.source !== 'whatsapp' && (['received', 'transcribing', 'extracting'].includes(n.status) || (n.transcript && ['pending', 'analysing'].includes(n.analysisStatus))))) {
    await processNote(note.id).catch(() => {});
  }
  const server = createApp({ store, processNote, mode, localReady, analysisProvider: analyser?.provider || 'off', channelStatus: () => channels?.status().overall || 'not_connected' });
  const port = Number(process.env.VOICE_PORT || 3001);
  server.listen(port, '127.0.0.1', () => console.log(`Voice inbox (${mode}): http://127.0.0.1:${port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await channels?.stop(); server.close(() => process.exit(0)); });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(e => { console.error(e.message); process.exitCode = 1; });
