import { z } from 'zod';

export const extractionSchema = z.object({
  summary: z.string().min(1).max(1500),
  exercise: z.string().max(200).nullable(),
  sets: z.number().int().min(1).max(100).nullable(),
  repetitions: z.number().int().min(1).max(1000).nullable(),
  bodyRegion: z.string().max(120).nullable(),
  side: z.enum(['left', 'right', 'both', 'unspecified']),
  discomfort: z.number().min(0).max(10).nullable(),
  reportedWhen: z.string().max(200).nullable(),
  clarification: z.string().max(500).nullable(),
}).strict();

export const demoTranscript = 'Today I did three sets of ten calf raises. My left ankle discomfort was two out of ten.';
export const demoExtraction = { summary: 'Reported calf raises with left ankle discomfort.',
  exercise: 'calf raises', sets: 3, repetitions: 10, bodyRegion: 'ankle', side: 'left',
  discomfort: 2, reportedWhen: 'today', clarification: null };

export function createPipeline({ store, transcribe, extract, download }) {
  const pending = new Map();
  return function processNote(id) {
    if (pending.has(id)) return pending.get(id);
    const work = (async () => {
      let note = store.get(id);
      if (!note) throw new Error('Note not found');
      if (['saved', 'reviewed'].includes(note.status)) return note;
      try {
        if (!note.transcript) {
          await store.update(id, { status: 'transcribing', error: null });
          if (note.audio?.type === 'whatsapp') {
            if (!download) throw new Error('WhatsApp download unavailable');
            note = await store.update(id, { audio: await download(note.audio) });
          }
          const transcript = (await transcribe(note.audio)).trim();
          if (!transcript || transcript.length > 20000) throw new Error('Empty or oversized transcript');
          // Discard raw audio once the transcript is durably stored.
          note = await store.update(id, { transcript, audio: null });
        }
        await store.update(id, { status: 'extracting', error: null });
        const extraction = extractionSchema.parse(await extract(note.transcript));
        return await store.update(id, { extraction, status: 'saved', savedAt: new Date().toISOString(), error: null });
      } catch {
        // Provider errors can contain sensitive payloads; don't expose them in the inbox.
        await store.update(id, { status: 'failed', error: 'Processing failed. The note is retained; retry is available.' });
        throw new Error('Voice-note processing failed');
      }
    })().finally(() => pending.delete(id));
    pending.set(id, work);
    return work;
  };
}

export function receipt(note) {
  if (!['saved', 'reviewed'].includes(note.status)) throw new Error('Cannot acknowledge an unsaved note');
  const e = note.extraction;
  return `Saved your reported note: ${e.summary}${e.clarification ? ` Clarification needed: ${e.clarification}` : ''} Your prescribed routine has not been changed.`;
}
