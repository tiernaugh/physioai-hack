import test from 'node:test';
import assert from 'node:assert/strict';
import { extractLocally } from '../server/providers.mjs';
import { demoTranscript } from '../server/pipeline.mjs';

test('free local parser handles a straightforward exercise report', () => {
  const result = extractLocally(demoTranscript);
  assert.equal(result.exercise, 'calf raises'); assert.equal(result.sets, 3); assert.equal(result.repetitions, 10);
  assert.equal(result.side, 'left'); assert.equal(result.bodyRegion, 'ankle'); assert.equal(result.discomfort, 2);
});
test('negation, corrections, plans and multiple exercises stay unstructured for review', () => {
  for (const text of ["I didn't do three sets of ten calf raises.", 'Actually, I did two sets instead.',
    'Tomorrow I will do three sets of ten calf raises.', 'I did calf raises and squats.']) {
    const result = extractLocally(text); assert.equal(result.sets, null); assert.equal(result.exercise, null); assert.equal(result.summary, text);
  }
});
test('unreported numbers and ambiguous sides are never filled in', () => {
  const result = extractLocally('My left knee and right ankle were stiff.');
  assert.equal(result.side, 'unspecified'); assert.equal(result.discomfort, null); assert.equal(result.sets, null);
});
