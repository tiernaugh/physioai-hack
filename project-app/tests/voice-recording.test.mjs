import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceRecording, maxAudioBytes } from '../src/voice-recording.ts';

function fixture(t, options = {}) {
  const states = [], errors = [], completed = [], requests = [];
  const track = { readyState: 'live', onended: null, stop() { this.readyState = 'ended'; } };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  let recorder;
  class Recorder {
    static isTypeSupported(type) { return type === (options.type || 'audio/webm;codecs=opus'); }
    constructor(_stream, settings) { this.mimeType = settings.mimeType; this.state = 'inactive'; recorder = this; }
    start() {
      if (options.startError) throw options.startError;
      this.state = 'recording';
    }
    emit(data) { this.ondataavailable?.({ data: new Blob([data], { type: this.mimeType }) }); }
    stop() {
      this.state = 'inactive';
      queueMicrotask(() => {
        if (!options.empty) this.emit('final audio chunk');
        this.onstop?.();
      });
    }
  }
  for (const [key, value] of Object.entries({
    isSecureContext: options.secure !== false,
    navigator: { mediaDevices: { getUserMedia: async constraints => {
      requests.push(constraints);
      if (options.permissionError) throw options.permissionError;
      return options.acquire ? options.acquire : stream;
    } } },
    MediaRecorder: options.unsupported ? undefined : Recorder,
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const controller = createVoiceRecording({
    onState: value => states.push(value), onTime: () => {},
    onError: value => errors.push(value), onComplete: (file, notice) => completed.push({ file, notice }),
  });
  t.after(() => controller.cancel());
  return { controller, states, errors, completed, requests, stream, track, get recorder() { return recorder; } };
}

test('stop includes the final audio chunk, releases the microphone and returns an audio file', async t => {
  const f = fixture(t);
  await f.controller.start();
  f.recorder.emit('first chunk');
  f.controller.stop();
  assert.equal(f.track.readyState, 'ended');
  await Promise.resolve();
  assert.deepEqual(f.requests, [{ audio: true }]);
  assert.deepEqual(f.states, ['requesting', 'recording', 'stopping', 'idle']);
  assert.equal(f.completed.length, 1);
  assert.equal(await f.completed[0].file.text(), 'first chunkfinal audio chunk');
  assert.equal(f.completed[0].file.type, 'audio/webm;codecs=opus');
  assert.match(f.completed[0].file.name, /^voice-note-.*\.webm$/);
  assert.deepEqual(f.errors, []);
});

test('MP4-only browsers produce an M4A file with its audio MIME type', async t => {
  const f = fixture(t, { type: 'audio/mp4' });
  await f.controller.start();
  f.controller.stop();
  await Promise.resolve();
  assert.match(f.completed[0].file.name, /\.m4a$/);
  assert.equal(f.completed[0].file.type, 'audio/mp4');
});

test('cancelling pending permission releases a microphone granted later without recording', async t => {
  let grant;
  const f = fixture(t, { acquire: new Promise(resolve => { grant = resolve; }) });
  const starting = f.controller.start();
  f.controller.cancel();
  grant(f.stream);
  await starting;
  assert.equal(f.track.readyState, 'ended');
  assert.equal(f.recorder, undefined);
  assert.deepEqual(f.states, ['requesting']);
  assert.deepEqual(f.completed, []);
});

test('cancel/unmount discards active audio and prevents late stop callbacks', async t => {
  const f = fixture(t);
  await f.controller.start();
  f.recorder.emit('discard this');
  f.controller.stop();
  f.controller.cancel();
  await Promise.resolve();
  assert.equal(f.track.readyState, 'ended');
  assert.deepEqual(f.completed, []);
  assert.deepEqual(f.errors, []);
});

test('permission denial provides recovery instructions without producing audio', async t => {
  const f = fixture(t, { permissionError: new DOMException('Denied', 'NotAllowedError') });
  await f.controller.start();
  assert.equal(f.states.at(-1), 'idle');
  assert.match(f.errors[0], /Allow microphone access/);
  assert.deepEqual(f.completed, []);
});

for (const [label, options, message] of [
  ['insecure origins', { secure: false }, /HTTPS or localhost/],
  ['browsers without MediaRecorder', { unsupported: true }, /does not support/],
]) {
  test(`${label} offer an upload fallback without requesting the microphone`, async t => {
    const f = fixture(t, options);
    await f.controller.start();
    assert.match(f.errors[0], message);
    assert.deepEqual(f.requests, []);
  });
}

for (const options of [{ type: 'audio/unsupported' }, { startError: new DOMException('Unsupported', 'NotSupportedError') }]) {
  test(`unsupported ${options.type ? 'codecs' : 'encoders'} release the acquired microphone`, async t => {
    const f = fixture(t, options);
    await f.controller.start();
    assert.match(f.errors[0], /supported audio format/);
    assert.equal(f.track.readyState, 'ended');
    assert.deepEqual(f.completed, []);
  });
}

test('empty recordings cannot be submitted as successful captures', async t => {
  const f = fixture(t, { empty: true });
  await f.controller.start();
  f.controller.stop();
  await Promise.resolve();
  assert.match(f.errors[0], /No audio was captured/);
  assert.deepEqual(f.completed, []);
  assert.equal(f.track.readyState, 'ended');
});

test('microphone disconnection finishes captured audio with a review notice', async t => {
  const f = fixture(t);
  await f.controller.start();
  f.recorder.emit('before disconnect');
  f.track.onended();
  await Promise.resolve();
  assert.match(f.completed[0].notice, /Microphone disconnected/);
  assert.equal(f.track.readyState, 'ended');
});

test('encoder errors discard the attempt and turn off the microphone', async t => {
  const f = fixture(t);
  await f.controller.start();
  f.recorder.onerror();
  await Promise.resolve();
  assert.match(f.errors[0], /interrupted/);
  assert.deepEqual(f.completed, []);
  assert.equal(f.track.readyState, 'ended');
});

test('recording stops automatically before the backend duration limit', async t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const f = fixture(t);
  await f.controller.start();
  t.mock.timers.tick(599_000);
  await Promise.resolve();
  assert.equal(f.track.readyState, 'ended');
  assert.match(f.completed[0].notice, /ten-minute limit/);
  assert.ok(f.completed[0].file.size > 0);
});

test('the size guard stops early, preserving room for the final encoder chunk', async t => {
  const f = fixture(t);
  await f.controller.start();
  f.recorder.emit(new Uint8Array(maxAudioBytes - 128 * 1024));
  await Promise.resolve();
  assert.match(f.completed[0].notice, /size limit/);
  assert.ok(f.completed[0].file.size <= maxAudioBytes);
  assert.equal(f.track.readyState, 'ended');
});

test('oversized chunks are rejected and the microphone is released', async t => {
  const f = fixture(t);
  await f.controller.start();
  f.recorder.emit(new Uint8Array(maxAudioBytes + 1));
  await Promise.resolve();
  assert.match(f.errors[0], /exceeded 8 MiB/);
  assert.deepEqual(f.completed, []);
  assert.equal(f.track.readyState, 'ended');
});
