import { Pause, Play, RotateCcw } from 'lucide-react';

export default function ProgressTimeline({ step, playing, onStep, onPlay }: { step: number; playing: boolean; onStep: (step: number) => void; onPlay: () => void }) {
  return <div className="br-timeline">
    <div className="br-timeline-head"><div><span className="br-eyebrow">YOUR BODY OVER TIME</span><strong>{step === 0 ? '31 August 2026' : '7 September 2026'}</strong></div><button className="br-play" aria-label={playing ? 'Pause replay' : step === 1 ? 'Replay progress' : 'Play progress'} onClick={onPlay}>{playing ? <Pause size={18}/> : step === 1 ? <RotateCcw size={18}/> : <Play size={18}/>}<span>{playing ? 'Pause' : step === 1 ? 'Replay' : 'Play'}</span></button></div>
    <label className="sr-only" htmlFor="br-record-date">Recorded check-in</label><input id="br-record-date" type="range" min="0" max="1" step="1" value={step} aria-valuetext={step === 0 ? '31 August, baseline check-in' : '7 September, consultation'} onChange={event => onStep(Number(event.target.value))}/>
    <div className="br-timeline-dates"><button aria-pressed={step === 0} onClick={() => onStep(0)}><span>31 Aug</span><small>Baseline check-in</small></button><button aria-pressed={step === 1} onClick={() => onStep(1)}><span>7 Sep</span><small>Consultation</small></button></div>
    <small className="br-timeline-foot">2 recorded check-ins · Colours show change from baseline</small>
  </div>;
}
