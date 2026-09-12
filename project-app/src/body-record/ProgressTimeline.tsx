import { Pause, Play, RotateCcw } from 'lucide-react';
import { formatDate, timeline as sampleTimeline } from './model';

// Slim date scrubber overlaid on the viewport. Stops come from the model spine; nothing here is hardcoded.
export default function ProgressTimeline({ index, playing, compact = false, dates = sampleTimeline, onScrub, onPlay }: { index: number; playing: boolean; compact?: boolean; dates?: string[]; onScrub: (index: number) => void; onPlay: () => void }) {
  const timeline = dates;
  const last = timeline.length - 1;
  const date = timeline[index] ?? timeline[last];
  const atEnd = index >= last;
  return <div className={`br-scrub ${compact ? 'br-scrub-compact' : ''} ${dates.length > 7 ? 'br-scrub-dense' : ''}`} role="group" aria-label="Record date">
    <button type="button" className="br-scrub-play" aria-label={playing ? 'Pause replay' : atEnd ? 'Replay from the first check-in' : 'Play through the dates'} onClick={onPlay}>{playing ? <Pause size={13}/> : atEnd ? <RotateCcw size={13}/> : <Play size={13}/>}</button>
    <div className="br-scrub-track">
      <input type="range" min={0} max={last} step={1} value={index} aria-label="Record date" aria-valuetext={`${formatDate(date, true)}${atEnd ? ', latest' : ''}`} onChange={event => onScrub(Number(event.target.value))}/>
      <span className="br-scrub-line" aria-hidden="true"><span className="br-scrub-fill" style={{ width: `${(index / Math.max(1, last)) * 100}%` }}/></span>
      {timeline.map((stop, i) => <button type="button" key={stop} tabIndex={-1} className={`br-scrub-stop ${i === index ? 'current' : ''} ${i < index ? 'passed' : ''}`} style={{ left: `${(i / Math.max(1, last)) * 100}%` }} aria-label={`Show ${formatDate(stop, true)}`} aria-pressed={i === index} onClick={() => onScrub(i)}><i/><span>{formatDate(stop)}</span></button>)}
    </div>
    <div className="br-scrub-current" aria-live="polite"><strong>{formatDate(date, true)}</strong><small>{atEnd ? 'Latest' : playing ? 'Replaying' : 'Earlier date'}</small></div>
  </div>;
}
