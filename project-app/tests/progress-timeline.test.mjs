import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProgressTimeline, layoutTimelineTrack, timelineRange, timelineTrack } from "../src/progress-timeline.ts";
import { sampleActivity, snapshots, sessionActivity } from "../src/care-data.ts";
import { seedSessions } from "../src/data.ts";
import { voiceActivity } from "../src/voice-analysis.ts";

const voice = (id, date, status = "completed") => ({
  id, receivedAt: date, patientId: "demo-alex", source: "local", status,
  transcript: status === "completed" ? `Original words for ${id}` : null, error: null,
  analysisStatus: "pending",
});

test("the graph includes every activity and voice note, including pending transcription and analysis", () => {
  const entries = [...sampleActivity, ...sessionActivity(seedSessions), ...voiceActivity([
    voice("saved", "2026-09-12T12:00:00Z"), voice("pending", "2026-09-12T12:01:00Z", "transcribing"),
  ])];
  const timeline = buildProgressTimeline(entries, {});
  assert.equal(timeline.length, entries.length);
  assert.deepEqual(new Set(timeline.map(item => item.entryId)), new Set(entries.map(entry => entry.id)));
  for (const entry of entries) assert.equal(timeline.find(item => item.entryId === entry.id).body, entry.body);
  assert.equal(timeline.filter(item => timelineTrack(item) === "voice").length, 2);
  assert.equal(timeline.find(item => item.entryId === "voice-analysis:saved").actor, "agent");
});

test("added comments keep their own date, author, exact text and link to the original entry", () => {
  const entry = sampleActivity.find(item => item.id === "appointment-20");
  const note = { id: "later-comment", actor: "physio", date: "2026-10-02T09:00:00Z", text: "A later question.\nKeep the original wording." };
  const timeline = buildProgressTimeline([entry], { [entry.id]: { done: false, by: "user", date: entry.date, notes: [note] } });
  assert.equal(timeline.length, 2);
  const comment = timeline.find(item => item.kind === "comment");
  assert.equal(comment.entryId, entry.id);
  assert.equal(comment.date, note.date);
  assert.equal(comment.body, note.text);
  assert.equal(comment.source, "local");
  assert.equal(timelineTrack(comment), "physio");
});

test("the date range includes activity before and after all sample scores without inventing scores", () => {
  const original = structuredClone(snapshots);
  const entries = voiceActivity([voice("older", "2026-06-01T12:00:00Z"), voice("newer", "2026-10-02T12:00:00Z")]);
  const timeline = buildProgressTimeline(entries, {});
  const range = timelineRange(timeline, snapshots);
  assert.equal(range.fraction("2026-06-01"), 0);
  assert.equal(range.fraction("2026-10-02"), 1);
  for (const item of [...timeline, ...snapshots]) assert.ok(range.fraction(item.date) >= 0 && range.fraction(item.date) <= 1);
  assert.deepEqual(snapshots, original);
});

test("every same-day record has a separate clickable position without overlap or truncation", () => {
  const items = buildProgressTimeline(voiceActivity(Array.from({ length: 30 }, (_, i) => voice(`same-day-${i}`, "2026-09-12T12:00:00Z"))), {});
  const { fraction } = timelineRange(items, snapshots);
  const { placements, height } = layoutTimelineTrack(items.filter(item => timelineTrack(item) === "voice"), fraction);
  assert.equal(placements.length, 30);
  assert.equal(new Set(placements.map(item => item.lane)).size, 30);
  assert.ok(height >= 30 * 38);
  assert.ok(placements.every(item => item.position === 100));
});

test("nearby dates have collision-free lanes and repeated imports do not duplicate graph markers", () => {
  const entries = [...sampleActivity, ...sampleActivity];
  const items = buildProgressTimeline(entries, {});
  assert.equal(items.length, sampleActivity.length);
  const { fraction } = timelineRange(items, snapshots);
  const { placements } = layoutTimelineTrack(items, fraction);
  for (const [index, a] of placements.entries()) for (const b of placements.slice(index + 1)) {
    if (a.lane === b.lane) assert.ok(b.left - a.right >= 10 - 1e-8);
  }
});
