import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Expand, Mic, Minimize, Plus, RotateCcw, X } from 'lucide-react';
import RecordViewer from './RecordViewer';
import ProgressPanel from './ProgressPanel';
import ProgressTimeline from './ProgressTimeline';
import { baseline, initialObservations, consultation, progressRecords, progressStatus, canConfirm, locations, sampleProposals, sampleTranscript } from './model';
import type { Annotation, Observation, Region } from './model';
import './body-record.css';

type Stage = 'idle' | 'capture' | 'recording' | 'processing' | 'review' | 'error';
export default function BodyRecord({ embedded = false }: { embedded?: boolean }) {
  const [timelineStep, setTimelineStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState<'notes' | 'progress'>('notes');
  const [selected, setSelected] = useState<Region | null>(null);
  const [details, setDetails] = useState(true);
  const [expanded, setExpanded] = useState(embedded && location.hash === '#body-record');
  const [focusRequest, setFocusRequest] = useState(0);
  const [resetRequest, setResetRequest] = useState(0);
  const [stage, setStage] = useState<Stage>('idle');
  const [mode, setMode] = useState<'record' | 'paste'>('record');
  const [agreed, setAgreed] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [proposals, setProposals] = useState<Annotation[]>([]);
  const [confirmed, setConfirmed] = useState<Annotation[]>(baseline);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [observations, setObservations] = useState<Observation[]>(initialObservations);
  const [editing, setEditing] = useState<{ id: string | null; region: Region; text: string } | null>(null);
  const [notice, setNotice] = useState('');
  const [resetting, setResetting] = useState(false);
  const expandButton = useRef<HTMLButtonElement>(null);
  const captureButton = useRef<HTMLButtonElement>(null);
  const observationButton = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const drawerTitle = useRef<HTMLHeadingElement>(null);
  const isCapture = stage !== 'idle';
  const compact = embedded && !expanded;
  const showDetails = !compact && (details || isCapture);
  const published = confirmed.length > baseline.length;
  const currentAnnotations = confirmed.filter(item => item.region === selected);

  useEffect(() => {
    if (!embedded) return;
    const openFromLink = () => { if (location.hash === '#body-record') openRecord(); };
    window.addEventListener('hashchange', openFromLink);
    return () => window.removeEventListener('hashchange', openFromLink);
  }, [embedded]);

  useEffect(() => {
    if (!playing || view !== 'progress') return;
    const timer = window.setTimeout(() => { setTimelineStep(1); setPlaying(false); }, 2200);
    return () => clearTimeout(timer);
  }, [playing, view]);
  function scrub(step: number) { setPlaying(false); setTimelineStep(step); }
  function replay() {
    if (playing) { setPlaying(false); return; }
    setTimelineStep(0); setPlaying(true);
  }
  function select(region: Region) { if (embedded) setExpanded(true); setSelected(region); setDetails(true); setFocusRequest(value => value + 1); }
  function openRecord() { setDetails(true); setExpanded(true); }
  function exitExpanded() { setExpanded(false); if (embedded) setResetRequest(value => value + 1); requestAnimationFrame(() => expandButton.current?.focus()); }
  function closeCapture() {
    if (stage === 'recording' || stage === 'processing') return;
    setStage('idle'); setNotice('Draft retained for this visit. Reopen Add consultation to continue.');
    requestAnimationFrame(() => captureButton.current?.focus());
  }
  function closeObservation() { setEditing(null); requestAnimationFrame(() => observationButton.current?.focus()); }
  useEffect(() => {
    if (stage !== 'recording') return;
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [stage]);
  useEffect(() => { if (isCapture) drawerTitle.current?.focus(); }, [isCapture]);
  useEffect(() => {
    if (!editing && !resetting) return;
    dialogRef.current?.querySelector<HTMLElement>('textarea, button, select')?.focus();
  }, [!!editing, resetting]);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    workspace.current?.focus();
    return () => { document.body.style.overflow = previous; };
  }, [expanded]);
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        // The embedded record must not intercept Escape from Today's other dialogs.
        if (embedded && !expanded && !editing && !resetting) return;
        event.preventDefault();
        if (editing) closeObservation();
        else if (resetting) setResetting(false);
        else if (expanded) exitExpanded();
        else if (isCapture) closeCapture();
        else if (!compact) { setDetails(false); }
      }
      if (event.key === 'Tab') {
        const scope = editing || resetting ? dialogRef.current : expanded ? workspace.current : null;
        if (!scope) return;
        const items = Array.from(scope.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, select, input, [tabindex="0"]')).filter(item => item.offsetParent !== null);
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  });
  function process() { setStage('processing'); setProposals([]); }
  function review() { setProposals(sampleProposals()); setStage('review'); select('shoulder'); }
  function publish() {
    if (!canConfirm(proposals)) return;
    const eventId = crypto.randomUUID();
    setConfirmed(items => [...items, ...proposals.map(item => ({ ...item, id: `${eventId}-${item.id}` }))]);
    setUpdatedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setStage('idle'); setProposals([]); setTranscript(''); setAgreed(false); setSeconds(0);
    setNotice('Consultation notes added to Alex’s record. Saved for this visit only.');
    select(proposals[0].region!);
  }
  function reset() {
    setPlaying(false); setTimelineStep(1); setView('notes'); setSelected(null); setDetails(true); setStage('idle'); setTranscript(''); setSeconds(0); setAgreed(false);
    setProposals([]); setConfirmed(baseline); setObservations(initialObservations); setEditing(null); setUpdatedAt(null); setResetting(false); setNotice('Demo reset.'); setResetRequest(value => value + 1);
  }
  const locationSelect = (value: Region | null, onChange: (value: Region | null) => void, label: string) => <label className="br-field">{label}<select value={value ?? ''} onChange={event => onChange(event.target.value ? event.target.value as Region : null)}><option value="">Choose a region</option>{(Object.keys(locations) as Region[]).map(region => <option value={region} key={region}>{locations[region].label}</option>)}</select></label>;

  return <section className={`br-root ${embedded ? 'br-embedded' : ''} ${compact ? 'br-compact' : ''}`}>
    {!embedded && <><header className="br-heading"><div><span className="br-eyebrow">ALEX MORGAN · CLIENT VIEW</span><h1>Your body record.</h1><p>Your consultation notes, observations and next review.</p></div><button className="br-reset" onClick={() => setResetting(true)}><RotateCcw size={15}/> Reset demo</button></header>
    <div className="br-demo-label"><span>PROTOTYPE</span> Demo data · Processing preview · Changes last until you leave or refresh</div></>}
    <div className={`br-workspace ${expanded ? 'br-expanded' : ''}`} ref={workspace} tabIndex={-1} role={expanded ? 'dialog' : undefined} aria-modal={expanded || undefined} aria-label="Body record workspace">
      <div className="br-workspace-bar"><div><span className="br-eyebrow">{compact ? "THE WHOLE PICTURE" : "MY BODY"}</span>{compact ? <h2>Your body record</h2> : <strong>Alex Morgan <span className="br-subtle">/ Reference anatomy</span></strong>}</div><div className="br-actions"><button ref={captureButton} className="br-primary" onClick={() => { if (embedded) openRecord(); setPlaying(false); setView('notes'); if (stage === 'idle') setStage(proposals.length ? 'review' : 'capture'); }}><Mic size={16}/>{isCapture ? 'Consultation open' : 'Add consultation'}</button><button ref={expandButton} aria-label={expanded ? 'Exit full screen' : embedded ? 'Open body record' : 'Expand body'} onClick={() => expanded ? exitExpanded() : openRecord()}>{expanded ? <Minimize size={17}/> : <Expand size={17}/>}<span>{expanded ? 'Exit full screen' : embedded ? 'Open record' : 'Expand'}</span></button>{embedded && expanded && <button aria-label="Reset body record demo" onClick={() => setResetting(true)}><RotateCcw size={15}/></button>}</div></div>
      {!compact && <div className="br-date-strip"><span className="br-date-dot"/><strong>7 Sep 2026</strong><span>Latest consultation</span>{embedded && <span className="br-record-demo">Demo data · Changes last for this visit</span>}<span className="br-date-divider"/><span>{updatedAt ? `Record updated today at ${updatedAt}` : 'Record updated 7 Sep 2026'}</span><span className="br-subtle">Next review · 21 Sep</span></div>}
      <div className="br-view-switch" role="group" aria-label="Body display"><button aria-pressed={view === 'notes'} onClick={() => { setPlaying(false); setView('notes'); setDetails(true); }}>Notes</button><button aria-pressed={view === 'progress'} onClick={() => { setView('progress'); setDetails(true); }}>Progress</button><span>{view === 'progress' ? 'Comparing 31 Aug and 7 Sep · Your reported symptoms' : 'Consultation notes and your observations'}</span></div>
      <div className={`br-grid ${!showDetails ? 'br-details-hidden' : ''}`}>
        <div className={`br-body-area ${view === 'progress' ? 'br-progress-stage' : ''}`}><div className={`br-body-caption ${selected ? 'br-caption-selected' : ''}`}><span className="br-eyebrow">SELECT A REGION TO VIEW YOUR NOTES</span><h2></h2></div><RecordViewer compact={compact} progressStep={timelineStep} view={view} selected={selected} onSelect={select} focusRequest={focusRequest} resetRequest={resetRequest} draftRegions={stage === 'review' ? proposals.flatMap(item => item.region ? [item.region] : []) : []}/>{view === 'progress' && <>{!compact && <div className="br-change-callout" aria-live="polite"><span className="br-eyebrow">{locations[selected ?? 'shoulder'].label}</span><strong>{timelineStep === 0 ? 'Baseline recorded' : progressStatus(selected ?? 'shoulder') === 'Improved' ? 'Less discomfort' : 'No change reported'}</strong><span>{progressRecords[selected ?? 'shoulder'].activity}</span><b>{timelineStep === 0 ? progressRecords[selected ?? 'shoulder'].before : `${progressRecords[selected ?? 'shoulder'].before} → ${progressRecords[selected ?? 'shoulder'].after}`}<small> /10</small></b></div>}<ProgressTimeline step={timelineStep} playing={playing} onStep={scrub} onPlay={replay}/></>}{!compact && !details && !isCapture && <button className="br-show-details" onClick={() => setDetails(true)}>Show record details</button>}</div>
        {showDetails && <aside className="br-panel" aria-label={isCapture ? 'Coach note' : 'Record details'}>
          {isCapture ? <>
            <div className="br-panel-title"><div><span className="br-eyebrow">STEP {stage === 'review' ? '2' : '1'} OF 2 · COACH VIEW</span><h2 ref={drawerTitle} tabIndex={-1}>{stage === 'review' ? 'Review consultation notes' : 'Add consultation'}</h2></div><button aria-label="Close coach note" disabled={stage === 'recording' || stage === 'processing'} onClick={closeCapture}><X size={17}/></button></div>
            <p className="br-subtle">Stephen · Consultation for Alex Morgan</p>
            {(stage === 'capture' || stage === 'recording') && <>
              <div className="br-tabs"><button aria-pressed={mode === 'record'} disabled={stage === 'recording'} onClick={() => setMode('record')}>Record</button><button aria-pressed={mode === 'paste'} disabled={stage === 'recording'} onClick={() => setMode('paste')}>Paste transcript</button></div>
              {mode === 'record' ? <div className="br-recorder"><span className={`br-mic ${stage === 'recording' ? 'recording' : ''}`}><Mic size={28}/></span><h3>{stage === 'recording' ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'Record a session note'}</h3><p>Simulated recording. Your microphone is not accessed; finishing loads the sample conversation.</p>{stage === 'recording' ? <div className="br-actions"><button className="br-primary" onClick={() => { setTranscript(sampleTranscript); setStage('capture'); setMode('paste'); }}>Finish</button><button onClick={() => { setStage('capture'); setSeconds(0); }}>Discard</button></div> : <><label className="br-check"><input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)}/>Coach and client agree to this sample capture.</label><button className="br-primary" disabled={!agreed} onClick={() => { setSeconds(0); setStage('recording'); }}>Start simulated recording</button></>}</div> : <label className="br-field">Consultation transcript<textarea rows={8} value={transcript} onChange={event => setTranscript(event.target.value)} placeholder="Paste a transcript to explore the capture layout…"/></label>}
              {stage !== 'recording' && <><button className="br-text-button" onClick={() => { setTranscript(sampleTranscript); setMode('paste'); }}>Load example consultation</button>{transcript && <><p className="br-info">This walkthrough uses fixed sample proposals. Your text is retained, but is not analysed.</p><button className="br-primary br-wide" onClick={process}>Preview sample processing <ArrowRight size={16}/></button></>}</>}
            </>}
            {stage === 'processing' && <div className="br-processing"><div className="br-orbit"><Mic size={25}/></div><h3>Preparing consultation notes</h3><p>Simulated processing checkpoint. No transcription or model request is running.</p><ol><li>Receive consultation</li><li>Identify source-backed observations</li><li>Prepare regional proposals for review</li></ol><button className="br-primary br-wide" onClick={review}>Show sample proposals</button><button className="br-text-button" onClick={() => setStage('error')}>Preview processing failure</button></div>}
            {stage === 'error' && <div className="br-error" role="alert"><h3>We couldn’t prepare the notes.</h3><p>Example error state. Your transcript is still here.</p><button className="br-primary" onClick={process}>Retry sample processing</button><button onClick={() => { setStage('capture'); setMode('paste'); }}>Back to transcript</button></div>}
            {stage === 'review' && <><p>Check each note and its location before adding it to Alex’s record.</p><details className="br-source"><summary>Source: consultation transcript</summary><p>{sampleTranscript}</p></details>{transcript !== sampleTranscript && <details className="br-source"><summary>Your supplied text (not analysed)</summary><p>{transcript}</p></details>}
              {proposals.map((item, index) => <article className="br-proposal" key={item.id}><div className="br-card-top"><span className="br-badge draft">DRAFT {index + 1}</span><button aria-label={`Remove proposal ${index + 1}`} onClick={() => setProposals(items => items.filter(p => p.id !== item.id))}>Remove</button></div>{locationSelect(item.region, region => { setProposals(items => items.map(p => p.id === item.id ? { ...p, region } : p)); if (region) select(region); }, `Location for proposal ${index + 1}`)}<label className="br-field">Note<textarea rows={3} value={item.text} onChange={event => setProposals(items => items.map(p => p.id === item.id ? { ...p, text: event.target.value } : p))}/></label><details className="br-source"><summary>View source words</summary><p>“{item.source}”</p></details></article>)}
              {!proposals.length && <p className="br-info">No proposals remain. Return to the transcript to start again.</p>}{!canConfirm(proposals) && proposals.length > 0 && <p className="br-error">Choose a location and add text for each note, or remove it.</p>}
              <button className="br-primary br-wide" disabled={!canConfirm(proposals)} onClick={publish}><Check size={16}/> Confirm {proposals.length} notes</button><button className="br-text-button" onClick={() => { setStage('capture'); setMode('paste'); setProposals([]); }}>Back to transcript</button>
            </>}
          </> : view === 'progress' ? <ProgressPanel step={timelineStep} selected={selected} onSelect={select} onClose={() => { if (selected) setSelected(null); else setDetails(false); }}/> : <>
            <div className="br-panel-title"><div><span className="br-eyebrow">{selected ? 'REGION RECORD' : 'LATEST REPORT'}</span><h2>{selected ? locations[selected].label : 'Latest consultation'}</h2></div><button aria-label="Close record details" onClick={() => { if (expanded) setDetails(false); else if (selected) setSelected(null); else setDetails(false); }}><X size={17}/></button></div>
            {selected ? <><p className="br-subtle">Broad body region · Left side</p><div className="br-measurement"><span>MEASUREMENTS</span><p>No strength measurements recorded at this consultation.</p></div><h3>From your coach</h3>{currentAnnotations.length ? currentAnnotations.map(item => <article className="br-note" key={item.id}><span className="br-badge">{item.id.startsWith('baseline-') ? 'CONSULTATION NOTE' : 'REVIEWED NOTE'}</span><p>{item.text}</p><small>Stephen · {item.date ?? 'Today'}</small><details className="br-source"><summary>View source words</summary><p>“{item.source}”</p></details></article>) : <p className="br-empty">No consultation notes for this region yet.</p>}
              <div className="br-section-title"><h3>Your observations</h3><button ref={observationButton} aria-label="Add observation" onClick={() => setEditing({ id: null, region: selected, text: '' })}><Plus size={17}/></button></div>{observations.filter(item => item.region === selected).map(item => <article className="br-note br-client-note" key={item.id}><span className="br-badge">YOU NOTICED</span><p className="br-exact-text">{item.text}</p><small>Alex · {item.date}</small><div className="br-actions"><button onClick={() => setEditing({ ...item })}>Edit</button><button onClick={() => { setObservations(items => items.filter(p => p.id !== item.id)); setNotice('Observation deleted.'); }}>Delete</button></div></article>)}{!observations.some(item => item.region === selected) && <p className="br-empty">Something you noticed between sessions? Keep it here, in your own words.</p>}<button className="br-outline br-wide" onClick={() => setEditing({ id: null, region: selected, text: '' })}>Add an observation</button><button className="br-text-button" onClick={() => setSelected(null)}>← Back to latest report</button>
            </> : <><p className="br-subtle">Stephen · {consultation.date}</p><p className="br-report-intro">{consultation.summary}</p><div className="br-follow-up"><span className="br-eyebrow">NEXT REVIEW · {consultation.nextReview}</span><p>{consultation.followUp}</p></div>{published && <p className="br-info">New consultation notes added today. Select a region below to read them.</p>}<h3>Explore your record</h3>{(Object.keys(locations) as Region[]).map((region, index) => <button key={region} className="br-region-row" onClick={() => select(region)}><span className="br-region-number">0{index + 1}</span><span><strong>{locations[region].label}</strong><small>{confirmed.filter(item => item.region === region).length} coach notes · {observations.filter(item => item.region === region).length} observations</small></span><ArrowRight size={17}/></button>)}<div className="br-info"><strong>Between sessions</strong><p>Notice something new? Select the area on your body and add an observation for your next review.</p><small>{observations.length} observations in your record</small></div></>}
          </>}
        </aside>}
      </div>
      {compact && <div className="br-hero-record-summary">
        <div><span className="br-eyebrow">{view === 'progress' ? 'EXPLORE THE CHANGE' : 'LATEST CONSULTATION · 7 SEP'}</span><span>{confirmed.length} coach notes · {observations.length} observations</span></div>
        <div className="br-hero-regions">{(Object.keys(locations) as Region[]).map(region => <button key={region} onClick={() => select(region)}>{locations[region].label}<ArrowRight size={14}/></button>)}</div>
        <small>Demo data · Changes last until you leave Today or refresh</small>
      </div>}
      {notice && <div className="br-notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={14}/></button></div>}
    </div>
    {(editing || resetting) && <div className="br-modal-backdrop"><div className="br-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="br-modal-title">{editing ? <><div className="br-panel-title"><h2 id="br-modal-title">What did you notice?</h2><button aria-label="Cancel observation" onClick={closeObservation}><X size={18}/></button></div><p>Your words, attached to a place. This won’t send a message to your coach.</p>{locationSelect(editing.region, region => { if (region) setEditing({ ...editing, region }); }, 'Location')}<label className="br-field">Observation<textarea autoFocus rows={5} value={editing.text} onChange={event => setEditing({ ...editing, text: event.target.value })} placeholder="For example: I noticed this after working at my desk…"/></label><small>Today · Saved for this visit only</small><div className="br-actions"><button onClick={closeObservation}>Cancel</button><button className="br-primary" disabled={!editing.text.trim()} onClick={() => { const entry: Observation = { id: editing.id ?? crypto.randomUUID(), text: editing.text, region: editing.region, date: new Date().toLocaleDateString('en-GB') }; setObservations(items => [...items.filter(item => item.id !== entry.id), entry]); select(entry.region); closeObservation(); setNotice('Observation saved for this visit.'); }}>Save observation</button></div></> : <><h2 id="br-modal-title">Reset this walkthrough?</h2><p>This removes sample updates and observations from this visit. Kingsley’s other prototype records are unchanged.</p><div className="br-actions"><button onClick={() => setResetting(false)}>Keep exploring</button><button className="br-primary" onClick={reset}>Reset demo</button></div></>}</div></div>}
  </section>;
}
