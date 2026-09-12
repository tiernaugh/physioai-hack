export type Region = 'shoulder' | 'elbow';
export type Annotation = { id: string; region: Region | null; text: string; source: string; date?: string };
export type Observation = { id: string; region: Region; text: string; date: string };
export const locations: Record<Region, { label: string; anchorPart: string }> = {
  shoulder: { label: 'Left shoulder', anchorPart: 'FJ1467M' },
  elbow: { label: 'Left elbow', anchorPart: 'FJ1485M' },
};
// These are landmarks on the reference atlas, not identified injured muscles.
export const sampleTranscript = 'Alex described tightness around the left shoulder when reaching overhead. We discussed keeping a record of when it happens. Alex also mentioned stiffness around the left elbow after sitting at the desk. We will revisit both observations at the next consultation.';
export const sampleProposals = (): Annotation[] => [
  { id: 'sample-shoulder', region: 'shoulder', text: 'Tightness reported when reaching overhead. Keep a record of when it happens.', source: 'Alex described tightness around the left shoulder when reaching overhead. We discussed keeping a record of when it happens.' },
  { id: 'sample-elbow', region: 'elbow', text: 'Stiffness reported after sitting at the desk. Revisit at the next consultation.', source: 'Alex also mentioned stiffness around the left elbow after sitting at the desk. We will revisit both observations at the next consultation.' },
];
// Authored demo scenario, separate from the supplied Studio 22 assessment.
// No measurements, diagnosis or prescribed treatment are invented for this client.
export const baseline: Annotation[] = [
  { id: 'baseline-shoulder-1', region: 'shoulder', date: '7 Sep 2026', text: 'Tightness at the front of the left shoulder when reaching overhead. Alex first noticed it while putting a bag on a high shelf; carrying it at waist height felt comfortable.', source: 'Alex: “It’s the reaching up that I notice, like putting my bag on the shelf. Carrying it down by my side feels fine.”' },
  { id: 'baseline-shoulder-2', region: 'shoulder', date: '7 Sep 2026', text: 'At the next session, revisit overhead reaching and compare Alex’s notes about when the tightness appears.', source: 'Stephen: “Keep a note of when you notice it. We’ll go back through those examples and check the overhead reach again when you’re in on the 21st.”' },
  { id: 'baseline-elbow-1', region: 'elbow', date: '7 Sep 2026', text: 'Stiffness around the left elbow after longer periods at the desk. Alex reports that it eases after getting up and moving around.', source: 'Alex: “After a couple of hours at the laptop, the elbow feels stiff. Once I get up and move around, it usually eases.”' },
  { id: 'baseline-elbow-2', region: 'elbow', date: '7 Sep 2026', text: 'Track whether the elbow stiffness occurs away from the desk too. No strength measurements were recorded at this consultation.', source: 'Stephen: “Let’s note whether you’re feeling it at other times as well. We haven’t taken any strength measurements today.”' },
];
export const initialObservations: Observation[] = [
  { id: 'observation-shoulder', region: 'shoulder', date: '9 Sep 2026', text: 'Noticed the shoulder again putting a suitcase in the overhead rack. Fine carrying it through the station.' },
  { id: 'observation-elbow', region: 'elbow', date: '10 Sep 2026', text: 'Elbow felt stiff after the afternoon calls. Didn’t notice it on my walk afterwards.' },
];
export const consultation = {
  date: '7 Sep 2026', nextReview: '21 Sep 2026',
  summary: 'Overhead reaching brings on left shoulder tightness. Left elbow stiffness is most noticeable after time at the desk.',
  followUp: 'Review overhead reaching and the notes you’ve added between sessions. Check whether elbow stiffness also occurs away from the desk.',
};
export function canConfirm(items: Annotation[]) {
  return items.length > 0 && items.every(item => item.region !== null && item.text.trim().length > 0);
}

// Authored self-report examples, not measurements from the Studio 22 report.
export const progressRecords: Record<Region, { activity: string; before: number; after: number; beforeQuote: string; afterQuote: string }> = {
  shoulder: { activity: 'Discomfort reaching overhead', before: 5, after: 3, beforeQuote: 'Reaching to the high shelf feels about five out of ten.', afterQuote: 'I still notice it reaching up, but I’d put it at three out of ten now.' },
  elbow: { activity: 'Stiffness after desk work', before: 2, after: 2, beforeQuote: 'After a long stretch at the laptop, I’d call the stiffness two out of ten.', afterQuote: 'Still around two out of ten after sitting at the desk. It eases when I move.' },
};
export function progressStatus(region: Region) {
  const { before, after } = progressRecords[region];
  return after < before ? 'Improved' : after > before ? 'Worsened' : 'Unchanged';
}

// Authored display groups, not inferred injury locations or muscle-specific scores.
export const progressMuscles: Record<Region, { label: string; ids: string[] }> = {
  shoulder: { label: 'Left deltoid', ids: ['FJ1467M', 'FJ1468M', 'FJ1513M'] },
  elbow: { label: 'Left brachialis and brachioradialis', ids: ['FJ1486M', 'FJ1487M'] },
};
