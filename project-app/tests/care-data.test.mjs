import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  careStorageKey,
  isCareStore,
  loadCareStore,
  saveCareStore,
  sessionActivity,
  sampleActivity,
} from "../src/care-data.ts";
import { seedSessions } from "../src/data.ts";
let memory;
beforeEach(() => {
  memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
});
test("activity completion and notes retain both human authors after reload", () => {
  const data = {
    version: 1,
    entries: [],
    updates: {
      "agent-12": {
        done: true,
        by: "physio",
        date: "2026-09-12T10:00:00Z",
        notes: [
          {
            id: "one",
            actor: "user",
            date: "2026-09-12T09:00:00Z",
            text: "Question for the review.",
          },
          {
            id: "two",
            actor: "physio",
            date: "2026-09-12T10:00:00Z",
            text: "Added to our discussion.",
          },
        ],
      },
    },
  };
  saveCareStore(data);
  assert.deepEqual(loadCareStore(), { data, warning: null });
});
test("corrupt activity data stays untouched and exposes a warning", () => {
  for (const raw of [
    "{broken",
    "[]",
    JSON.stringify({
      version: 1,
      entries: [],
      updates: { x: { done: true, notes: [] } },
    }),
  ]) {
    localStorage.setItem(careStorageKey, raw);
    assert.ok(loadCareStore().warning);
    assert.equal(localStorage.getItem(careStorageKey), raw);
  }
});
test("unknown actors, regions, and invalid dates cannot be saved as local updates", () => {
  const entry = { ...sampleActivity[1], source: "local" };
  for (const patch of [
    { actor: "agent" },
    { date: "never" },
    { region: "unknown" },
    { kind: "voice" },
  ]) {
    assert.equal(
      isCareStore({
        version: 1,
        entries: [{ ...entry, ...patch }],
        updates: {},
      }),
      false,
    );
  }
  assert.ok(isCareStore({ version: 1, entries: [entry], updates: {} }));
});
test("session imports preserve timestamps, partial sets, provenance, and missing discomfort", () => {
  const [entry] = sessionActivity([
    {
      ...seedSessions[0],
      source: "demo-entry",
      completed: { bridge: 1 },
      discomfort: null,
    },
  ]);
  assert.equal(entry.id, `session:${seedSessions[0].id}`);
  assert.equal(entry.date, seedSessions[0].date);
  assert.equal(entry.actor, "user");
  assert.equal(entry.source, "local");
  assert.match(entry.body, /1 sets/);
  assert.match(entry.body, /Discomfort not recorded/);
});
test("blocked browser writes throw without claiming that activity was saved", () => {
  globalThis.localStorage.setItem = () => {
    throw new Error("Quota exceeded");
  };
  assert.throws(
    () => saveCareStore({ version: 1, entries: [], updates: {} }),
    /Quota/,
  );
});
