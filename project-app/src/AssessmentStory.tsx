import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  ClipboardList,
  Dumbbell,
  Gauge,
  ShieldCheck,
} from "lucide-react";

const weeks = [
  {
    week: 0,
    title: "Assessment baseline",
    status: "Return to sport is supported",
    report: "A defined ankle-range limit remains, so load and movement selection still need to respect the available range.",
    example: "Discuss a supported ankle-range drill with the treating professional.",
  },
  {
    week: 1,
    title: "Add ankle-specific work",
    status: "Rehabilitation becomes a priority",
    report: "Begin the four-week ankle block alongside strength and conditioning.",
    example: "Possible demonstration: a supported range drill or seated calf raise.",
  },
  {
    week: 2,
    title: "Build capacity",
    status: "Progress load to tolerance",
    report: "Increase ankle loading gradually without forcing through discomfort or the recorded range limit.",
    example: "Possible demonstration: a supported standing calf raise.",
  },
  {
    week: 3,
    title: "Prepare for sporting demand",
    status: "Keep movement selection adjustable",
    report: "Continue progressive loading while accounting for the remaining range limitation.",
    example: "Possible demonstration: supported balance and reach.",
  },
  {
    week: 4,
    title: "Retest and decide",
    status: "End-of-block review",
    report: "Retest range and strength, then assess readiness for unrestricted training load.",
    example: "The report calls for reassessment, not an automatic progression.",
  },
];

const muscles = [
  {
    name: "Gastrocnemius",
    role: "Crosses the knee and ankle; contributes to plantarflexion and propulsion.",
    exercise: "Supported standing calf raise",
  },
  {
    name: "Soleus",
    role: "A key plantarflexor with the knee bent; contributes to ankle load tolerance.",
    exercise: "Seated or bent-knee calf raise",
  },
  {
    name: "Tibialis anterior",
    role: "Contributes to dorsiflexion and control as the foot lowers.",
    exercise: "Controlled ankle dorsiflexion drill",
  },
  {
    name: "Fibularis group + foot stabilisers",
    role: "Help control the ankle and foot during balance and changes of direction.",
    exercise: "Supported balance and reach",
  },
];

const measurements = [
  ["Hip adduction", "237.5 N", "217.5 N", "8.4% R"],
  ["Hip abduction", "175.75 N", "187.0 N", "6.0% L"],
  ["Hip flexion", "170.25 N", "183.75 N", "7.3% L"],
  ["Hip extension", "320.5 N", "322.25 N", "0.5% L"],
  ["Shoulder internal rotation", "97.5 N", "105.75 N", "7.8% L"],
  ["Shoulder external rotation", "70.0 N", "70.0 N", "0.0%"],
  ["Elbow flexion", "82.0 N", "103.5 N", "20.8% L · monitor"],
];

export default function AssessmentStory() {
  const [week, setWeek] = useState(0);
  const stage = weeks[week];

  return (
    <div className="assessment-story">
      <section className="assessment-hero">
        <div>
          <span className="story-pill"><ClipboardList size={13} /> STORY 02 · REAL REPORT</span>
          <span className="eyebrow">STUDIO 22 · SEPTEMBER 2026</span>
          <h2>Ready to return. Still building the ankle.</h2>
          <p>
            The de-identified assessment supports a return to sport, while a
            remaining ankle-range limit shapes the next four weeks of training.
          </p>
        </div>
        <div className="assessment-summary">
          <span><Check size={18} /></span>
          <div>
            <small>CLINICAL SUMMARY</small>
            <strong>Return to sport</strong>
            <p>Adjust load and movement selection around the available ankle range.</p>
          </div>
          <strong className="assessment-duration">4 weeks</strong>
        </div>
      </section>

      <section className="assessment-timeline">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">THE NEXT CHAPTER</span>
            <h2>Four-week ankle-capacity story</h2>
          </div>
          <span className="soft-badge">Report facts + labelled examples</span>
        </div>
        <div className="assessment-week-tabs" role="tablist" aria-label="Rehabilitation week">
          {weeks.map((item) => (
            <button
              key={item.week}
              className={week === item.week ? "active" : ""}
              onClick={() => setWeek(item.week)}
              role="tab"
              aria-selected={week === item.week}
            >
              <small>{item.week === 0 ? "START" : "WEEK"}</small>
              <strong>{item.week}</strong>
            </button>
          ))}
        </div>
        <article className="assessment-stage">
          <div className="assessment-stage-number">{String(stage.week).padStart(2, "0")}</div>
          <div>
            <span>{stage.status}</span>
            <h3>{stage.title}</h3>
            <p><strong>From the report:</strong> {stage.report}</p>
            <p className="assessment-example"><Dumbbell size={15} /> {stage.example}</p>
          </div>
          {stage.week < 4 && <ArrowRight size={22} />}
        </article>
      </section>

      <div className="assessment-grid">
        <section className="assessment-card">
          <div className="section-title-row compact">
            <div>
              <span className="eyebrow">REFERENCE ANATOMY</span>
              <h2>Musculature involved</h2>
            </div>
            <Activity size={24} />
          </div>
          <p className="assessment-intro">
            These muscles can contribute to ankle movement and capacity. The
            report does not identify an injured muscle or record the affected side.
          </p>
          <div className="assessment-muscles">
            {muscles.map((muscle) => (
              <article key={muscle.name}>
                <span className="muscle-icon"><Activity size={16} /></span>
                <div>
                  <h3>{muscle.name}</h3>
                  <p>{muscle.role}</p>
                  <span>{muscle.exercise}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="assessment-card">
          <div className="section-title-row compact">
            <div>
              <span className="eyebrow">ISOMETRIC TESTING</span>
              <h2>The measured picture</h2>
            </div>
            <Gauge size={24} />
          </div>
          <div className="measurement-head"><span>Movement</span><span>Right</span><span>Left</span><span>Difference</span></div>
          <div className="measurement-list">
            {measurements.map(([movement, right, left, difference]) => (
              <article className={movement === "Elbow flexion" ? "flagged" : ""} key={movement}>
                <strong>{movement}</strong><span>{right}</span><span>{left}</span><span>{difference}</span>
              </article>
            ))}
          </div>
          <p className="measurement-rule">
            Values below 70 N were excluded by the report’s reliability rule.
            Elbow flexion is the only result flagged for monitoring.
          </p>
        </section>
      </div>

      <section className="assessment-boundary">
        <ShieldCheck size={21} />
        <div>
          <strong>What is known—and what is not</strong>
          <p>
            The measurements, ankle-range limitation, four-week priority and
            retest plan come from the supplied report. Exercise names and muscle
            associations are educational examples for discussion, not the client’s
            recorded prescription or a diagnosis.
          </p>
        </div>
      </section>
    </div>
  );
}
