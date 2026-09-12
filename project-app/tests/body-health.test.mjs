import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBodyHealthRecord, bodyRecordDates, bodyRecordRegions, bodyEntriesAsOf } from '../src/body-record/live-data.ts';
import { voiceActivity } from '../src/voice-analysis.ts';

const voice = (id, transcript, extra = {}) => ({ id, patientId: 'local-test', source: 'local', receivedAt: '2026-09-12T12:00:00Z', status: 'saved', transcript, error: null, ...extra });
const activity = (id, body, extra = {}) => ({ id, body, title: 'Saved update', date: '2026-09-11T12:00:00Z', actor: 'user', kind: 'check-in', source: 'local', ...extra });

test('body health locates original saved voice wording across sides and retains analysis for source review', () => {
  const note = voice('multi', 'My right shoulder and left wrist are stiff. My left calf feels tight.', { analysis: { summary: 'Left hamstring pain.', sources: [] }, analysisStatus: 'completed' });
  const record = buildBodyHealthRecord(voiceActivity([note]), {}, [note]);
  assert.equal(record.length, 1);
  assert.deepEqual(bodyRecordRegions(record).sort(), ['left-calf', 'left-wrist', 'right-shoulder']);
  assert.equal(record[0].body, note.transcript);
  assert.equal(record[0].voiceNote.analysis, note.analysis);
  assert.ok(!bodyRecordRegions(record).includes('left-hamstring'));
  assert.ok(record[0].areas.every(area => note.transcript.includes(area.quote)));
});

test('sample entries, demo voice notes and other patients cannot populate the saved body record', () => {
  const notes = [voice('demo', 'My left knee hurts.', { source: 'demo' }), voice('other', 'My left knee hurts.', { patientId: 'someone-else' }), voice('mine', 'My left calf is sore.')];
  const record = buildBodyHealthRecord([activity('sample', 'My left hamstring hurts.', { source: 'sample' }), ...voiceActivity(notes)], {}, notes);
  assert.deepEqual(record.map(item => item.voiceNote.id), ['mine']);
  assert.deepEqual(bodyRecordRegions(record), ['left-calf']);
});

test('comments on sample records remain saved sources and do not inherit the parent location', () => {
  const parent = activity('sample', 'My left hamstring hurts.', { source: 'sample', region: 'left-hamstring' });
  const updates = { sample: { notes: [{ id: 'specific', actor: 'user', date: '2026-09-12T11:00:00Z', text: 'My right wrist is sore.' }, { id: 'unclear', actor: 'physio', date: '2026-09-13T11:00:00Z', text: 'Shoulder still tight.' }] } };
  const record = buildBodyHealthRecord([parent], updates, []);
  assert.equal(record.length, 2);
  assert.deepEqual(bodyRecordRegions(record), ['right-wrist']);
  assert.equal(record[1].areas.length, 0);
  assert.equal(record[1].unplaced.length, 1);
  assert.equal(record[1].entryId, 'sample');
  assert.deepEqual(bodyRecordDates(record), ['2026-09-12', '2026-09-13']);
  assert.deepEqual(bodyEntriesAsOf(record, '2026-09-12').map(item => item.id), ['comment:specific']);
});

test('processing and failed notes stay accessible without placeholder or generated anatomy', () => {
  for (const status of ['transcribing', 'failed']) {
    const note = voice(status, null, { status, analysisStatus: 'pending' });
    const record = buildBodyHealthRecord(voiceActivity([note]), {}, [note]);
    assert.equal(record.length, 1);
    assert.equal(record[0].voiceNote.id, note.id);
    assert.deepEqual(record[0].areas, []);
  }
});

test('updated transcripts replace the same entry and add new regions and dates without duplicate notes', () => {
  const pending = voice('update', null, { status: 'transcribing' });
  assert.deepEqual(bodyRecordRegions(buildBodyHealthRecord(voiceActivity([pending]), {}, [pending])), []);
  const complete = { ...pending, status: 'saved', transcript: 'Both elbows feel stiff.' };
  const later = voice('later', 'My neck is tight.', { receivedAt: '2026-09-14T12:00:00Z' });
  const record = buildBodyHealthRecord(voiceActivity([complete, complete, later]), {}, [complete, later]);
  assert.equal(record.length, 2);
  assert.deepEqual(bodyRecordRegions(bodyEntriesAsOf(record, '2026-09-12')), ['left-elbow', 'right-elbow']);
  assert.deepEqual(bodyRecordDates(record), ['2026-09-12', '2026-09-14']);
});

test('unclear or corrected regions stay unplaced, and generic activities never infer a body side', () => {
  const record = buildBodyHealthRecord([activity('unclear', 'My shoulder hurts.'), activity('correction', 'Actually, not my left knee, I meant my right knee.'), activity('generic', 'Went for a walk.', { region: 'left-hamstring' }), activity('invalid', 'My left knee hurts.', { date: 'invalid' })], {}, []);
  assert.equal(record.length, 3);
  assert.deepEqual(bodyRecordRegions(record), []);
});
