import { demoToday } from '../care-data.ts';

// Single source of truth for the dated body record. All dates are ISO (YYYY-MM-DD) so they compare as strings.
// Scores, check-ins and events are authored demo self-reports for the prototype, not measurements.
export type Region = 'shoulder' | 'elbow' | 'hamstring';
export type Status = 'improved' | 'unchanged' | 'worsened' | 'none';
export type Annotation = { id: string; region: Region | null; text: string; source: string; date?: string };
export type Observation = { id: string; region: Region; text: string; date: string };
export type CheckIn = { date: string; region: Region; score: number; activity: string; quote: string }; // score: 0–10 discomfort, 0 = none
export type RecordEvent = { date: string; region: Region; kind: 'flare'; text: string };

export const locations: Record<Region, { label: string; anchorPart: string }> = {
  shoulder: { label: 'Left shoulder', anchorPart: 'FJ1467M' },
  elbow: { label: 'Left elbow', anchorPart: 'FJ1485M' },
  hamstring: { label: 'Left hamstring', anchorPart: 'FJ1436M' },
};
// These are landmarks on the reference atlas, not identified injured muscles.
// Authored display groups, not inferred injury locations or muscle-specific scores. Hamstring ids match BodyViewer's LEFT_HAMSTRING_IDS.
export const progressMuscles: Record<Region, { label: string; ids: string[] }> = {
  shoulder: { label: 'Left deltoid', ids: ['FJ1467M', 'FJ1468M', 'FJ1513M'] },
  elbow: { label: 'Left brachialis and brachioradialis', ids: ['FJ1486M', 'FJ1487M'] },
  hamstring: { label: 'Left biceps femoris, semitendinosus and semimembranosus', ids: ['FJ1395M', 'FJ1444M', 'FJ1435M', 'FJ1436M'] },
};

// Timeline spine: the same six dates as care-data snapshots, so the record and the Today view scrub together.
export const timeline = ['2026-07-20', '2026-08-03', '2026-08-17', '2026-08-31', '2026-09-07', demoToday];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function formatDate(date: string, withYear = false) {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number);
  return `${day} ${months[month - 1]}${withYear ? ` ${year}` : ''}`;
}

export const sampleTranscript = 'Alex described tightness around the left shoulder when reaching overhead. We discussed keeping a record of when it happens. Alex also mentioned stiffness around the left elbow after sitting at the desk. We will revisit both observations at the next consultation.';
export const sampleProposals = (): Annotation[] => [
  { id: 'sample-shoulder', region: 'shoulder', text: 'Tightness reported when reaching overhead. Keep a record of when it happens.', source: 'Alex described tightness around the left shoulder when reaching overhead. We discussed keeping a record of when it happens.' },
  { id: 'sample-elbow', region: 'elbow', text: 'Stiffness reported after sitting at the desk. Revisit at the next consultation.', source: 'Alex also mentioned stiffness around the left elbow after sitting at the desk. We will revisit both observations at the next consultation.' },
];
// Authored demo scenario, separate from the supplied Studio 22 assessment.
// No measurements, diagnosis or prescribed treatment are invented for this client.
export const baseline: Annotation[] = [
  { id: 'baseline-shoulder-1', region: 'shoulder', date: '2026-09-07', text: 'Tightness at the front of the left shoulder when reaching overhead. Alex first noticed it while putting a bag on a high shelf; carrying it at waist height felt comfortable.', source: 'Alex: “It’s the reaching up that I notice, like putting my bag on the shelf. Carrying it down by my side feels fine.”' },
  { id: 'baseline-shoulder-2', region: 'shoulder', date: '2026-09-07', text: 'At the next session, revisit overhead reaching and compare Alex’s notes about when the tightness appears.', source: 'Stephen: “Keep a note of when you notice it. We’ll go back through those examples and check the overhead reach again when you’re in on the 17th.”' },
  { id: 'baseline-elbow-1', region: 'elbow', date: '2026-09-07', text: 'Stiffness around the left elbow after longer periods at the desk. Alex reports that it eases after getting up and moving around.', source: 'Alex: “After a couple of hours at the laptop, the elbow feels stiff. Once I get up and move around, it usually eases.”' },
  { id: 'baseline-elbow-2', region: 'elbow', date: '2026-09-07', text: 'Track whether the elbow stiffness occurs away from the desk too. No strength measurements were recorded at this consultation.', source: 'Stephen: “Let’s note whether you’re feeling it at other times as well. We haven’t taken any strength measurements today.”' },
  { id: 'baseline-hamstring-1', region: 'hamstring', date: '2026-07-20', text: 'Alex would like to return to comfortable longer walks. Record how the left hamstring feels after walks and after each home session.', source: 'Stephen: “Let’s keep a simple note of how the hamstring feels after you walk and after each session, so we can see the pattern together.”' },
];
export const initialObservations: Observation[] = [
  { id: 'observation-hamstring', region: 'hamstring', date: '2026-09-06', text: 'Completed the routine. Hamstring felt about three out of ten afterwards, easier than last month.' },
  { id: 'observation-shoulder', region: 'shoulder', date: '2026-09-09', text: 'Noticed the shoulder again putting a suitcase in the overhead rack. Fine carrying it through the station.' },
  { id: 'observation-elbow', region: 'elbow', date: '2026-09-10', text: 'Elbow felt stiff after the afternoon calls. Didn’t notice it on my walk afterwards.' },
];
export const consultation = {
  date: '2026-09-07', nextReview: '2026-09-17', // nextReview matches care-data nextAppointment
  summary: 'Overhead reaching brings on left shoulder tightness. Left elbow stiffness is most noticeable after time at the desk. Left hamstring discomfort on walks continues to ease.',
  followUp: 'Review overhead reaching and the notes you’ve added between sessions. Check whether elbow stiffness also occurs away from the desk.',
};
export function canConfirm(items: Annotation[]) {
  return items.length > 0 && items.every(item => item.region !== null && item.text.trim().length > 0);
}

// Authored demo self-reports on spine dates. Not every region reports on every date; a first report has nothing to compare against.
// Hamstring scores follow the care-data snapshots' discomfort column (6 → 2).
export const checkIns: CheckIn[] = [
  { date: '2026-07-20', region: 'hamstring', score: 6, activity: 'Discomfort on longer walks', quote: 'By the end of a walk the back of my left thigh is about six out of ten.' },
  { date: '2026-08-03', region: 'hamstring', score: 5, activity: 'Discomfort on longer walks', quote: 'Still there on the walk home, maybe five out of ten now.' },
  { date: '2026-08-17', region: 'hamstring', score: 4, activity: 'Discomfort on longer walks', quote: 'I’d say four. I got round the park without stopping.' },
  { date: '2026-08-31', region: 'hamstring', score: 3, activity: 'Discomfort on longer walks', quote: 'About three out of ten after the weekend walk.' },
  { date: '2026-09-07', region: 'hamstring', score: 3, activity: 'Discomfort on longer walks', quote: 'Same as last time, three out of ten. It settles once I sit down.' },
  { date: '2026-09-12', region: 'hamstring', score: 2, activity: 'Discomfort on longer walks', quote: 'The stairs felt easier this morning. I’d put the walk at two out of ten.' },
  { date: '2026-08-03', region: 'elbow', score: 4, activity: 'Stiffness after desk work', quote: 'The elbow has been sharper than usual this week after the laptop, about four out of ten.' },
  { date: '2026-08-17', region: 'elbow', score: 2, activity: 'Stiffness after desk work', quote: 'Back to about two out of ten after a long stretch at the desk.' },
  { date: '2026-09-07', region: 'elbow', score: 2, activity: 'Stiffness after desk work', quote: 'After a long stretch at the laptop, I’d call the stiffness two out of ten.' },
  { date: '2026-09-12', region: 'elbow', score: 2, activity: 'Stiffness after desk work', quote: 'Still around two out of ten after sitting at the desk. It eases when I move.' },
  { date: '2026-09-07', region: 'shoulder', score: 5, activity: 'Discomfort reaching overhead', quote: 'Reaching to the high shelf feels about five out of ten.' },
  { date: '2026-09-12', region: 'shoulder', score: 3, activity: 'Discomfort reaching overhead', quote: 'I still notice it reaching up, but I’d put it at three out of ten now.' },
];
// Reported flare-ups. A flare on a date forces that date's status to 'worsened' regardless of scores.
export const events: RecordEvent[] = [
  { date: '2026-08-03', region: 'elbow', kind: 'flare', text: 'Alex reported the left elbow feeling noticeably stiffer than usual this week.' },
];

// Derived helpers. Status is computed from the record above, never hand-set.
const sortByDate = <T extends { date: string }>(items: T[]) => [...items].sort((a, b) => a.date.localeCompare(b.date));
export function checkInsAsOf(region: Region, date: string) {
  return sortByDate(checkIns.filter(item => item.region === region && item.date <= date));
}
export function latestCheckIn(region: Region, date: string): CheckIn | undefined {
  return checkInsAsOf(region, date).at(-1);
}
export function changeAt(region: Region, date: string): { before?: CheckIn; after?: CheckIn; status: Status } {
  const history = checkInsAsOf(region, date), after = history.at(-1), before = history.at(-2);
  const flare = events.some(event => event.region === region && event.kind === 'flare' && event.date === date);
  const status: Status = flare ? 'worsened' : !after || !before ? 'none' : after.score < before.score ? 'improved' : after.score > before.score ? 'worsened' : 'unchanged';
  return { before, after, status };
}
export function statusAt(region: Region, date: string): Status {
  return changeAt(region, date).status;
}
export function eventsAt(region: Region, date: string) {
  return events.filter(event => event.region === region && event.date === date);
}
// Undated annotations are ones confirmed during this visit, so they count as today.
export function annotationsAsOf(items: Annotation[], date: string) {
  return items.filter(item => (item.date ?? demoToday) <= date);
}
export function observationsAsOf(items: Observation[], date: string) {
  return items.filter(item => item.date <= date);
}
// One point per spine date for a sparkline; null where the region has no check-in on that date.
export function seriesFor(region: Region): { date: string; score: number | null }[] {
  return timeline.map(date => ({ date, score: checkIns.find(item => item.region === region && item.date === date)?.score ?? null }));
}
