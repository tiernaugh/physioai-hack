import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { createHmac } from 'node:crypto';
import { NoteStore } from '../server/store.mjs';
import { createPipeline, demoTranscript, demoExtraction, receipt } from '../server/pipeline.mjs';
import { createWhatsAppServer, metaClient, patientMap } from '../server/whatsapp.mjs';
import { createApp } from '../server/index.mjs';


async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'physio-voice-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return { directory, store: await new NoteStore(directory).init() };
}
async function listen(t, server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test('concurrent redelivery saves exactly one record and survives restart', async t => {
  const { store, directory } = await fixture(t);
  const payload = { id: 'wamid.one', patientId: 'patient-1', source: 'whatsapp', transcript: demoTranscript };
  await Promise.all([store.receive(payload), store.receive(payload)]);
  let calls = 0;
  const process = createPipeline({ store, extract: async () => { calls++; return demoExtraction; } });
  await Promise.all([process(payload.id), process(payload.id)]);
  assert.equal(calls, 1);
  const reopened = await new NoteStore(directory).init();
  assert.equal(reopened.list().length, 1);
  assert.equal(reopened.get(payload.id).extraction.discomfort, 2);
  assert.match(receipt(reopened.get(payload.id)), /Saved your reported note/);
  await assert.rejects(store.receive({ ...payload, patientId: 'someone-else' }), /identity conflict/);
});

test('failed extraction keeps transcript and retries without retranscribing', async t => {
  const { store } = await fixture(t);
  await store.receive({ id: 'retry', patientId: 'patient-1', source: 'whatsapp', audio: { type: 'data', value: 'abc', mimeType: 'audio/ogg' } });
  let transcriptions = 0, extractions = 0;
  const process = createPipeline({ store, transcribe: async () => { transcriptions++; return demoTranscript; },
    extract: async () => { extractions++; return extractions === 1 ? { ...demoExtraction, discomfort: 99 } : demoExtraction; } });
  await assert.rejects(process('retry'));
  assert.equal(store.get('retry').status, 'failed');
  assert.equal(store.get('retry').audio, null);
  assert.throws(() => receipt(store.get('retry')), /unsaved/);
  await process('retry');
  assert.equal(transcriptions, 1);
  assert.equal(store.get('retry').status, 'saved');
});

test('patient mappings validate and missing numbers remain null', async t => {
  const { store } = await fixture(t);
  assert.deepEqual(patientMap('{"353871234567":"patient-1"}'), { '353871234567': 'patient-1' });
  assert.throws(() => patientMap('{"+353":"bad"}'));
  await store.receive({ id: 'known', patientId: 'patient-1', source: 'local', transcript: 'My ankle felt stiff.' });
  const process = createPipeline({ store, extract: async () => ({ ...demoExtraction, exercise: null, sets: null, repetitions: null, discomfort: null, side: 'unspecified' }) });
  await process('known');
  assert.equal(store.get('known').extraction.sets, null);
});

test('live admin API requires token and rejects cross-origin access and demo injection', async t => {
  const { store } = await fixture(t);
  const token = 'a-test-admin-token-with-32-characters';
  const url = await listen(t, createApp({ store, processNote: async () => {}, mode: 'live', env: { ADMIN_TOKEN: token } }));
  assert.equal((await fetch(`${url}/api/voice/notes`)).status, 401);
  const headers = { Authorization: `Bearer ${token}` };
  assert.equal((await fetch(`${url}/api/voice/notes`, { headers })).status, 200);
  assert.equal((await fetch(`${url}/api/voice/notes`, { headers: { ...headers, Origin: 'https://evil.example' } })).status, 403);
  assert.equal((await fetch(`${url}/api/voice/demo`, { method: 'POST', headers })).status, 404);
});

test('demo endpoint persists a report, shows a simulated receipt and supports review', async t => {
  const { store } = await fixture(t);
  const processNote = createPipeline({ store, extract: async () => demoExtraction });
  const url = await listen(t, createApp({ store, processNote }));
  const created = await (await fetch(`${url}/api/voice/demo`, { method: 'POST' })).json();
  assert.ok(created.id.startsWith('demo-'));
  const notes = await (await fetch(`${url}/api/voice/notes`)).json();
  assert.equal(notes[0].replyStatus, 'simulated');
  assert.equal('audio' in notes[0], false);
  assert.equal((await fetch(`${url}/api/voice/notes/${created.id}/review`, { method: 'POST' })).status, 200);
  assert.equal(store.get(created.id).status, 'reviewed');
});

function environment() {
  return { WHATSAPP_ACCESS_TOKEN: 'fake', WHATSAPP_PHONE_NUMBER_ID: 'business-1', WHATSAPP_APP_SECRET: 'secret',
    WHATSAPP_VERIFY_TOKEN: 'verify', WHATSAPP_API_VERSION: 'v23.0', WHATSAPP_PATIENT_MAP: '{"353871234567":"patient-1"}' };
}
function webhook({ id = 'wamid.audio', from = '353871234567', timestamp = String(Math.floor(Date.now() / 1000)), phone = 'business-1' } = {}) {
  return JSON.stringify({ object: 'whatsapp_business_account', entry: [{ changes: [{ value: {
    metadata: { phone_number_id: phone }, messages: [{ id, from, timestamp, type: 'audio', audio: { id: 'media-1', mime_type: 'audio/ogg' } }],
  } }] }] });
}
function signed(body) { return { 'x-hub-signature-256': `sha256=${createHmac('sha256', 'secret').update(body).digest('hex')}` }; }

test('native webhook persists before ACK, validates signature, downloads audio, saves and replies once', async t => {
  const { store } = await fixture(t);
  const env = environment();
  let downloads = 0, replies = 0;
  const client = metaClient(env, async (url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer fake');
    if (String(url).endsWith('/media-1')) return Response.json({ url: 'https://lookaside.fbsbx.com/audio', mime_type: 'audio/ogg', file_size: 15 });
    if (String(url).includes('lookaside')) { downloads++; return new Response('OggS-test-bytes'); }
    replies++; assert.match(JSON.parse(options.body).text.body, /Saved your reported note/);
    assert.equal(store.get('wamid.audio').status, 'saved');
    return Response.json({ messages: [{ id: 'receipt' }] });
  });
  const processNote = createPipeline({ store, download: client.download,
    transcribe: async audio => { assert.equal(Buffer.from(audio.value, 'base64').toString(), 'OggS-test-bytes'); return demoTranscript; }, extract: async () => demoExtraction });
  const connection = createWhatsAppServer({ store, processNote, env, client });
  const base = await listen(t, connection.server), url = `${base}/webhook`;
  assert.equal(await (await fetch(`${url}?hub.mode=subscribe&hub.verify_token=verify&hub.challenge=123`)).text(), '123');
  const body = webhook();
  assert.equal((await fetch(url, { method: 'POST', body, headers: { 'x-hub-signature-256': 'sha256=wrong' } })).status, 401);
  assert.equal(store.list().length, 0);
  assert.equal((await fetch(url, { method: 'POST', body, headers: signed(body) })).status, 200);
  assert.ok(store.get('wamid.audio')); // Record exists at acknowledgement.
  await connection.drain();
  await fetch(url, { method: 'POST', body, headers: signed(body) }); await connection.drain();
  assert.equal(store.list().length, 1); assert.equal(downloads, 1); assert.equal(replies, 1);
  assert.equal(store.get('wamid.audio').replyStatus, 'sent');
  for (const bad of [webhook({ id: 'unknown', from: '353870000000' }), webhook({ id: 'other-number', phone: 'other' })]) {
    await fetch(url, { method: 'POST', body: bad, headers: signed(bad) });
  }
  await connection.drain(); assert.equal(store.list().length, 1);
});

test('expired reply windows and uncertain sends do not produce retries or paid templates', async t => {
  const { store } = await fixture(t);
  let replies = 0;
  const client = { reply: async () => { replies++; throw new Error('Ambiguous response'); } };
  const processNote = createPipeline({ store, transcribe: async () => demoTranscript, extract: async () => demoExtraction });
  const connection = createWhatsAppServer({ store, processNote, env: environment(), client });
  const url = `${await listen(t, connection.server)}/webhook`;
  await store.receive({ id: 'old', patientId: 'patient-1', source: 'whatsapp', transcript: demoTranscript,
    whatsapp: { sender: '353871234567', timestamp: Math.floor(Date.now()/1000) - 86401 } });
  connection.resume(); await connection.drain();
  assert.equal(store.get('old').replyStatus, 'window_expired'); assert.equal(replies, 0);
  // A fresh independent record with a ready transcript simulates recovered work.
  await store.receive({ id: 'new', patientId: 'patient-1', source: 'whatsapp', transcript: demoTranscript,
    whatsapp: { sender: '353871234567', timestamp: Math.floor(Date.now()/1000) } });
  connection.resume(); await connection.drain(); connection.resume(); await connection.drain();
  assert.equal(store.get('new').replyStatus, 'unknown'); assert.equal(replies, 1);
});

test('media download rejects oversized files and unexpected hosts before forwarding credentials', async () => {
  let calls = 0;
  const client = metaClient(environment(), async () => { calls++; return Response.json({ url: 'https://evil.example/audio', mime_type: 'audio/ogg' }); });
  await assert.rejects(client.download({ mediaId: 'media-1' }), /Unexpected media host/);
  assert.equal(calls, 1);
});

test('native webhook returns an error when persistence fails, allowing Meta to retry', async t => {
  let processed = false;
  const connection = createWhatsAppServer({ store: { receive: async () => { throw new Error('Disk unavailable'); } },
    processNote: async () => { processed = true; }, env: environment(), client: {} });
  const url = `${await listen(t, connection.server)}/webhook`, body = webhook();
  assert.equal((await fetch(url, { method: 'POST', body, headers: signed(body) })).status, 500);
  assert.equal(processed, false);
});

test('media metadata size limit prevents downloading oversized audio', async () => {
  let calls = 0;
  const client = metaClient(environment(), async () => { calls++; return Response.json({ file_size: 9 * 1024 * 1024, url: 'https://lookaside.fbsbx.com/audio' }); });
  await assert.rejects(client.download({ mediaId: 'large' }), /too large/);
  assert.equal(calls, 1);
});
