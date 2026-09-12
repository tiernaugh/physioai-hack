import { locateAnalysisAreas } from '../analysis-anatomy.ts';
import type { AnalysisRegion, LocatedArea } from '../analysis-anatomy';
import { dayKey } from '../care-data.ts';
import type { ActivityEntry, CareStore } from '../care-data';
import { buildProgressTimeline } from '../progress-timeline.ts';
import type { TimelineItem } from '../progress-timeline';
import type { VoiceNote } from '../voice-analysis';

export type BodyHealthEntry = TimelineItem & {
  areas: LocatedArea[];
  unplaced: string[];
  voiceNote?: VoiceNote;
};

// Index original saved words only. Generated summaries, parent-note locations and
// demo fixtures cannot create a body location, severity or a health score.
export function buildBodyHealthRecord(entries: ActivityEntry[], updates: CareStore['updates'], voiceNotes: VoiceNote[]): BodyHealthEntry[] {
  const notes = new Map(voiceNotes.filter(note => ['demo-alex', 'local-test'].includes(note.patientId) && note.source !== 'demo').map(note => [note.id, note]));
  return buildProgressTimeline(entries, updates)
    .filter(item => item.source !== 'sample' && item.actor !== 'agent' && Number.isFinite(Date.parse(item.date)))
    .flatMap(item => {
      const voiceId = item.kind === 'voice' && item.entryId.startsWith('voice:') ? item.entryId.slice(6) : undefined;
      const voiceNote = voiceId ? notes.get(voiceId) : undefined;
      if (voiceId && !voiceNote) return [];
      const body = voiceNote ? voiceNote.transcript || item.body : item.body;
      const located = locateAnalysisAreas(voiceNote ? voiceNote.transcript || '' : body);
      return [{ ...item, body, ...located, voiceNote }];
    });
}

export const bodyRecordDates = (items: BodyHealthEntry[]) => [...new Set(items.map(item => dayKey(item.date)))].sort();
export const bodyEntriesAsOf = (items: BodyHealthEntry[], date: string) => items.filter(item => dayKey(item.date) <= date);
export function bodyRecordRegions(items: BodyHealthEntry[]): AnalysisRegion[] {
  return [...new Set(items.flatMap(item => item.areas.map(area => area.region)))];
}
