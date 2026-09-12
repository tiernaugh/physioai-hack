import { ArrowDownRight, ArrowRight, X } from 'lucide-react';
import { locations, progressRecords, progressStatus, progressMuscles } from './model';
import type { Region } from './model';

export default function ProgressPanel({ selected, onSelect, onClose, step }: { step: number; selected: Region | null; onSelect: (region: Region) => void; onClose: () => void }) {
  const regions: Region[] = [selected ?? 'shoulder'];
  return <>
    <div className="br-panel-title"><div><span className="br-eyebrow">RECORDED CHANGE</span><h2>{locations[selected ?? 'shoulder'].label}</h2></div><button aria-label="Close progress details" onClick={onClose}><X size={17}/></button></div>
    <p>{step === 0 ? '31 Aug 2026 · Baseline' : '7 Sep 2026 · Compared with 31 Aug'}</p>
    <div className="br-progress-region-tabs">{(Object.keys(locations) as Region[]).map(region => <button key={region} aria-pressed={(selected ?? 'shoulder') === region} onClick={() => onSelect(region)}>{locations[region].label}</button>)}</div>
    <div className="br-progress-key"><span className="improved">Improved</span><span className="unchanged">Unchanged</span><span className="worsened">Worsened</span><span>No comparison</span></div>
    {regions.map(region => {
      const item = progressRecords[region], status = progressStatus(region);
      return <article className={`br-progress-card ${status.toLowerCase()}`} key={region}>
        
        <p>{item.activity}</p><span className="br-badge">{step === 0 ? 'Baseline' : status} · Your check-in</span>
        <div className="br-comparison br-comparison-hero"><div><strong>{item.before}<small>/10</small></strong><span>31 Aug</span></div>{step === 1 && <>{status === 'Improved' ? <ArrowDownRight size={24}/> : <ArrowRight size={24}/>}<div><strong>{item.after}<small>/10</small></strong><span>7 Sep</span></div></>}</div>
        <small>0 = none · 10 = most severe</small>
        <details className="br-source"><summary>Highlighted muscles</summary><p>{progressMuscles[region].label}</p><small>Displays this regional record; not a muscle-specific assessment.</small></details>
        <details className="br-source"><summary>View check-in evidence</summary><p>{status === 'Improved' ? 'Green: Alex reported less discomfort during the same activity.' : status === 'Unchanged' ? 'Amber: Alex reported the same score at both check-ins.' : 'Red: Alex reported a higher score at the later check-in.'} This does not measure tissue healing or strength.</p><p><strong>31 Aug · Alex</strong><br/>“{item.beforeQuote}”</p><p><strong>7 Sep · Alex</strong><br/>“{item.afterQuote}”</p></details>
      </article>;
    })}
    <p className="br-subtle">{step === 0 ? 'This is your first check-in. A comparison becomes available at the next recorded date.' : 'Colours compare these two check-ins. Neutral muscles have no comparison.'}</p>
  </>;
}
