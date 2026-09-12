import { locateAnalysisAreas } from './analysis-anatomy.ts';
import type { AgentAnalysis } from './agent-analysis';
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


export function voiceDeepDive(note: VoiceNote): AgentAnalysis | null {
  const analysis = note.analysis;
  if (!analysis) return null;
  const { areas, unplaced } = locateAnalysisAreas(note.transcript || '');
  const sample = analysis.sources.some(source => source.source === 'sample');
  const date = (value: string) => new Date(value).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
  return {
    id: `voice-${note.id}`,
    kicker: 'VOICE NOTE REVIEW', takeaway: 'Your update, connected to your record.',
    period: date(note.receivedAt), provenance: `OpenAI analysis · ${analysis.model} · for review`,
    notice: sample ? 'Includes fictional sample notes. Comparisons with sample history are demo context, not verified personal history.' : undefined,
    metrics: [
      { value: String(areas.length), label: 'Areas located', detail: areas.length ? 'Explicitly named in this note' : 'No clear location in this note' },
      { value: String(analysis.sources.length), label: 'Earlier notes considered', detail: analysis.contextLimited ? 'Limited recent context' : 'Context saved with this review' },
      { value: String(analysis.questions.length), label: 'Questions to review', detail: 'For your next conversation' },
    ],
    anatomyTitle: 'Where your note connects',
    anatomyCaption: areas.length ? areas.map(area => area.label).join(', ') : 'No clear body area specified',
    anatomyLegend: areas.length ? 'Amber: areas mentioned in this note' : 'No area highlighted · location unclear',
    highlightRegions: areas.map(area => area.region),
    insights: areas.map(area => ({ label: area.label, title: 'In your own words',
      detail: area.quote, region: area.region, sourceLabel: 'Current voice note · exact transcript excerpt' })),
    unplaced: unplaced.length ? unplaced : areas.length ? [] : ['This note does not name a supported body area and side. No location has been assumed.'],
    sections: [{ title: 'What you reported', body: analysis.summary, evidenceIds: [`voice:${note.id}`] },
      ...analysis.comparisons.map((comparison, index) => ({ title: `Connection with earlier notes · ${index + 1}`,
        body: comparison.observation, evidenceIds: comparison.sourceIds }))],
    uncertainty: [...analysis.uncertainties, ...(unplaced.length ? ['Some wording does not establish a clear body area or side; it remains unplaced.'] : []),
      'This is an AI interpretation of reported notes. Your care plan has not changed.'].join(' '),
    questions: analysis.questions,
    evidence: [{ id: `voice:${note.id}`, label: `${date(note.receivedAt)} · Current voice note`, detail: note.transcript || 'Transcript unavailable.' },
      ...analysis.sources.map(source => ({ id: source.id,
        label: `${date(source.date)} · ${source.title} · ${source.source === 'sample' ? 'Sample context' : source.actor === 'physio' ? 'Physio note' : 'Reported note'}`,
        detail: source.text }))],
  };
}
