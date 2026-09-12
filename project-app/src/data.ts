export type RegionId =
  | "left-hamstring"
  | "left-shoulder"
  | "right-shoulder"
  | "chest"
  | "core"
  | "lower-back"
  | "left-hip"
  | "right-hip"
  | "left-knee"
  | "right-knee"
  | "left-calf"
  | "right-calf";
export type Exercise = {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  minutes: number;
  region: RegionId;
  equipment: string;
  cue: string;
};
export const regions: {
  id: RegionId;
  name: string;
  structure: string;
  note: string;
  reported: number | null;
}[] = [
  {
    id: "left-hamstring",
    name: "Left hamstring",
    structure: "Biceps femoris · semitendinosus · semimembranosus",
    note: "Illustrative six-month recovery path shown in the 3D model.",
    reported: 6,
  },
  {
    id: "left-knee",
    name: "Left knee",
    structure: "Quadriceps · knee region",
    note: "Mild stiffness after sitting, easing with movement.",
    reported: 2,
  },
  {
    id: "right-knee",
    name: "Right knee",
    structure: "Quadriceps · knee region",
    note: "No observations recorded in this demo profile.",
    reported: null,
  },
  {
    id: "left-hip",
    name: "Left hip",
    structure: "Gluteals · hip region",
    note: "Included in the sample lower-body routine.",
    reported: null,
  },
  {
    id: "right-hip",
    name: "Right hip",
    structure: "Gluteals · hip region",
    note: "Included in the sample lower-body routine.",
    reported: null,
  },
  {
    id: "left-calf",
    name: "Left calf",
    structure: "Gastrocnemius · lower leg",
    note: "A little tight after the weekend walk.",
    reported: 1,
  },
  {
    id: "right-calf",
    name: "Right calf",
    structure: "Gastrocnemius · lower leg",
    note: "No observations recorded in this demo profile.",
    reported: null,
  },
  {
    id: "left-shoulder",
    name: "Left shoulder",
    structure: "Deltoid · shoulder region",
    note: "No observations recorded in this demo profile.",
    reported: null,
  },
  {
    id: "right-shoulder",
    name: "Right shoulder",
    structure: "Deltoid · shoulder region",
    note: "No observations recorded in this demo profile.",
    reported: null,
  },
  {
    id: "chest",
    name: "Chest",
    structure: "Pectorals · chest region",
    note: "No observations recorded in this demo profile.",
    reported: null,
  },
  {
    id: "core",
    name: "Core",
    structure: "Abdominals · trunk region",
    note: "Included in the sample bridge exercise.",
    reported: null,
  },
  {
    id: "lower-back",
    name: "Lower back",
    structure: "Lumbar · back region",
    note: "No observations recorded in this demo profile.",
    reported: null,
  },
];
export const exercises: Exercise[] = [
  {
    id: "knee-extension",
    name: "Heel-dig isometric",
    category: "EARLY LOAD",
    sets: 5,
    reps: "20 sec",
    minutes: 4,
    region: "left-hamstring",
    equipment: "Exercise mat",
    cue: "Illustrative early-stage variant: press the heel down without moving the knee.",
  },
  {
    id: "bridge",
    name: "Double-leg bridge",
    category: "STRENGTH",
    sets: 3,
    reps: "8 reps",
    minutes: 5,
    region: "left-hamstring",
    equipment: "Exercise mat",
    cue: "Illustrative loading stage: lift with both legs and keep the pelvis level.",
  },
  {
    id: "calf-raise",
    name: "Slider hamstring curl",
    category: "CONTROL",
    sets: 3,
    reps: "8 reps",
    minutes: 6,
    region: "left-hamstring",
    equipment: "Towel or sliders",
    cue: "Illustrative middle-stage variant: slowly slide the heels away and return.",
  },
  {
    id: "heel-slide",
    name: "Hip hinge drill",
    category: "MOVEMENT",
    sets: 3,
    reps: "8 reps",
    minutes: 5,
    region: "left-hamstring",
    equipment: "Light resistance",
    cue: "Illustrative rebuilding stage: hinge at the hips with a neutral trunk.",
  },
];
export type Session = {
  id: string;
  date: string;
  title: string;
  completed: Record<string, number>;
  discomfort: number | null;
  note: string;
  minutes: number;
  source: "mock" | "demo-entry";
};
export const seedSessions: Session[] = [
  {
    id: "sample-1",
    date: "2026-09-10T09:15:00.000Z",
    title: "Hamstring recovery",
    completed: {
      "knee-extension": 3,
      bridge: 3,
      "calf-raise": 3,
      "heel-slide": 2,
    },
    discomfort: 2,
    note: "Felt more comfortable moving afterwards.",
    minutes: 18,
    source: "mock",
  },
  {
    id: "sample-2",
    date: "2026-09-08T17:30:00.000Z",
    title: "Hamstring recovery",
    completed: {
      "knee-extension": 3,
      bridge: 3,
      "calf-raise": 2,
      "heel-slide": 2,
    },
    discomfort: 3,
    note: "Skipped the last set of slider curls. Short on time.",
    minutes: 16,
    source: "mock",
  },
  {
    id: "sample-3",
    date: "2026-09-06T10:00:00.000Z",
    title: "Hamstring recovery",
    completed: {
      "knee-extension": 3,
      bridge: 3,
      "calf-raise": 3,
      "heel-slide": 2,
    },
    discomfort: 3,
    note: "Completed the sample routine.",
    minutes: 18,
    source: "mock",
  },
];
export const storageKey = "ai-physio:v0:sessions";
export function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const s = value as Session;
  return (
    typeof s.id === "string" &&
    typeof s.date === "string" &&
    Number.isFinite(Date.parse(s.date)) &&
    typeof s.title === "string" &&
    typeof s.note === "string" &&
    Number.isFinite(s.minutes) &&
    s.minutes >= 0 &&
    (s.source === "mock" || s.source === "demo-entry") &&
    (s.discomfort === null ||
      (Number.isInteger(s.discomfort) &&
        s.discomfort >= 0 &&
        s.discomfort <= 10)) &&
    !!s.completed &&
    typeof s.completed === "object" &&
    !Array.isArray(s.completed) &&
    Object.entries(s.completed).every(([id, n]) =>
      exercises.some(
        (e) => e.id === id && Number.isInteger(n) && n >= 0 && n <= e.sets,
      ),
    )
  );
}
export function loadSessions(): {
  sessions: Session[];
  warning: string | null;
} {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { sessions: seedSessions, warning: null };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isSession))
      throw new Error("Invalid data");
    return { sessions: parsed, warning: null };
  } catch {
    return {
      sessions: seedSessions,
      warning:
        "Saved demo data could not be read. Showing the original samples; the stored data has not been overwritten.",
    };
  }
}
export function exportProfile(sessions: Session[]) {
  return `---\nschema_version: 0\npatient_id: alex_demo\nname: Alex Morgan\ndata_kind: mock\nplan_id: lower_body_demo\nplan_revision: 1\n---\n\n# Alex Morgan — demo profile\n\nFictional data for the AI Physio prototype. Not a clinical record.\n\n## Goals\nReturn to comfortable walks and build a consistent routine.\n\n## Restrictions\nUnknown in this mock record.\n\n## Sample routine\n${exercises.map((e) => `- ${e.name}: ${e.sets} × ${e.reps}. ${e.cue}`).join("\n")}\n\n## Observations (fictional)\n- Left knee: 2/10 discomfort; mild stiffness after sitting.\n- Left calf: 1/10 discomfort; tight after walking.\n\n## Session history\n${sessions.map((s) => `\n### ${new Date(s.date).toISOString()} — ${s.title}\nSource: ${s.source}; sample plan revision: 1.\nCompleted: ${exercises.map((e) => `${e.name}: ${s.completed[e.id] ?? 0}/${e.sets} sets`).join("; ")}.\nReported discomfort: ${s.discomfort === null ? "not recorded" : `${s.discomfort}/10`}.\nDuration: ${s.minutes} min.\nNote: ${s.note || "None"}`).join("\n")}`;
}
