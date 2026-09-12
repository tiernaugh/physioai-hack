import { regions } from "./data.ts";
import type { RegionId, Session } from "./data";

export type Actor = "user" | "physio" | "agent";
export type Human = Exclude<Actor, "agent">;
export type ActivityEntry = {
  id: string;
  date: string;
  actor: Actor;
  title: string;
  body: string;
  kind: "check-in" | "appointment" | "plan" | "insight" | "exercise" | "voice";
  region?: RegionId;
  source: "sample" | "local" | "whatsapp";
};
export type EntryNote = {
  id: string;
  actor: Human;
  date: string;
  text: string;
};
export type EntryState = {
  done: boolean;
  by: Human;
  date: string;
  notes: EntryNote[];
};
export type CareStore = {
  version: 1;
  entries: ActivityEntry[];
  updates: Record<string, EntryState>;
};
export const careStorageKey = "ai-physio:v1:care-log";
export const demoToday = "2026-09-12";
export const actorNames: Record<Actor, string> = {
  user: "Alex Morgan",
  physio: "Stephen · Physio",
  agent: "Physio companion",
};
// Display-only example: no recorded age or population benchmark is available.
export const sampleAgeComparison = { ageBand: "35–44", percentile: 72 } as const;

export const snapshots = [
  {
    date: "2026-07-20",
    score: 48,
    month: 0,
    status: "Starting your recovery",
    discomfort: 6,
  },
  {
    date: "2026-08-03",
    score: 54,
    month: 1,
    status: "Finding your rhythm",
    discomfort: 5,
  },
  {
    date: "2026-08-17",
    score: 60,
    month: 2,
    status: "Building consistency",
    discomfort: 4,
  },
  {
    date: "2026-08-31",
    score: 66,
    month: 3,
    status: "Building capacity",
    discomfort: 3,
  },
  {
    date: "2026-09-07",
    score: 72,
    month: 3,
    status: "Moving with confidence",
    discomfort: 3,
  },
  {
    date: demoToday,
    score: 78,
    month: 4,
    status: "Rebuilding strength",
    discomfort: 2,
  },
];
export const sampleActivity: ActivityEntry[] = [
  {
    id: "agent-12",
    date: "2026-09-12T09:10:00",
    actor: "agent",
    title: "Your progress, beyond the discomfort score",
    body: "Your sample sessions and this morning’s check-in suggest more comfortable movement. I’ve connected the changes, the anatomy and the questions still worth bringing to Stephen.",
    kind: "insight",
    region: "left-hamstring",
    source: "sample",
  },
  {
    id: "user-12",
    date: "2026-09-12T08:45:00",
    actor: "user",
    title: "This morning’s check-in",
    body: "The stairs felt easier this morning. A little tightness behind my left knee, but it eased after walking.",
    kind: "check-in",
    region: "left-knee",
    source: "sample",
  },
  {
    id: "physio-11",
    date: "2026-09-11T15:30:00",
    actor: "physio",
    title: "Your routine is ready",
    body: "I’ve added the sample hamstring routine to your daily exercises. Make a note of how each movement feels so we can discuss it together.",
    kind: "plan",
    region: "left-hamstring",
    source: "sample",
  },
  {
    id: "appointment-10",
    date: "2026-09-10T10:00:00",
    actor: "physio",
    title: "Movement & strength review",
    body: "Alex reported feeling more comfortable on walks. We reviewed the left hamstring and discussed confidence with daily movement. Next review: 17 September. Bring exercise notes and any questions.",
    kind: "appointment",
    region: "left-hamstring",
    source: "sample",
  },
  {
    id: "agent-08",
    date: "2026-09-08T18:45:00",
    actor: "agent",
    title: "Understanding the session you cut short",
    body: "One fewer set, two fewer minutes, and the same reported discomfort. Here’s what the sample record tells us about that shorter session, and what I’d clarify before suggesting a change.",
    kind: "insight",
    region: "left-hamstring",
    source: "sample",
  },
  {
    id: "appointment-03",
    date: "2026-09-03T10:00:00",
    actor: "physio",
    title: "Checking in on your progress",
    body: "Reviewed the movement diary together. Alex would like to return to longer weekend walks. We agreed to keep recording how the hamstring feels after each session.",
    kind: "appointment",
    region: "left-hamstring",
    source: "sample",
  },
  {
    id: "appointment-20",
    date: "2026-07-20T11:00:00",
    actor: "physio",
    title: "Your starting point",
    body: "First conversation about Alex’s movement goals. Recorded the fictional baseline and discussed returning to comfortable walks. The left hamstring is the focus of this demo story.",
    kind: "appointment",
    region: "left-hamstring",
    source: "sample",
  },
];
export const nextAppointment = {
  date: "2026-09-17T10:00:00",
  title: "Progress review",
  description: "Stephen · Studio 22 · 30 min",
};

export function dayKey(date: string) {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
export function shortDate(date: string, includeYear = false) {
  return new Date(
    date.length === 10 ? `${date}T12:00:00` : date,
  ).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" as const } : {}),
  });
}
export function sessionActivity(sessions: Session[]): ActivityEntry[] {
  return sessions.map((s) => ({
    id: `session:${s.id}`,
    date: s.date,
    actor: "user",
    title: "Exercise session logged",
    body: `${Object.values(s.completed).reduce((a, b) => a + b, 0)} sets · ${s.minutes} min · ${s.discomfort === null ? "Discomfort not recorded" : `${s.discomfort}/10 reported discomfort`}.${s.note ? ` ${s.note}` : ""}`,
    kind: "exercise",
    region: "left-hamstring",
    source: s.source === "mock" ? "sample" : "local",
  }));
}
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const validDate = (v: unknown) =>
  typeof v === "string" && Number.isFinite(Date.parse(v));
const human = (v: unknown) => v === "user" || v === "physio";
export function isCareStore(value: unknown): value is CareStore {
  if (
    !record(value) ||
    value.version !== 1 ||
    !Array.isArray(value.entries) ||
    !record(value.updates)
  )
    return false;
  const validEntries = value.entries.every(
    (e) =>
      record(e) &&
      typeof e.id === "string" &&
      validDate(e.date) &&
      human(e.actor) &&
      typeof e.title === "string" &&
      typeof e.body === "string" &&
      ["check-in", "appointment", "plan"].includes(String(e.kind)) &&
      e.source === "local" &&
      (e.region === undefined || regions.some((r) => r.id === e.region)),
  );
  const validUpdates = Object.values(value.updates).every(
    (u) =>
      record(u) &&
      typeof u.done === "boolean" &&
      human(u.by) &&
      validDate(u.date) &&
      Array.isArray(u.notes) &&
      u.notes.every(
        (n) =>
          record(n) &&
          typeof n.id === "string" &&
          human(n.actor) &&
          validDate(n.date) &&
          typeof n.text === "string",
      ),
  );
  return validEntries && validUpdates;
}
export function loadCareStore(): { data: CareStore; warning: string | null } {
  const empty: CareStore = { version: 1, entries: [], updates: {} };
  try {
    const raw = localStorage.getItem(careStorageKey);
    if (raw === null) return { data: empty, warning: null };
    const parsed: unknown = JSON.parse(raw);
    if (!isCareStore(parsed)) throw new Error("Invalid activity data");
    return { data: parsed, warning: null };
  } catch {
    return {
      data: empty,
      warning:
        "Your saved activity could not be read. It has been left untouched; changes cannot be saved until browser storage is available and the record is repaired.",
    };
  }
}
export function saveCareStore(data: CareStore) {
  if (!isCareStore(data))
    throw new Error(
      "This activity could not be validated. Your changes have not been saved.",
    );
  localStorage.setItem(careStorageKey, JSON.stringify(data));
}
