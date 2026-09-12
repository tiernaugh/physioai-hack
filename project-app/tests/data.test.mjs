import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  exercises,
  regions,
  seedSessions,
  isSession,
  loadSessions,
  exportProfile,
  storageKey,
} from "../src/data.ts";

let memory;
beforeEach(() => {
  memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
});

test("every routine association resolves to a stable region and the seed records validate", () => {
  for (const exercise of exercises)
    assert.ok(regions.some((region) => region.id === exercise.region));
  for (const session of seedSessions) assert.ok(isSession(session));
  assert.equal(new Set(regions.map((r) => r.id)).size, regions.length);
});

test("partial sets and an unreported score survive a storage reload", () => {
  const session = {
    ...seedSessions[0],
    id: "partial-demo",
    completed: { bridge: 1 },
    discomfort: null,
    source: "demo-entry",
  };
  localStorage.setItem(storageKey, JSON.stringify([session]));
  assert.deepEqual(loadSessions(), { sessions: [session], warning: null });
});

test("corrupt stored records remain untouched and produce an explicit warning", () => {
  for (const raw of [
    "{broken",
    "{}",
    "[null]",
    JSON.stringify([{ ...seedSessions[0], completed: { bridge: 99 } }]),
  ]) {
    localStorage.setItem(storageKey, raw);
    const loaded = loadSessions();
    assert.ok(loaded.warning);
    assert.deepEqual(loaded.sessions, seedSessions);
    assert.equal(localStorage.getItem(storageKey), raw);
  }
});

test("invalid scores, dates, sources, and unknown exercises cannot become saved sessions", () => {
  for (const patch of [
    { discomfort: 11 },
    { discomfort: -1 },
    { discomfort: 1.5 },
    { date: "never" },
    { source: "clinician" },
    { completed: { invented: 3 } },
    { completed: [] },
  ]) {
    assert.equal(isSession({ ...seedSessions[0], ...patch }), false);
  }
});

test("Markdown export preserves partial sets, unknown discomfort, and mock provenance", () => {
  const text = exportProfile([
    {
      ...seedSessions[0],
      completed: { bridge: 1 },
      discomfort: null,
      source: "demo-entry",
    },
  ]);
  for (const required of [
    "data_kind: mock",
    "plan_revision: 1",
    "Double-leg bridge: 1/3 sets",
    "Heel-dig isometric: 0/5 sets",
    "Reported discomfort: not recorded",
    "Unknown in this mock record",
    "Source: demo-entry",
  ])
    assert.ok(text.includes(required), required);
});
