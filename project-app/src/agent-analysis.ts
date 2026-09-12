import type { AnalysisRegion } from './analysis-anatomy';

export type AnatomyInsight = {
  label: string;
  title: string;
  detail: string;
  position?: [number, number, number];
  region?: AnalysisRegion;
  sourceLabel?: string;
};

export type AgentAnalysis = {
  id: string;
  kicker: string;
  takeaway: string;
  period: string;
  provenance?: string;
  notice?: string;
  highlightRegions?: AnalysisRegion[];
  anatomyLegend?: string;
  unplaced?: string[];
  metrics: { value: string; label: string; detail: string }[];
  anatomyTitle: string;
  anatomyCaption: string;
  insights: AnatomyInsight[];
  sections: { title: string; body: string; evidenceIds?: string[] }[];
  questions: string[];
  evidence: { id?: string; label: string; detail: string }[];
  uncertainty: string;
};

// Authored case reviews of the fictional record at the entry's date. These do
// not incorporate subsequent browser-local sessions or imply live inference.
export const agentAnalyses: Record<string, AgentAnalysis> = {
  "agent-12": {
    id: "agent-12",
    kicker: "PROGRESS REVIEW · 01",
    takeaway: "More comfortable movement. One detail to follow up.",
    period: "6–12 September 2026",
    metrics: [
      { value: "3 → 2", label: "Reported discomfort / 10", detail: "8 Sept → 10 Sept session" },
      { value: "3", label: "Sessions recorded", detail: "6, 8 and 10 September" },
      { value: "Easier", label: "Stairs this morning", detail: "Alex’s check-in · 12 Sept" },
    ],
    anatomyTitle: "Where the observations connect",
    anatomyCaption: "Left leg · posterior muscle anatomy",
    insights: [
      {
        label: "Hamstring",
        title: "The focus of your recent sessions",
        detail: "The left hamstring is the recorded focus of the routine. Lower reported discomfort is encouraging, but the log does not measure muscle strength or tissue recovery.",
        position: [0.086, 0.65, -0.084],
      },
      {
        label: "Behind the knee",
        title: "A location to clarify",
        detail: "You described tightness behind the left knee that eased after walking. This pin marks the approximate area you mentioned; it does not identify which structure caused it.",
        position: [0.083, 0.465, -0.067],
      },
      {
        label: "Hip / pelvis",
        title: "Movement quality is still an open question",
        detail: "Easier stairs tells us about your experience. There is no recorded movement test showing how the hip and knee share the task, so compensation cannot be inferred from this model.",
        position: [0.081, 0.88, -0.12],
      },
    ],
    sections: [
      {
        title: "Several observations point in the same direction",
        body: "The sample sessions show discomfort of 3/10 on 6 and 8 September, then 2/10 on 10 September. Stephen’s 10 September review records more comfortable walks, and your latest check-in says stairs felt easier. Together, these support a modest improvement in your reported day-to-day experience. They do not establish how much capacity has changed.",
      },
      {
        title: "The improvement needs a little context",
        body: "The sessions lasted 18, 16 and 18 minutes, with 11, 10 and 11 sets recorded. The lower discomfort score was not simply recorded after the shortest session. Still, exercise resistance, effort and next-morning response are missing, so the sessions are not a controlled comparison. Three entries also cannot establish a lasting trend.",
      },
      {
        title: "Keep the knee observation distinct",
        body: "The latest tightness is described behind the knee, while the routine focuses on the hamstring. Their proximity makes an anatomical view useful for explaining the location, but proximity does not establish a cause. I would bring both the easier stairs and the remaining tightness into the review, so the positive trend does not hide an unresolved symptom.",
      },
    ],
    questions: [
      "Where exactly is the tightness, and does it return later in the day or the next morning?",
      "Were the last two sessions similar in resistance and effort, as well as time?",
      "What would Stephen want to observe before revisiting the longer-walk goal?",
    ],
    evidence: [
      { label: "6, 8 & 10 Sept · sample exercise log", detail: "18 / 16 / 18 min; 11 / 10 / 11 sets; discomfort 3 / 3 / 2 out of 10." },
      { label: "10 Sept · Stephen’s movement review", detail: "Alex reported more comfortable walks; left hamstring and movement confidence discussed." },
      { label: "12 Sept, 08:45 · Alex’s check-in", detail: "Stairs felt easier; tightness behind the left knee eased after walking." },
    ],
    uncertainty: "The record supports a change in reported comfort. It does not establish a diagnosis, measured strength gain or readiness to increase loading. Stephen can assess those questions at the review.",
  },
  "agent-08": {
    id: "agent-08",
    kicker: "SESSION REVIEW · 02",
    takeaway: "A shorter session needs context before a plan change.",
    period: "3–8 September 2026",
    metrics: [
      { value: "18 → 16", label: "Minutes recorded", detail: "6 Sept → 8 Sept session" },
      { value: "11 → 10", label: "Sets recorded", detail: "One fewer set in the log" },
      { value: "3 → 3", label: "Reported discomfort / 10", detail: "Same score in both sessions" },
    ],
    anatomyTitle: "Read the session through its movement focus",
    anatomyCaption: "Left leg · anatomy for the review discussion",
    insights: [
      {
        label: "Hamstring",
        title: "One fewer set is an exposure change",
        detail: "The sample log records two slider-curl sets rather than three. That describes less recorded work for this routine; it does not show loss of strength or a setback.",
        position: [0.086, 0.65, -0.084],
      },
      {
        label: "Hip / pelvis",
        title: "Completed sets do not show technique",
        detail: "Three bridge sets and two hip-hinge sets appear in both logs. Their counts are stable. The record has no video or observed technique assessment to explain how those movements were performed.",
        position: [0.081, 0.88, -0.12],
      },
      {
        label: "Knee region",
        title: "A symptom score needs timing",
        detail: "The overall session score stayed at 3/10. It is not tied to a particular movement or body point, so the missing set cannot be attributed to knee discomfort from this evidence.",
        position: [0.083, 0.465, -0.067],
      },
    ],
    sections: [
      {
        title: "The recorded reason is lack of time",
        body: "Your 8 September sample note says you skipped the last set of slider curls because you were short on time. The session took 16 minutes, compared with 18 minutes on 6 September, and has one fewer set. That supports a scheduling explanation. I would not relabel this as poor motivation or a symptom-driven stop when you have given a different reason.",
      },
      {
        title: "An unchanged score does not answer every question",
        body: "Reported discomfort stayed at 3/10. This gives no recorded signal of a higher session score, but a single score can miss when symptoms appeared or how the next morning felt. The log also lacks resistance and effort. I can describe the reduced recorded work, but cannot conclude that the session was equally demanding or that every movement felt the same.",
      },
      {
        title: "The useful next step is a practical conversation",
        body: "The 3 September appointment names longer weekend walks as your goal. If time pressure repeats, a routine that fits your available time is a useful topic for Stephen. One shortened session is too little evidence to redesign the programme. First clarify whether this was a one-off interruption, then ask which parts Stephen would prioritise if a shorter session is needed.",
      },
    ],
    questions: [
      "Was time the only reason for stopping, or did a particular movement also feel different?",
      "How did the leg feel later that evening and the next morning?",
      "If time is regularly limited, which parts of the routine would Stephen prioritise?",
    ],
    evidence: [
      { label: "3 Sept · Stephen’s progress appointment", detail: "Alex’s goal: longer weekend walks. Keep recording the response after each session." },
      { label: "6 Sept · sample exercise log", detail: "18 min; 11 sets; 3/10 reported discomfort. Three slider-curl sets recorded." },
      { label: "8 Sept · sample exercise log", detail: "16 min; 10 sets; 3/10 reported discomfort. Two slider-curl sets; note says short on time." },
    ],
    uncertainty: "This review uses only the fictional record available on 8 September. It does not assume a recurring adherence problem or change the routine. Later sessions belong in a subsequent review.",
  },
};

export function analysisText(id: string) {
  const a = agentAnalyses[id];
  if (!a) return "";
  return [
    `#### Agent deep dive — ${a.period}\nAuthored sample analysis · reference anatomy, not a personal scan`,
    a.takeaway,
    ...a.metrics.map((m) => `${m.label}: ${m.value} (${m.detail})`),
    ...a.insights.map((p, i) => `Anatomy insight ${i + 1} — ${p.label}: ${p.title}. ${p.detail}`),
    ...a.sections.map((s) => `#### ${s.title}\n${s.body}`),
    `#### Questions for Stephen\n${a.questions.map((q) => `- ${q}`).join("\n")}`,
    `What remains uncertain: ${a.uncertainty}`,
    ...a.evidence.map((e) => `Source — ${e.label}: ${e.detail}`),
  ].join("\n\n");
}
