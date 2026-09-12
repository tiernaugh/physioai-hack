import { useEffect, useState } from 'react';
import { Check, Mic, RefreshCw, MessageCircle, ArrowRight, LockKeyhole } from 'lucide-react';
import './voice-inbox.css';

type Extraction = { summary: string; exercise: string | null; sets: number | null; repetitions: number | null;
  bodyRegion: string | null; side: string; discomfort: number | null; reportedWhen: string | null; clarification: string | null };
type Note = { id: string; patientId: string; source: string; receivedAt: string; status: string;
  transcript: string | null; extraction: Extraction | null; error: string | null; replyStatus: string; reply?: string };
type Status = { mode: string; channel: string; missing: string[]; localReady: boolean };

export default function VoiceInbox() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState('');
  const [locked, setLocked] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  async function request(path: string, method = 'GET', body?: unknown) {
    const res = await fetch(`/api/voice/${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (res.status === 401) setLocked(true);
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Could not reach the voice service. Start it with npm run voice.');
    return payload;
  }
  async function refresh() {
    try {
      const [nextStatus, nextNotes] = await Promise.all([request('status'), request('notes')]);
      setStatus(nextStatus); setNotes(nextNotes); setError(''); setLocked(false);
    } catch (e) { setError((e as Error).message); }
  }
  useEffect(() => { void refresh(); }, []);
  useEffect(() => {
    if (!notes.some(n => ['received', 'transcribing', 'extracting'].includes(n.status))) return;
    const timer = window.setTimeout(() => void refresh(), 2500);
    return () => window.clearTimeout(timer);
  }, [notes, token]);
  async function act(path: string, body?: unknown) {
    setBusy(true); setError('');
    try { const result = await request(path, 'POST', body); if (result.id) setSelected(result.id); await refresh(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError('Choose an audio file under 8 MiB.'); return; }
    const reader = new FileReader();
    reader.onerror = () => setError('Could not read that audio file.');
    reader.onload = () => void act('local', { audio: { type: 'data', value: String(reader.result).split(',')[1], mimeType: file.type.startsWith('audio/') ? file.type : 'audio/ogg' } });
    reader.readAsDataURL(file);
  }
  const active = notes.find(n => n.id === selected) || notes[0];
  const saved = notes.filter(n => ['saved', 'reviewed'].includes(n.status)).length;
  return <section className="voice-inbox">
    <div className="voice-banner">
      <div className="voice-brand"><MessageCircle size={23}/></div>
      <div><strong>Speak in WhatsApp. Remember it here.</strong><p>Voice notes become reported entries in your profile.</p></div>
      <span className={`voice-pill ${status?.mode === 'live' ? 'live' : ''}`}>{status ? status.mode === 'live' ? 'WhatsApp API' : status.mode === 'local' ? 'Local · no paid AI services' : 'Demo · no WhatsApp connection' : 'Service offline'}</span>
    </div>
    <div className="voice-flow">{['WhatsApp note', 'Transcript', 'Extracted details', 'Saved report'].map((label, i) => <span key={label}>{label}{i < 3 && <ArrowRight size={14}/>}</span>)}</div>
    {error && <div className="voice-error" role="alert">{error}</div>}
    {locked && <form className="voice-unlock" onSubmit={e => { e.preventDefault(); void refresh(); }}>
      <LockKeyhole size={18}/><label htmlFor="admin-token">Admin token</label><input id="admin-token" type="password" value={token} onChange={e => setToken(e.target.value)} autoComplete="off"/><button className="outline-button">Unlock</button>
    </form>}
    <div className="voice-toolbar"><div><span className="eyebrow">VOICE NOTE INBOX</span><h2>{saved} saved {saved === 1 ? 'report' : 'reports'}</h2></div>
      <div className="voice-actions"><button className="outline-button" onClick={() => void refresh()} disabled={busy}><RefreshCw size={15}/> Refresh</button>
      {status && status.mode !== 'live' && <button className="voice-primary" disabled={busy} onClick={() => void act('demo')}><Mic size={16}/>{busy ? 'Processing…' : 'Try a sample voice note'}</button>}</div>
    </div>
    {status?.mode === 'demo' && <p className="voice-caption">The sample uses a fixed transcript and extraction. It tests saving and review without recording audio, calling AI, or sending WhatsApp messages.</p>}
    {status?.mode === 'local' && <div className="voice-local">
      <strong>Try your own note, free on this computer</strong>
      <p>Upload an exported WhatsApp voice note, or paste its text. Whisper transcribes locally; a basic English parser fills recognised fields for review.</p>
      <form onSubmit={e => { e.preventDefault(); void act('local', { transcript }); }}>
        <label htmlFor="local-transcript">Note text</label>
        <textarea id="local-transcript" maxLength={20000} value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Today I did three sets of ten calf raises…"/>
        <div className="voice-actions"><button className="voice-primary" disabled={busy || !transcript.trim()}>Save text report</button>
        <label className="outline-button">Upload voice note<input aria-label="Upload voice note" type="file" accept="audio/*,.ogg,.opus,.m4a" disabled={busy || !status.localReady} onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }}/></label></div>
      </form>
      <small>{status.localReady ? 'Local transcription ready · 8 MiB / 10 minutes maximum · no WhatsApp messages sent from this test' : 'Text is ready. Audio needs local Whisper setup; see the setup guide.'}</small>
    </div>}
    <div className="voice-columns">
      <div className="voice-list" aria-label="Voice notes">
        {notes.length === 0 ? <div className="voice-empty"><Mic size={32}/><h3>Your first note starts here</h3><p>{status?.mode === 'live' ? 'Send a voice note from an enrolled number, then refresh.' : 'Try the sample to see a note move into your system.'}</p></div> : notes.map(note => <button key={note.id} className={`voice-note ${active?.id === note.id ? 'selected' : ''}`} onClick={() => setSelected(note.id)}>
          <div><span className="voice-note-icon"><Mic size={17}/></span><span className="voice-pill">{note.status === 'saved' ? 'Saved · unreviewed' : note.status}</span></div>
          <strong>{note.extraction?.exercise || 'Reported note'}</strong><p>{note.transcript || 'Audio received; transcript pending.'}</p>
          <small>{note.patientId} · {new Date(note.receivedAt).toLocaleString()} · {note.source === 'demo' ? 'Sample' : note.source === 'local' ? 'Local test' : 'WhatsApp'}</small>
        </button>)}
      </div>
      <div className="voice-detail">
        {active ? <>
          <div className="voice-detail-title"><div><span className="eyebrow">REPORTED NOTE</span><h2>{active.extraction?.exercise || 'Voice note'}</h2></div><span className="voice-pill">{active.patientId}</span></div>
          <h3>Original transcript</h3><blockquote>{active.transcript || 'Not transcribed yet.'}</blockquote>
          {active.extraction && <><h3>Extracted details</h3><dl className="voice-fields">
            {Object.entries({ Exercise: active.extraction.exercise, Sets: active.extraction.sets, 'Reps per set': active.extraction.repetitions,
              Region: active.extraction.bodyRegion, Side: active.extraction.side, 'Discomfort / 10': active.extraction.discomfort,
              'Reported time': active.extraction.reportedWhen }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? 'Not reported'}</dd></div>)}
          </dl><p>{active.extraction.summary}</p>{active.extraction.clarification && <div className="voice-error">Clarification needed: {active.extraction.clarification}</div>}</>}
          {active.error && <div className="voice-error">{active.error}</div>}
          <div className="voice-save"><Check size={18}/><div><strong>{['saved', 'reviewed'].includes(active.status) ? 'Stored in the voice-note record' : 'Awaiting processing'}</strong><p>Reported information only. Prescribed routines remain separate.</p></div></div>
          <h3>WhatsApp reply</h3><p className="voice-caption">{active.replyStatus === 'simulated' ? 'Preview only · no message sent' : active.replyStatus === 'sent' ? 'Confirmation sent' : ['unknown', 'sending'].includes(active.replyStatus) ? 'Reply delivery unconfirmed · not automatically resent' : active.replyStatus === 'window_expired' ? 'Saved · reply window expired' : active.replyStatus === 'failed' ? 'Saved, but confirmation could not be sent' : 'No confirmation sent'}</p>
          {active.reply && <div className="voice-reply">{active.reply}</div>}
          {active.status === 'saved' && <button className="outline-button" disabled={busy} onClick={() => void act(`notes/${encodeURIComponent(active.id)}/review`)}><Check size={15}/> Mark as reviewed</button>}
          {['failed', 'received', 'transcribing', 'extracting'].includes(active.status) && <button className="outline-button" disabled={busy} onClick={() => void act(`notes/${encodeURIComponent(active.id)}/retry`)}>Retry processing</button>}
        </> : <div className="voice-empty"><MessageCircle size={36}/><h3>A clear record of what was said</h3><p>Select a note to see its transcript, extracted details and save status.</p></div>}
      </div>
    </div>
    <details className="voice-setup"><summary>Connection setup</summary><p>Live mode connects directly to the WhatsApp Business Platform. Configure Meta credentials and enrolled sender-to-profile mappings in .env. Transcription and basic extraction run locally, with no AI API key or subscription.</p>
      {status && <p>{status.missing.length ? `Not configured: ${status.missing.join(', ')}` : 'Required environment values are present.'} Channel status: {status.channel}. Listening locally does not verify public webhook delivery. Meta service replies are free within the user-initiated 24-hour window; hosting can still cost money.</p>}
    </details>
  </section>;
}
