import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Bone,
  Check,
  ChevronRight,
  CircleAlert,
  Dumbbell,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

type Frame = {
  id: "address" | "backswing" | "target";
  step: string;
  title: string;
  image: string;
  confidence: string;
  signal: string;
  note: string;
};

const frames: Frame[] = [
  {
    id: "address",
    step: "CAPTURE 01",
    title: "Address & takeaway",
    image: "/images/golf-swing/01-address-analysis.png",
    confidence: "96%",
    signal: "Lead ankle strategy",
    note: "A slightly flared lead foot may reduce the rotation demanded from an ankle with limited available range.",
  },
  {
    id: "backswing",
    step: "CAPTURE 02",
    title: "Top of backswing",
    image: "/images/golf-swing/02-backswing-analysis.png",
    confidence: "94%",
    signal: "Pelvis–trunk sequencing",
    note: "Use a comfortable turn rather than chasing a reference-atlas position that has not been personalized to this body.",
  },
  {
    id: "target",
    step: "MODELED TARGET",
    title: "Personalized impact strategy",
    image: "/images/golf-swing/03-target-impact.png",
    confidence: "92%",
    signal: "Balanced force transfer",
    note: "The target keeps rotation available through the whole chain while avoiding a forced end-range position at the lead ankle.",
  },
];

const changes = [
  {
    structure: "Lead ankle",
    evidence: "Available range remains limited",
    source: "Assessment report",
    change: "Flare the lead foot slightly and test a modestly wider stance. Let the heel respond naturally instead of forcing a textbook finish.",
    certainty: "Recorded context",
  },
  {
    structure: "Pelvis & trunk",
    evidence: "Compensation is possible, not measured",
    source: "Atlas comparison",
    change: "Choose a comfortable turn and smoother transition. Do not manufacture separation to match the reference skeleton.",
    certainty: "Working hypothesis",
  },
  {
    structure: "Left posterior chain",
    evidence: "Past hamstring recovery",
    source: "Earlier story",
    change: "Build speed in stages and keep the recovered side visible when volume increases. The old injury informs the plan; it does not define the swing.",
    certainty: "History-linked",
  },
];

const muscles = [
  {
    name: "Soleus + calf complex",
    role: "Controls ankle load and helps transfer force from the ground.",
    exercise: "Bent-knee calf raise",
    dose: "3 × 8 slow reps",
  },
  {
    name: "Glute max + glute med",
    role: "Supports pelvic control as pressure moves between sides.",
    exercise: "Supported split squat",
    dose: "3 × 6 each side",
  },
  {
    name: "Obliques + deep trunk",
    role: "Links pelvis and ribcage without forcing spinal end range.",
    exercise: "Half-kneeling cable press",
    dose: "3 × 8 each side",
  },
  {
    name: "Hamstrings",
    role: "Maintains posterior-chain capacity from the earlier recovery story.",
    exercise: "Controlled single-leg RDL",
    dose: "2 × 6 each side",
  },
];

export default function GolfSwing() {
  const [active, setActive] = useState<Frame>(frames[0]);

  return (
    <div className="golf-story">
      <section className="golf-hero">
        <div className="golf-hero-copy">
          <span className="story-pill"><Sparkles size={13} /> STORY 02 · NOW</span>
          <span className="eyebrow">AI ATLAS · SWING STUDY</span>
          <h2>A swing built around <em>your</em> structure.</h2>
          <p>
            Two motion captures are compared with the reference atlas and your
            earlier injury record. The result is a movement strategy to test—not
            one universal idea of perfect form.
          </p>
          <div className="golf-context-strip">
            <span><Check size={14} /> Hamstring chapter completed</span>
            <ArrowRight size={14} />
            <strong>Ankle-aware golf return</strong>
          </div>
        </div>
        <div className="golf-hero-visual">
          <img src={active.image} alt={`${active.title} with motion-analysis landmarks`} />
          <div className="imaging-topline">
            <span><ScanLine size={14} /> OCI MOTION LAYER</span>
            <span>TRACKING · {active.confidence}</span>
          </div>
          <div className="imaging-readout">
            <small>{active.step}</small>
            <strong>{active.signal}</strong>
            <span><i /> Joint landmarks locked</span>
          </div>
          <div className="imaging-axis" aria-hidden="true"><i /><i /><i /></div>
        </div>
      </section>

      <section className="capture-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">THREE-FRAME REVIEW</span>
            <h2>From captured swing to target strategy</h2>
          </div>
          <span className="soft-badge">Mock imaging UI · illustrative data</span>
        </div>
        <div className="capture-grid">
          {frames.map((frame, index) => (
            <button
              key={frame.id}
              className={`capture-card ${active.id === frame.id ? "active" : ""} ${frame.id === "target" ? "target" : ""}`}
              onClick={() => setActive(frame)}
              aria-pressed={active.id === frame.id}
            >
              <span className="capture-image">
                <img src={frame.image} alt="" />
                <span className="capture-ui"><ScanLine size={12} /> {frame.confidence} TRACK</span>
                <span className="capture-index">0{index + 1}</span>
              </span>
              <span className="capture-copy">
                <small>{frame.step}</small>
                <strong>{frame.title}</strong>
                <span>{frame.note}</span>
              </span>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
      </section>

      <div className="golf-analysis-grid">
        <section className="change-card">
          <div className="section-title-row compact">
            <div>
              <span className="eyebrow">REFERENCE ≠ REQUIREMENT</span>
              <h2>What changes in the swing</h2>
            </div>
            <Bone size={24} />
          </div>
          <div className="change-list">
            {changes.map((item, index) => (
              <article key={item.structure}>
                <span className="change-number">0{index + 1}</span>
                <div>
                  <div className="change-heading">
                    <h3>{item.structure}</h3>
                    <span>{item.certainty}</span>
                  </div>
                  <p className="change-evidence">{item.evidence} · <span>{item.source}</span></p>
                  <p>{item.change}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="capacity-card">
          <div className="section-title-row compact">
            <div>
              <span className="eyebrow">TRAIN WHAT CAN ADAPT</span>
              <h2>Muscle capacity to build</h2>
            </div>
            <Dumbbell size={24} />
          </div>
          <div className="muscle-list">
            {muscles.map((muscle) => (
              <article key={muscle.name}>
                <span className="muscle-icon"><Activity size={16} /></span>
                <div>
                  <h3>{muscle.name}</h3>
                  <p>{muscle.role}</p>
                  <span className="exercise-chip">{muscle.exercise} <i /> {muscle.dose}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="golf-boundary">
        <span className="boundary-icon"><ShieldCheck size={20} /></span>
        <div>
          <strong>Coach + physio checkpoint</strong>
          <p>
            Only the ankle-range limit and past hamstring story come from the
            record. Pelvis, trunk and swing findings are mock image-analysis
            hypotheses and need real capture plus professional review before use.
          </p>
        </div>
        <span className="boundary-status"><CircleAlert size={14} /> Approval needed</span>
      </section>
    </div>
  );
}
