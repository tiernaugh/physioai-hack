import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { locateAnalysisAreas, analysisMuscleRegion, regionAnchor, regionPosterior } from '../src/analysis-anatomy.ts';
import { voiceDeepDive } from '../src/voice-analysis.ts';
import { regions } from '../src/data.ts';

test('voice reviews locate explicit areas using current transcript evidence, including wrist, elbow and neck', () => {
  const transcript = 'My left hamstring is tight. My right shoulder is sore. Both wrists feel stiff. My left elbow and neck are sore.';
  const result = locateAnalysisAreas(transcript);
  assert.deepEqual(result.areas.map(area => area.region), ['left-hamstring', 'right-shoulder', 'left-wrist', 'right-wrist', 'left-elbow', 'neck']);
  for (const area of result.areas) assert.ok(transcript.includes(area.quote));
  assert.deepEqual(result.unplaced, []);
});

test('unknown sides, corrected locations and generic notes never receive a default hamstring highlight', () => {
  for (const transcript of ['My hamstring is tight.', 'My wrist is sore.', 'Actually, not my left knee, I meant my right knee.', 'I walked for ten minutes.']) {
    assert.deepEqual(locateAnalysisAreas(transcript).areas, []);
  }
  const result = locateAnalysisAreas('My left hamstring and shoulder are tight.');
  assert.deepEqual(result.areas.map(area => area.region), ['left-hamstring']);
  assert.equal(result.unplaced.length, 1);
});

test('every supported analysis area has atlas geometry and an anchor on the correct side', () => {
  const atlas = JSON.parse(readFileSync(new URL('../public/models/muscle-atlas/atlas.json', import.meta.url), 'utf8'));
  const supported = [...regions.map(region => region.id), 'left-wrist', 'right-wrist', 'left-elbow', 'right-elbow', 'neck'];
  for (const region of supported) {
    const parts = atlas.parts.filter(part => analysisMuscleRegion(part.name) === region);
    assert.ok(parts.length, `No geometry for ${region}`);
    const min = [0, 1, 2].map(i => Math.min(...parts.map(part => part.bounds[0][i])));
    const max = [0, 1, 2].map(i => Math.max(...parts.map(part => part.bounds[1][i])));
    const anchor = regionAnchor(region, [min, max]);
    assert.ok(anchor.every(Number.isFinite));
    assert.ok(anchor[1] >= min[1] && anchor[1] <= max[1]);
    if (region.startsWith('left-')) assert.ok(anchor[0] > 0, region);
    if (region.startsWith('right-')) assert.ok(anchor[0] < 0, region);
    assert.equal(anchor[2] < min[2], regionPosterior(region));
  }
});

test('shared review retains generated analysis and sources without deriving anatomy or clinical metrics from history', () => {
  const source = { id: 'earlier', title: 'Earlier note', date: '2026-09-01T12:00:00Z', actor: 'user', source: 'sample', text: 'My left calf was sore.' };
  const note = { id: 'note', receivedAt: '2026-09-12T12:00:00Z', transcript: 'My right shoulder is sore.', analysis: {
    summary: 'Right shoulder discomfort reported.', comparisons: [{ observation: 'An earlier note mentioned a different location.', sourceIds: ['earlier'] }],
    uncertainties: ['No score given.'], questions: ['When did this start?'], sources: [source], provider: 'openai', model: 'test', createdAt: '2026-09-12T12:01:00Z', contextLimited: false,
  } };
  const review = voiceDeepDive(note);
  assert.deepEqual(review.highlightRegions, ['right-shoulder']);
  assert.deepEqual(review.insights.map(insight => insight.region), ['right-shoulder']);
  assert.equal(review.insights[0].detail, note.transcript);
  assert.equal(review.sections[0].body, note.analysis.summary);
  assert.deepEqual(review.sections[1].evidenceIds, ['earlier']);
  assert.equal(review.evidence[0].detail, note.transcript);
  assert.equal(review.evidence[1].detail, source.text);
  assert.match(review.notice, /fictional sample/);
  assert.equal(review.metrics[0].value, '1');
  assert.ok(review.metrics.every(metric => !/discomfort|strength|healing/i.test(metric.label)));
  assert.deepEqual(voiceDeepDive({ ...note, transcript: 'My shoulder is sore.' }).highlightRegions, []);
});
