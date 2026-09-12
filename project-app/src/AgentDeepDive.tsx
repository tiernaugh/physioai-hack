import { useState } from "react";
import { ArrowUpRight, ChevronDown, FileText, Sparkles, Stethoscope } from "lucide-react";
import AnalysisAnatomy from "./AnalysisAnatomy";
import type { AgentAnalysis } from "./agent-analysis";
import "./agent-analysis.css";

export default function AgentDeepDive({ analysis, compact, onDiscuss }: {
  analysis: AgentAnalysis;
  compact: boolean;
  onDiscuss: () => void;
}) {
  const [expanded, setExpanded] = useState(!compact);
  const [active, setActive] = useState(0);
  const contentId = `analysis-${analysis.id}`;
  return (
    <section className="agent-deep-dive" aria-label="Agent deep dive">
      <div className="analysis-heading">
        <span><Sparkles size={14} /> {analysis.kicker}</span>
        <button aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(!expanded)}>
          {expanded ? "Collapse analysis" : "Read full analysis"}<ChevronDown size={14} className={expanded ? "is-expanded" : ""} />
        </button>
      </div>
      <div className="analysis-intro">
        <h4>{analysis.takeaway}</h4>
        <p>{analysis.period} <span>·</span> Authored sample analysis</p>
      </div>
      {expanded && <div id={contentId}>
        <div className="analysis-metrics">
          {analysis.metrics.map((m) => <div key={m.label}><strong>{m.value}</strong><span>{m.label}</span><small>{m.detail}</small></div>)}
        </div>
        <figure className="analysis-figure">
          <div className="analysis-figure-heading"><h5>{analysis.anatomyTitle}</h5><span>SELECT A NUMBER TO EXPLORE</span></div>
          <div className="analysis-visual-grid">
            <AnalysisAnatomy insights={analysis.insights} active={active} onSelect={setActive} caption={analysis.anatomyCaption} />
            <div className="analysis-insights" aria-label="Anatomy insights">
              {analysis.insights.map((insight, i) => (
                <button key={insight.label} aria-pressed={active === i} onClick={() => setActive(i)} className={active === i ? "selected" : ""}>
                  <span className="analysis-insight-number">{i + 1}</span>
                  <span><small>{insight.label}</small><strong>{insight.title}</strong><span>{insight.detail}</span></span>
                </button>
              ))}
            </div>
          </div>
          <figcaption><span><i /> Amber: the routine’s hamstring focus</span><span>Reference anatomy · approximate annotations · not a personal scan</span></figcaption>
        </figure>
        <div className="analysis-reasoning">
          <div className="analysis-section-label"><Sparkles size={13} /> HOW I’M READING THE RECORD</div>
          {analysis.sections.map((section, i) => (
            <div className="analysis-reasoning-step" key={section.title}>
              <span>0{i + 1}</span><div><h5>{section.title}</h5><p>{section.body}</p></div>
            </div>
          ))}
        </div>
        <div className="analysis-uncertainty"><strong>What remains uncertain</strong><p>{analysis.uncertainty}</p></div>
        <div className="analysis-review">
          <div className="analysis-section-label"><Stethoscope size={14} /> FOR YOUR CONVERSATION WITH STEPHEN</div>
          <ul>{analysis.questions.map((q) => <li key={q}>{q}</li>)}</ul>
          <button onClick={onDiscuss}>Add your context or a question <ArrowUpRight size={14} /></button>
        </div>
        <details className="analysis-evidence">
          <summary><FileText size={13} /><span>Evidence behind this review</span><small>{analysis.evidence.length} sources · sample record</small><ChevronDown size={14} /></summary>
          <div>{analysis.evidence.map((e) => <p key={e.label}><strong>{e.label}</strong><span>{e.detail}</span></p>)}</div>
        </details>
      </div>}
    </section>
  );
}
