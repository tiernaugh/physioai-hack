import { useRef, useState } from "react";
import { ArrowRight, Dumbbell, MessageCircle, Mic, RefreshCw, Sparkles, Stethoscope, TrendingUp, UserRound } from "lucide-react";
import { actorNames, dayKey, shortDate, snapshots } from "./care-data";
import { layoutTimelineTrack, timelineRange, timelineTrack } from "./progress-timeline";
import type { TimelineItem, TimelineTrack } from "./progress-timeline";

const tracks = [
  { id: "voice", label: "Voice notes", icon: Mic },
  { id: "user", label: "Your activity", icon: UserRound },
  { id: "physio", label: "Physio notes", icon: Stethoscope },
  { id: "agent", label: "Agent updates", icon: Sparkles },
] as const satisfies readonly { id: TimelineTrack; label: string; icon: typeof Mic }[];
const sourceName = { sample: "Sample", local: "On this device", whatsapp: "WhatsApp" };

export default function ProgressOverview({ items, selectedDay, onSelectItem, onSelectDay, onViewEntry, onOpenVoice, voiceState, onRefreshVoice }: {
  items: TimelineItem[];
  selectedDay: string | null;
  onSelectItem: (item: TimelineItem) => void;
  onSelectDay: (date: string) => void;
  onViewEntry: (item: TimelineItem) => void;
  onOpenVoice: (id: string) => void;
  voiceState: string;
  onRefreshVoice: () => void;
}) {
  const [metric, setMetric] = useState<"strength" | "score">("strength");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const notePreview = useRef<HTMLDivElement>(null);
  const first = snapshots[0];
  const latest = snapshots[snapshots.length - 1];
  const { start, end, fraction } = timelineRange(items, snapshots);
  const x = (date: string) => 32 + fraction(date) * 836;
  const y = (value: number) => 182 - value * 1.6;
  const path = snapshots.map((s, i) => `${i ? "L" : "M"} ${x(s.date)} ${y(s[metric])}`).join(" ");
  const dayItems = selectedDay ? items.filter(item => dayKey(item.date) === selectedDay) : items;
  const activeItem = dayItems.find(item => item.id === selectedId) ?? dayItems.at(-1);
  const voiceCount = items.filter(item => item.kind === "voice").length;
  const commentCount = items.filter(item => item.kind === "comment").length;
  const dates = [...new Set(items.map(item => dayKey(item.date)))];
  const ticks = [...new Set(Array.from({ length: 6 }, (_, index) => new Date(start + Math.round((end - start) / 86400000 * index / 5) * 86400000).toISOString().slice(0, 10)))];
  const voiceId = activeItem?.entryId.startsWith("voice:") ? activeItem.entryId.slice(6)
    : activeItem?.entryId.startsWith("voice-analysis:") ? activeItem.entryId.slice(15) : null;
  const selectedInRange = selectedDay && fraction(selectedDay) >= 0 && fraction(selectedDay) <= 1;
  function selectItem(item: TimelineItem) {
    setSelectedId(item.id);
    onSelectItem(item);
    requestAnimationFrame(() => {
      notePreview.current?.scrollIntoView({ block: "nearest" });
      notePreview.current?.focus({ preventScroll: true });
    });
  }

  return (
    <section className="journey-overview" aria-labelledby="journey-title">
      <div className="journey-heading">
        <div>
          <span className="care-kicker">THE SMALL STEPS ADD UP</span>
          <h2 id="journey-title">Your progress, with the whole story.</h2>
          <p>Every voice note, check-in and conversation, connected to your progress.</p>
        </div>
        <span className="journey-sample">Scores are illustrative</span>
      </div>
      <div className="journey-metrics" role="group" aria-label="Progress measure">
        <button className={metric === "strength" ? "selected" : ""} aria-pressed={metric === "strength"} onClick={() => setMetric("strength")}>
          <span><Dumbbell size={17} /> Strength progress</span>
          <strong>{latest.strength}<small>/100</small><b>+{latest.strength - first.strength} points</b></strong>
          <small>Illustrative strength score</small>
        </button>
        <button className={metric === "score" ? "selected" : ""} aria-pressed={metric === "score"} onClick={() => setMetric("score")}>
          <span><TrendingUp size={17} /> Overall progress</span>
          <strong>{latest.score}<small>/100</small><b>+{latest.score - first.score} points</b></strong>
          <small>Illustrative health score</small>
        </button>
        <div className="journey-context">
          <MessageCircle size={19} />
          <strong>{items.length} notes & activities on your graph</strong>
          <p>{voiceCount} voice notes · {commentCount} added comments<br />Select any marker to read the original note.</p>
        </div>
      </div>
      <div className="journey-chart-title">
        <span><i /> {metric === "strength" ? "Strength" : "Health"} score <small> / 100</small></span>
        <span>{shortDate(new Date(start).toISOString())} – {shortDate(new Date(end).toISOString(), true)}</span>
      </div>
      <div className="journey-chart-scroll" role="region" aria-label="Progress tracker with all notes" tabIndex={0}>
        <div className="journey-tracker">
          <div className="journey-score-row">
            <span className="journey-score-label">SAMPLE<br />SCORE</span>
            <svg viewBox="0 0 900 208" preserveAspectRatio="none" role="img" aria-label={`Illustrative ${metric === "strength" ? "strength" : "health"} score: ${snapshots.map(s => `${s[metric]} on ${shortDate(s.date)}`).join(", ")}. All ${items.length} activity records and comments are plotted in the dated tracks below.`}>
              <defs>
                <linearGradient id="journey-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#729668" stopOpacity=".22" />
                  <stop offset="100%" stopColor="#729668" stopOpacity=".015" />
                </linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map(value => (
                <g key={value}>
                  <line x1="32" x2="868" y1={y(value)} y2={y(value)} stroke="#e4e9db" strokeDasharray="3 6" />
                  <text x="0" y={y(value) + 4} fill="#88947f" fontSize="10">{value}</text>
                </g>
              ))}
              {dates.map(date => <line key={date} x1={x(date)} x2={x(date)} y1="20" y2="182" stroke="#e4e9db" strokeDasharray="2 5" />)}
              <path d={`${path} L ${x(latest.date)} 182 L ${x(first.date)} 182 Z`} fill="url(#journey-fill)" />
              {selectedInRange && <line x1={x(selectedDay)} x2={x(selectedDay)} y1="20" y2="182" stroke="#91a783" strokeWidth="2" />}
              <path d={path} fill="none" stroke="#477652" strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              {snapshots.map(s => <circle key={s.date} cx={x(s.date)} cy={y(s[metric])} r={s.date === selectedDay ? 6 : 4} fill="#fffefa" stroke="#477652" strokeWidth="2"><title>{shortDate(s.date)} · {s[metric]}/100 sample score</title></circle>)}
            </svg>
          </div>
          <div className="journey-date-row"><span>DATE</span><div className="journey-track-plot">
            {ticks.map(date => <button key={date} className="journey-date" style={{ left: `${fraction(date) * 100}%` }} aria-label={`${shortDate(date)}, show activity`} aria-pressed={selectedDay === date} onClick={() => onSelectDay(date)}>{shortDate(date)}</button>)}
          </div></div>
          {tracks.map(({ id, label, icon: Icon }) => {
            const records = items.filter(item => timelineTrack(item) === id);
            const { placements, height } = layoutTimelineTrack(records, fraction);
            return <div key={id} className={`journey-track track-${id}`} style={{ minHeight: height }} role="group" aria-label={`${label} on graph, ${records.length} records`}>
              <div className="journey-track-label"><Icon size={16} /><span>{label}<small>{records.length} {records.length === 1 ? "record" : "records"}</small></span></div>
              <div className="journey-track-plot" style={{ height }}>
                {dates.map(date => <i className="journey-track-guide" key={date} style={{ left: `${fraction(date) * 100}%` }} />)}
                {placements.map(({ item, lane, position, rightAligned }) => <button key={item.id} data-timeline-id={item.id} data-entry-id={item.entryId} className={`journey-timeline-marker ${rightAligned ? "right-aligned" : ""} ${activeItem?.id === item.id ? "selected" : ""}`} style={{ left: `${position}%`, top: 10 + lane * 38 }} aria-label={`Graph note ${items.indexOf(item) + 1}: ${item.title}, ${shortDate(item.date)} · ${actorNames[item.actor]}`} aria-pressed={activeItem?.id === item.id} title={`${shortDate(item.date)} · ${item.title}\n${item.body}`} onClick={() => selectItem(item)}>
                  <b>{items.indexOf(item) + 1}</b><span>{item.kind === "voice" || item.kind === "comment" ? item.body : item.title}</span>
                </button>)}
                {!records.length && <span className="journey-track-empty">{id === "voice" ? voiceState === "Voice notes connected" ? "No voice notes yet" : voiceState : "No records yet"}</span>}
              </div>
            </div>;
          })}
        </div>
      </div>
      <div className="journey-tracker-footer"><span>Each number is one record · notes on the same day stack vertically</span><button className="care-text-button" onClick={onRefreshVoice}><RefreshCw size={12} /> {voiceState}</button></div>
      {activeItem && <div ref={notePreview} tabIndex={-1} className="journey-selected-note" role="region" aria-label="Selected graph note">
        <span className="journey-note-number">{items.indexOf(activeItem) + 1}</span>
        <div><span>{shortDate(activeItem.date, true)} · {new Date(activeItem.date).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })} · {actorNames[activeItem.actor]} · {sourceName[activeItem.source]}</span><strong>{activeItem.title}</strong><p>{activeItem.body}</p>
          <div className="journey-note-actions">
            {voiceId && <button className="care-secondary" onClick={() => onOpenVoice(voiceId)}><Mic size={14} /> Open voice note</button>}
            <button className="care-text-button" onClick={() => onViewEntry(activeItem)}>View full activity <ArrowRight size={14} /></button>
          </div>
        </div>
      </div>}
      <p className="journey-disclaimer">Sample scores are not measured strength or tissue healing. Your notes keep their original dates and sources; new activity does not create a new score.</p>
    </section>
  );
}
