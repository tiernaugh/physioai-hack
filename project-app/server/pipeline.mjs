import { z } from 'zod';
import { analysisContext, analysisSchema } from './analysis.mjs';

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

export function createPipeline({ store, transcribe, extract, download, analyser = null }) {
  const pending = new Map(), patientTails = new Map();
  return function processNote(id, { analyseOnly = false } = {}) {
    if (pending.has(id)) return pending.get(id);
    const patientId = store.get(id)?.patientId;
    const previous = patientTails.get(patientId) || Promise.resolve();
    const work = previous.catch(() => {}).then(async () => {
      let note = store.get(id);
      if (!note) throw new Error('Note not found');
      if (!['saved', 'reviewed'].includes(note.status)) {
        try {
          if (!note.transcript) {
            await store.update(id, { status: 'transcribing', error: null });
            if (note.audio?.type === 'whatsapp') {
              if (!download) throw new Error('WhatsApp download unavailable');
              note = await store.update(id, { audio: await download(note.audio) });
            }
            const transcript = (await transcribe(note.audio)).trim();
            if (!transcript || transcript.length > 20000) throw new Error('Empty or oversized transcript');
            note = await store.update(id, { transcript, audio: null });
          }
          await store.update(id, { status: 'extracting', error: null });
          const extraction = extractionSchema.parse(await extract(note.transcript));
          note = await store.update(id, { extraction, status: 'saved', savedAt: new Date().toISOString(), error: null });
        } catch {
          await store.update(id, { status: 'failed', analysisStatus: 'waiting', error: 'Processing failed. The note is retained; retry is available.' });
          throw new Error('Voice-note processing failed');
        }
      }
      if (!analyser || note.source === 'demo') {
        return store.update(id, { analysisStatus: 'disabled' });
      }
      if (note.analysisStatus === 'completed' && !analyseOnly) return note;
      try {
        await store.update(id, { analysisStatus: 'analysing', analysisError: null });
        // Freeze the evidence snapshot so retry and review see the same source text.
        const context = note.analysisContext || analysisContext(store, note);
        await store.update(id, { analysisContext: context });
        const result = analysisSchema.parse(await analyser.analyse(note, context));
        const allowedIds = new Set(context.sources.map(source => source.id));
        if (result.comparisons.some(item => item.sourceIds.some(id => !allowedIds.has(id)))) throw new Error('Unsupported source');
        return await store.update(id, { analysisStatus: 'completed', analysisError: null,
          analysis: { ...result, provider: analyser.provider, model: analyser.model,
            createdAt: new Date().toISOString(), sources: context.sources, contextLimited: context.limited } });
      } catch {
        // A model failure never discards a successfully saved transcript.
        return store.update(id, { analysisStatus: 'failed',
          analysisError: 'AI analysis could not finish. Your transcript is saved. Retry analysis when the service is available.' });
      }
    }).finally(() => {
      pending.delete(id);
      if (patientTails.get(patientId) === work) patientTails.delete(patientId);
    });
    pending.set(id, work); patientTails.set(patientId, work);
    return work;
  };
}

export function receipt(note) {
  if (!['saved', 'reviewed'].includes(note.status)) throw new Error('Cannot acknowledge an unsaved note');
  const e = note.extraction;
  return `Saved your reported note: ${e.summary}${e.clarification ? ` Clarification needed: ${e.clarification}` : ''} Your prescribed routine has not been changed.`;
}
