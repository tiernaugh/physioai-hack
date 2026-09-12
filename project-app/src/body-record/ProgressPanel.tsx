import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { changeAt, eventsAt, formatDate, progressMuscles, seriesFor, timeline } from './model';
import type { Region, Status } from './model';

export const statusLabel: Record<Status, string> = { improved: 'Improved', unchanged: 'Unchanged', worsened: 'Worsened', none: 'No comparison' };

// Sparkline geometry: one column per spine date, discomfort 0–10 inverted so lower (better) sits lower.
const W = 240, H = 64, X0 = 12, X1 = 228, Y0 = 8, Y1 = 46;
const x = (i: number) => X0 + (i / (timeline.length - 1)) * (X1 - X0);
const y = (score: number) => Y1 - (score / 10) * (Y1 - Y0);

export default function ChangeCard({ region, date, isolate, onIsolate }: { region: Region; date: string; isolate: boolean; onIsolate: (value: boolean) => void }) {
  const { before, after, status } = changeAt(region, date);
  const flare = eventsAt(region, date)[0];
  const series = seriesFor(region);
  const scrubbedIndex = timeline.indexOf(date);
  const muscles = progressMuscles[region].label.replace(/^Left /, '').split(/, | and /).map(name => name.trim());
  const segments: string[] = [];
  for (let i = 1; i < series.length; i++) {
    const a = series[i - 1].score, b = series[i].score;
    if (a !== null && b !== null) segments.push(`M${x(i - 1).toFixed(1)} ${y(a).toFixed(1)} L${x(i).toFixed(1)} ${y(b).toFixed(1)}`);
  }
  const reported = series.filter(point => point.score !== null);
  const sparkText = reported.length ? `Check-ins for ${progressMuscles[region].label}: ${reported.map(point => `${formatDate(point.date)} ${point.score} out of 10`).join(', ')}.` : 'No check-ins recorded for this region.';

  return <article className={`br-change ${status}`} aria-label="Recorded change">
    <div className="br-change-head">
      <span className="br-status-chip">{statusLabel[status]}</span>
      <span className="br-badge">YOUR CHECK-IN</span>
    </div>
    <p className="br-change-activity">{after?.activity ?? 'No check-in recorded for this region by this date.'}</p>
    {flare && <p className="br-change-flare"><strong>Flare-up reported.</strong> {flare.text}</p>}
    {after && before ? <div className="br-change-score">
      <div><strong>{before.score}</strong><span>{formatDate(before.date)}</span></div>
      <ArrowRight size={22} aria-label="to"/>
      <div><strong>{after.score}<small>/10</small></strong><span>{formatDate(after.date)}</span></div>
    </div> : after ? <div className="br-change-score br-change-first">
      <div><strong>{after.score}<small>/10</small></strong><span>{formatDate(after.date)}</span></div>
      <p>First check-in recorded. A comparison appears once a later check-in is added.</p>
    </div> : null}
    <small className="br-change-scale">0 = none · 10 = most severe · Alex’s own rating</small>
    <svg className="br-spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={sparkText} preserveAspectRatio="none">
      <line x1={X0} x2={X1} y1={Y1} y2={Y1} className="br-spark-axis"/>
      <line x1={X0} x2={X1} y1={Y0} y2={Y0} className="br-spark-axis br-spark-axis-top"/>
      {scrubbedIndex >= 0 && <line x1={x(scrubbedIndex)} x2={x(scrubbedIndex)} y1={Y0 - 4} y2={Y1 + 4} className="br-spark-cursor"/>}
      {segments.map((d, i) => <path d={d} key={i} className="br-spark-line"/>)}
      {series.map((point, i) => point.score === null ? null : <circle key={point.date} cx={x(i)} cy={y(point.score)} r={i === scrubbedIndex ? 4 : 2.4} className={`br-spark-dot ${i === scrubbedIndex ? 'current' : ''} ${i > scrubbedIndex ? 'future' : ''}`}/>)}
      {series.map((point, i) => <text key={point.date} x={x(i)} y={H - 4} textAnchor={i === 0 ? 'start' : i === series.length - 1 ? 'end' : 'middle'} className={`br-spark-label ${i === scrubbedIndex ? 'current' : ''}`}>{formatDate(point.date)}</text>)}
    </svg>
    <div className="br-muscles">
      <span className="br-eyebrow">HIGHLIGHTED MUSCLES · LEFT</span>
      <div className="br-muscle-chips">{muscles.map(name => <span className="br-muscle-chip" key={name}><i/>{name}</span>)}</div>
      <div className="br-muscle-actions">
        <button type="button" className="br-isolate" aria-pressed={isolate} onClick={() => onIsolate(!isolate)}>{isolate ? <Eye size={14}/> : <EyeOff size={14}/>}{isolate ? 'Isolating muscles' : 'Isolate muscles'}</button>
        <small>Displays this regional record; not a muscle-specific assessment.</small>
      </div>
    </div>
    <details className="br-source"><summary>View check-in evidence</summary>
      {before && <p><strong>Alex · {formatDate(before.date, true)}</strong><br/>“{before.quote}”</p>}
      {after && <p><strong>Alex · {formatDate(after.date, true)}</strong><br/>“{after.quote}”</p>}
      {!after && <p>No check-in for this region on or before {formatDate(date, true)}.</p>}
    </details>
    <p className="br-change-note">Colours compare the two most recent check-ins up to {formatDate(date)}; they do not measure tissue healing or strength.</p>
  </article>;
}
