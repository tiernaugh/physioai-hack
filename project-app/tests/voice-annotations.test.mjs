import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  deriveVoiceInsights,
  muscleRegion,
  sampleVoiceTranscript,
  annotationStorageKey,
  loadAnnotationEdits,
  saveAnnotationEdit,
} from "../src/voice-annotations.ts";
import { regions } from "../src/data.ts";
let memory;
beforeEach(() => {
  memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
});
test("multiple voice observations keep exact source excerpts, offsets and explicit sides", () => {
  const insights = deriveVoiceInsights(sampleVoiceTranscript);
  assert.deepEqual(
    insights.map((i) => i.region),
    ["left-hamstring", "right-shoulder", "left-calf"],
  );
  for (const insight of insights) {
    assert.equal(
      sampleVoiceTranscript.slice(insight.start, insight.end),
      insight.quote,
    );
    assert.ok(insight.needsReview);
  }
});
test("unknown sides, corrections and unsupported body areas remain unplaced", () => {
  for (const text of [
    "My shoulder is sore.",
    "It is my right wrist.",
    "Actually, not my left knee, I meant my right knee.",
    "I walked for ten minutes.",
  ]) {
    const insights = deriveVoiceInsights(text);
    assert.ok(insights.length);
    assert.ok(insights.every((i) => i.region === null));
  }
  assert.deepEqual(
    deriveVoiceInsights("My left hamstring and shoulder are tight.").map(
      (i) => i.region,
    ),
    ["left-hamstring", null],
  );
});
test("bilateral observations are indexed on both sides without rewriting negation or plans", () => {
  const text = "No pain in both calves. Tomorrow I will discuss my right knee.";
  const insights = deriveVoiceInsights(text);
  assert.deepEqual(
    insights.map((i) => i.region),
    ["left-calf", "right-calf", "right-knee"],
  );
  assert.equal(insights[0].quote, "No pain in both calves.");
  assert.equal(insights[2].quote, "Tomorrow I will discuss my right knee.");
});
test("decimal numbers and non-ASCII text do not break source offsets", () => {
  const text =
    "  I’m feeling better. My left ankle discomfort is 2.5/10.\n My right shoulder is stiff!";
  const insights = deriveVoiceInsights(text);
  assert.deepEqual(
    insights.map((i) => i.region),
    ["left-ankle", "right-shoulder"],
  );
  for (const i of insights) assert.equal(text.slice(i.start, i.end), i.quote);
  assert.match(insights[0].quote, /2\.5\/10/);
});
test("every offered annotation region resolves to geometry in the packaged atlas", () => {
  const atlas = JSON.parse(
    readFileSync(
      new URL("../public/models/muscle-atlas/atlas.json", import.meta.url),
      "utf8",
    ),
  );
  const available = new Set(
    atlas.parts.map((p) => muscleRegion(p.name)).filter(Boolean),
  );
  for (const region of regions)
    assert.ok(
      available.has(region.id),
      `No reference geometry for ${region.id}`,
    );
});
test("manual region corrections and confirmations remain scoped to their source note", () => {
  saveAnnotationEdit("note-one", "0:20:unplaced", {
    region: "right-shoulder",
    reviewed: true,
  });
  saveAnnotationEdit("note-two", "0:20:unplaced", {
    region: "left-shoulder",
    reviewed: false,
  });
  const loaded = loadAnnotationEdits();
  assert.equal(loaded.warning, null);
  assert.equal(
    loaded.edits["note-one"]["0:20:unplaced"].region,
    "right-shoulder",
  );
  assert.equal(loaded.edits["note-two"]["0:20:unplaced"].reviewed, false);
});
test("corrupt annotation edits and failed writes cannot overwrite a saved record", () => {
  localStorage.setItem(annotationStorageKey, '{"broken":[]}');
  assert.ok(loadAnnotationEdits().warning);
  assert.throws(() =>
    saveAnnotationEdit("n", "i", { region: "core", reviewed: true }),
  );
  assert.equal(localStorage.getItem(annotationStorageKey), '{"broken":[]}');
  memory.clear();
  globalThis.localStorage.setItem = () => {
    throw new Error("Quota exceeded");
  };
  assert.throws(
    () => saveAnnotationEdit("n", "i", { region: "core", reviewed: true }),
    /Quota exceeded/,
  );
});

test("exercise names do not invent additional unplaced symptom locations", () => {
  const insights = deriveVoiceInsights(
    "I did calf raises, and my left ankle discomfort was two out of ten.",
  );
  assert.deepEqual(
    insights.map((i) => i.region),
    ["left-ankle"],
  );
});
