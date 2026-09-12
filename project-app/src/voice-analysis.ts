import type { ActivityEntry, CareStore } from './care-data';

export type VoiceContextSource = {
  id: string; title: string; date: string; actor: 'user' | 'physio';
  source: 'sample' | 'local' | 'whatsapp'; text: string;
};
export type VoiceAnalysis = {
  summary: string;
  comparisons: { observation: string; sourceIds: string[] }[];
  uncertainties: string[];
  questions: string[];
  provider: string; model: string; createdAt: string;
  sources: VoiceContextSource[]; contextLimited: boolean;
};
export type VoiceNote = {
  id: string; patientId: string; source: string; receivedAt: string; status: string;
  transcript: string | null; extraction?: { summary: string }; error: string | null;
  analysis?: VoiceAnalysis | null;
  analysisStatus?: 'pending' | 'waiting' | 'analysing' | 'completed' | 'failed' | 'disabled';
  analysisError?: string | null;
};
export const voiceInProgress = (note: VoiceNote) =>
  ['received', 'transcribing', 'extracting'].includes(note.status)
  || (note.status !== 'failed' && ['pending', 'analysing'].includes(note.analysisStatus || ''));

// Include human-authored care notes and session reports, never model interpretations.
// Voice transcripts are selected by the server from its patient-scoped store.
export function buildVoiceContext(entries: ActivityEntry[], care: CareStore, now = Date.now()): VoiceContextSource[] {
  const sources: VoiceContextSource[] = [];
  for (const entry of entries) {
    if (entry.actor !== 'agent' && entry.kind !== 'voice') sources.push({
      id: `activity:${entry.id}`, title: entry.title.slice(0, 300), date: entry.date,
      actor: entry.actor, source: entry.source, text: entry.body.slice(0, 6000),
    });
    for (const note of care.updates[entry.id]?.notes || []) sources.push({
      id: `comment:${note.id}`, title: `Note on ${entry.title}`.slice(0, 300), date: note.date,
      actor: note.actor, source: 'local', text: note.text.slice(0, 6000),
    });
  }
  const ids = new Set<string>();
  return sources.filter(source => source.text.trim() && Date.parse(source.date) <= now)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .filter(source => { if (ids.has(source.id)) return false; ids.add(source.id); return true; })
    .slice(0, 40).map(source => ({ ...source, date: new Date(source.date).toISOString() }));
}
export function voiceAnalysisText(analysis?: VoiceAnalysis | null) {
  if (!analysis) return '';
  return [analysis.summary, ...analysis.comparisons.map(item => `${item.observation} [${item.sourceIds.join(', ')}]`),
    ...analysis.uncertainties.map(item => `Uncertainty: ${item}`),
    ...analysis.questions.map(item => `Review question: ${item}`),
    `AI interpretation · ${analysis.provider} / ${analysis.model} · ${analysis.createdAt}`,
    ...analysis.sources.map(source => `${source.id} · ${source.date} · ${source.actor} · ${source.source}: ${source.text}`),
  ].join('\n');
}
export function voiceActivity(notes: VoiceNote[]): ActivityEntry[] {
  return notes.flatMap(note => {
    const transcribing = ['received', 'transcribing', 'extracting'].includes(note.status);
    const entries: ActivityEntry[] = [{
      id: `voice:${note.id}`, date: note.receivedAt, actor: 'user',
      title: note.status === 'failed' ? 'Voice note · needs another try' : transcribing ? 'Transcribing voice note…' : 'Voice note',
      body: note.transcript || (note.status === 'failed' ? 'Your note is saved. Open it to retry transcription.'
        : 'Your note is saved. The transcript will appear here when it’s ready.'),
      kind: 'voice', source: note.source === 'demo' ? 'sample' : note.source === 'whatsapp' ? 'whatsapp' : 'local',
    }];
    if (note.status !== 'failed' && note.analysisStatus && !['disabled', 'waiting'].includes(note.analysisStatus)) entries.push({
      id: `voice-analysis:${note.id}`, date: note.receivedAt, actor: 'agent', kind: 'insight', source: 'local',
      title: note.analysisStatus === 'completed' ? 'Your voice note, in context'
        : note.analysisStatus === 'failed' ? 'Voice note analysis · retry available' : 'Analysing your voice note…',
      body: note.analysisStatus === 'completed' ? note.analysis?.summary || ''
        : note.analysisStatus === 'failed' ? note.analysisError || 'Your transcript is saved. Open the note to retry analysis.'
          : transcribing ? 'Analysis will begin as soon as the transcript is ready.'
            : 'Comparing this update with earlier notes in your record. You can keep using the app.',
    });
    return entries;
  });
}
