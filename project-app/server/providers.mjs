import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';
import { extractionSchema } from './pipeline.mjs';
const execute = promisify(execFile);
let transcriptionTail = Promise.resolve();

// Deliberately conservative English parser. Complex/corrected/negated reports
// remain verbatim and unstructured for review instead of guessing fields.
export function extractLocally(transcript) {
  const report = { summary: transcript.slice(0, 1500), exercise: null, sets: null, repetitions: null,
    bodyRegion: null, side: 'unspecified', discomfort: null, reportedWhen: null,
    clarification: 'Automatically parsed report; please review against the original transcript.' };
  if (/\b(no|not|never|didn't|did not|without|actually|instead|correction|tomorrow|will|plan|maybe|might|should|could|would)\b/i.test(transcript)) return report;
  const words = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
  const text = transcript.toLowerCase().replace(new RegExp(`\\b(${words.join('|')})\\b`, 'g'), w => String(words.indexOf(w)));
  const exercises = [...text.matchAll(/\b(calf raises?|heel slides?|glute bridges?|knee extensions?|squats?)\b/g)];
  if (exercises.length > 1) return report;
  if (exercises.length === 1) report.exercise = exercises[0][0];
  const sets = [...text.matchAll(/\b(\d+) sets? (?:of )?(\d+)(?:\s+reps?)?\b/g)];
  if (sets.length === 1 && report.exercise) {
    if (+sets[0][1] > 0 && +sets[0][1] <= 100 && +sets[0][2] > 0 && +sets[0][2] <= 1000) {
      report.sets = +sets[0][1]; report.repetitions = +sets[0][2];
    }
  }
  const locations = [...text.matchAll(/\b(left|right|both) (ankles?|knees?|hips?|shoulders?|calf|calves|back)\b/g)];
  if (locations.length === 1) { report.side = locations[0][1]; report.bodyRegion = locations[0][2]; }
  const scores = [...text.matchAll(/\b(?:discomfort|pain)(?:\s+(?:was|is|at|of))?\s+(\d+(?:\.\d+)?)\s*(?:out of|\/)\s*10\b/g)];
  if (scores.length === 1 && +scores[0][1] <= 10) report.discomfort = +scores[0][1];
  const when = text.match(/\b(today|yesterday|this morning|this evening)\b/);
  if (when) report.reportedWhen = when[0];
  return extractionSchema.parse(report);
}

export function providers(env = process.env, run = execute) {
  const localModel = resolve('models/ggml-base.en.bin');
  const workspaceModel = fileURLToPath(new URL('../../models/ggml-base.en.bin', import.meta.url));
  const model = env.WHISPER_MODEL_PATH ? resolve(env.WHISPER_MODEL_PATH)
    : existsSync(localModel) ? localModel : workspaceModel;
  const local = {
    async ready() {
      await access(model);
      await run(env.FFMPEG_BIN || ffmpegPath, ['-version'], { timeout: 10000 });
      await run(env.WHISPER_BIN || 'whisper-cli', ['--help'], { timeout: 60000 });
    },
    async transcribe(audio) {
      if (!audio || audio.type !== 'data' || !audio.mimeType?.startsWith('audio/')) throw new Error('Audio missing');
      const bytes = Buffer.from(audio.value, 'base64');
      if (!bytes.length || bytes.length > 8 * 1024 * 1024) throw new Error('Audio must be under 8 MiB');
      const dir = await mkdtemp(join(tmpdir(), 'physio-audio-'));
      try {
        const input = join(dir, 'input'), wav = join(dir, 'input.wav'), output = join(dir, 'transcript');
        await writeFile(input, bytes, { mode: 0o600 });
        // File paths are separate argv entries, never shell interpolated. Only local decoding.
        await run(env.FFMPEG_BIN || ffmpegPath, ['-nostdin', '-v', 'error', '-protocol_whitelist', 'file,pipe',
          '-i', input, '-t', '601', '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wav], { timeout: 60000, maxBuffer: 1024 * 1024 });
        const converted = await readFile(wav);
        let offset = 12, samples = null;
        while (offset + 8 <= converted.length) {
          const size = converted.readUInt32LE(offset + 4);
          if (converted.toString('ascii', offset, offset + 4) === 'data') { samples = size; break; }
          offset += 8 + size + (size % 2);
        }
        if (samples === null || samples > 600 * 16000 * 2) throw new Error('Audio exceeds ten minutes');
        await run(env.WHISPER_BIN || 'whisper-cli', ['-m', model, '-f', wav, '-otxt', '-of', output, '-nt', '-l', env.WHISPER_LANGUAGE || 'en'],
          { timeout: 300000, maxBuffer: 2 * 1024 * 1024 });
        return (await readFile(`${output}.txt`, 'utf8')).trim();
      } finally { await rm(dir, { recursive: true, force: true }); }
    },
    extract: async transcript => extractLocally(transcript),
  };
  return { ...local, transcribe(audio) {
    const task = transcriptionTail.then(() => local.transcribe(audio));
    transcriptionTail = task.catch(() => {});
    return task;
  } };
}
