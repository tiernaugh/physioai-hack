import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Expand, Mic, Minimize, RefreshCw, X } from 'lucide-react';
import type { AnalysisRegion } from '../analysis-anatomy';
import { regionLabel } from '../analysis-anatomy';
import { actorNames, dayKey, demoToday } from '../care-data';
import type { ActivityEntry, CareStore } from '../care-data';
import type { VoiceNote } from '../voice-analysis';
import type { TimelineItem } from '../progress-timeline';
import BodyRecord from './BodyRecord';
import RecordViewer from './RecordViewer';
import type { ViewerRegion } from './RecordViewer';
import ProgressTimeline from './ProgressTimeline';
import { formatDate } from './model';
import { bodyEntriesAsOf, bodyRecordDates, bodyRecordRegions, buildBodyHealthRecord } from './live-data';
import './body-health.css';

export default function BodyHealth({ entries, updates, voiceNotes, voiceState, onRefresh, onOpenVoice, onViewEntry }: {
  entries: ActivityEntry[]; updates: CareStore['updates']; voiceNotes: VoiceNote[]; voiceState: string;
  onRefresh: () => void; onOpenVoice: (id: string | null) => void; onViewEntry: (item: TimelineItem) => void;
}) {
  const [sample, setSample] = useState(false);
  const [expanded, setExpanded] = useState(location.hash === '#body-record');
  const [selected, setSelected] = useState<AnalysisRegion | 'unplaced' | null>(null);
  const [asOf, setAsOf] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const [resetRequest, setResetRequest] = useState(0);
  const [isolate, setIsolate] = useState(false);
  const workspace = useRef<HTMLDivElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const items = useMemo(() => buildBodyHealthRecord(entries, updates, voiceNotes), [entries, updates, voiceNotes]);
  const dates = bodyRecordDates(items);
  if (!dates.length) dates.push(demoToday);
  const latest = dates[dates.length - 1];
  const date = asOf && dates.includes(asOf) ? asOf : latest;
  const index = dates.indexOf(date);
  const dated = bodyEntriesAsOf(items, date);
  const regions = bodyRecordRegions(dated);
  const unplaced = dated.filter(item => !item.areas.length || item.unplaced.length);
  const shown = (selected === 'unplaced' ? unplaced : selected ? dated.filter(item => item.areas.some(area => area.region === selected)) : dated).slice().reverse();
  const recordRegions = Object.fromEntries(regions.map(region => [region, { label: regionLabel(region), atlasRegion: region, status: 'reported' } satisfies ViewerRegion])) as Record<AnalysisRegion, ViewerRegion>;
  const activeRegion = selected && selected !== 'unplaced' && regions.includes(selected) ? selected : null;
  const compact = !expanded;

  function close() { setExpanded(false); setPlaying(false); setResetRequest(value => value + 1); requestAnimationFrame(() => expandButton.current?.focus()); }
  function select(region: AnalysisRegion) { setSelected(region); setExpanded(true); setFocusRequest(value => value + 1); }
  function openVoice(id: string | null) { setExpanded(false); setPlaying(false); requestAnimationFrame(() => onOpenVoice(id)); }
  function scrub(next: number) { setPlaying(false); setAsOf(next >= dates.length - 1 ? null : dates[next]); }
  function replay() {
    if (playing) { setPlaying(false); return; }
    if (dates.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) { setAsOf(null); return; }
    if (index === dates.length - 1) setAsOf(dates[0]);
    setPlaying(true);
  }
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => { if (index >= dates.length - 2) { setAsOf(null); setPlaying(false); } else setAsOf(dates[index + 1]); }, 1100);
    return () => clearTimeout(timer);
  }, [playing, date, latest]);
  useEffect(() => {
    const open = () => { if (location.hash === '#body-record') { setSample(false); setExpanded(true); } };
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);
  useEffect(() => {
    if (!expanded || sample) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    workspace.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const controls = Array.from(workspace.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, summary, [tabindex="0"]') ?? []).filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === workspace.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === workspace.current)) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', key); };
  }, [expanded, sample]);

  return <div className="body-health">
    <div className="br-health-mode" role="group" aria-label="Body record source">
      <button aria-pressed={!sample} onClick={() => setSample(false)}>Saved record <span>{items.length}</span></button>
      <button aria-pressed={sample} onClick={() => { setExpanded(false); setPlaying(false); setSample(true); }}>Sample walkthrough</button>
    </div>
    {sample ? <BodyRecord embedded/> : <section className={`br-root br-embedded br-live ${compact ? 'br-compact' : ''}`}>
      <div ref={workspace} className={`br-workspace ${expanded ? 'br-expanded' : ''}`} role={expanded ? 'dialog' : undefined} aria-modal={expanded || undefined} aria-label="Body health record" tabIndex={-1}>
        <div className="br-workspace-bar">
          <div><span className="br-eyebrow">YOUR NOTES · CONNECTED BY LOCATION</span><h2>Your body health</h2></div>
          <div className="br-actions"><button className="br-primary" onClick={() => openVoice(null)}><Mic size={16}/> Add a voice note</button><button ref={expandButton} aria-label={expanded ? 'Close body health record' : 'Open body health record'} onClick={() => expanded ? close() : setExpanded(true)}>{expanded ? <Minimize size={17}/> : <Expand size={17}/>} {expanded ? 'Close record' : 'Open record'}</button></div>
        </div>
        <div className="br-health-connection"><span role="status">{voiceState} · {items.length} saved updates</span><button onClick={onRefresh}><RefreshCw size={12}/> Refresh</button></div>
        <div className="br-grid">
          <div className="br-body-area">
            <ProgressTimeline index={index} dates={dates} playing={playing} compact={compact} onScrub={scrub} onPlay={replay}/>
            <RecordViewer compact={compact} date={date} recordRegions={recordRegions} selected={activeRegion} onSelect={select} isolate={isolate ? activeRegion : null} draftRegions={[]} focusRequest={focusRequest} resetRequest={resetRequest}/>
          </div>
          {expanded && <aside className="br-panel" aria-label="Saved body notes">
            <div className="br-panel-title"><div><span className="br-eyebrow">AS OF {formatDate(date, true).toUpperCase()}</span><h2>{selected === 'unplaced' ? 'Notes without a clear location' : activeRegion ? regionLabel(activeRegion) : 'All saved updates'}</h2></div>{selected && <button aria-label="Show all body notes" onClick={() => setSelected(null)}><X size={17}/></button>}</div>
            <div className="br-health-region-list" role="group" aria-label="Filter saved body notes">
              <button aria-pressed={!selected} onClick={() => setSelected(null)}>All notes ({dated.length})</button>
              {regions.map(region => <button key={region} aria-pressed={selected === region} onClick={() => select(region)}>{regionLabel(region)}</button>)}
              {!!unplaced.length && <button aria-pressed={selected === 'unplaced'} onClick={() => setSelected('unplaced')}>Location unclear ({unplaced.length})</button>}
            </div>
            {activeRegion && <button className="br-text-button" aria-pressed={isolate} onClick={() => setIsolate(value => !value)}>{isolate ? 'Show whole body' : 'Isolate this area'}</button>}
            {!shown.length && <p className="br-info">{items.length ? 'No saved notes for this selection by this date.' : 'Save a voice note to start your body record. Named areas will appear on the body when the transcript is ready.'}</p>}
            {shown.map(item => <article className="br-note br-health-note" key={item.id}>
              <span className="br-badge">{item.voiceNote ? 'VOICE NOTE' : item.kind === 'comment' ? 'SAVED COMMENT' : 'SAVED ACTIVITY'}{item.voiceNote?.patientId === 'local-test' ? ' · LOCAL TEST' : ''}</span>
              <h3>{item.title}</h3><small>{actorNames[item.actor]} · {formatDate(dayKey(item.date), true)} · {item.source === 'whatsapp' ? 'WhatsApp' : 'Saved locally'}</small>
              <p className="br-exact-text">{item.body}</p>
              {(!item.areas.length || !!item.unplaced.length) && <small>Some wording has no clear body area or side. No location is assumed for it.</small>}
              {item.voiceNote?.analysis && <div className="br-health-analysis"><span className="br-eyebrow">AI INTERPRETATION · FOR REVIEW</span><p>{item.voiceNote.analysis.summary}</p></div>}
              {item.voiceNote?.analysisStatus && item.voiceNote.analysisStatus !== 'completed' && <small>Analysis: {item.voiceNote.analysisStatus}{item.voiceNote.analysisError ? ` · ${item.voiceNote.analysisError}` : ''}</small>}
              <button className="br-text-button" onClick={() => { if (item.voiceNote) openVoice(item.voiceNote.id); else { setExpanded(false); setPlaying(false); onViewEntry(item); } }}>{item.voiceNote ? 'Open voice note & analysis' : 'View full activity'} <ArrowRight size={14}/></button>
            </article>)}
          </aside>}
        </div>
        {compact && <div className="br-hero-record-summary">
          <div><span className="br-eyebrow">{dated.length ? `SAVED UPDATES · ${formatDate(date).toUpperCase()}` : 'START WITH YOUR OWN WORDS'}</span><span>{regions.length} areas mentioned · {dated.length} updates</span></div>
          <p className="br-hero-summary-text">{dated.length ? 'Explore what you reported, where you felt it and how your notes connect over time.' : 'Add a voice note or an activity note. Clear body locations appear here as your record updates.'}</p>
          <div className="br-hero-regions">{regions.map(region => <button key={region} onClick={() => select(region)}><span>{regionLabel(region)}<small>{dated.filter(item => item.areas.some(area => area.region === region)).length} saved notes</small></span><ArrowRight size={14}/></button>)}</div>
          {!!unplaced.length && <button className="br-text-button" onClick={() => { setSelected('unplaced'); setExpanded(true); }}>{unplaced.length} updates without a clear location <ArrowRight size={14}/></button>}
          <small>Locations come from original saved words. Amber marks mentions; no health score or change in severity is inferred.</small>
        </div>}
      </div>
    </section>}
  </div>;
}
