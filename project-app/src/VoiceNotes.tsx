import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  FileAudio,
  LoaderCircle,
  Mic,
  RefreshCw,
  Square,
  Upload,
  X,
} from "lucide-react";
import "./voice-notes.css";
import { createVoiceRecording, maxAudioBytes } from "./voice-recording";
import type { RecordingState } from "./voice-recording";

import VoiceAnalysis from './VoiceAnalysis';
import { voiceInProgress as inProgress } from './voice-analysis';
import type { VoiceNote, VoiceContextSource } from './voice-analysis';
export type { VoiceNote } from './voice-analysis';
type VoiceStatus = { mode: string; localReady: boolean; analysisProvider?: string };
const audioExtensions: Record<string, string> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  opus: "audio/ogg",
  wav: "audio/wav",
  webm: "audio/webm",
  aac: "audio/aac",
  flac: "audio/flac",
  aiff: "audio/aiff",
  aif: "audio/aiff",
};

export default function VoiceNotes({
  onNotesChanged,
  onSaved,
  onClose,
  initialNoteId = null,
  initialToken = "",
  context = [],
}: {
  onNotesChanged: (notes: VoiceNote[], token: string) => void;
  onSaved: () => void;
  onClose: () => void;
  initialNoteId?: string | null;
  initialToken?: string;
  context?: VoiceContextSource[];
}) {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [status, setStatus] = useState<VoiceStatus | null>(null);
  const [serviceError, setServiceError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [textMode, setTextMode] = useState(false);
  const [text, setText] = useState("");
  const [tokenDraft, setTokenDraft] = useState("");
  const [token, setToken] = useState(initialToken);
  const [locked, setLocked] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingNotice, setRecordingNotice] = useState("");
  const recording = useRef<ReturnType<typeof createVoiceRecording> | null>(null);
  const audioPlayer = useRef<HTMLAudioElement>(null);
  const capturing = recordingState !== "idle";
  const fileInput = useRef<HTMLInputElement>(null);
  const notice = useRef(onNotesChanged);
  notice.current = onNotesChanged;
  const mounted = useRef(true);
  const requestSequence = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestSequence.current++;
      recording.current?.cancel();
    };
  }, []);
  useEffect(() => {
    if (!file) {
      setAudioUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const request = useCallback(
    async (path: string, method = "GET", body?: unknown) => {
      const response = await fetch(`/api/voice/${path}`, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(method === "GET" ? 15000 : 30000),
      });
      if (response.status === 401) setLocked(true);
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          payload?.error ||
            "The voice service is unavailable. Your file has not been cleared.",
        );
      return payload;
    },
    [token],
  );
  const refresh = useCallback(async () => {
    const sequence = ++requestSequence.current;
    setRefreshing(true);
    try {
      const [nextStatus, nextNotes] = await Promise.all([
        request("status"),
        request("notes"),
      ]);
      if (!mounted.current || sequence !== requestSequence.current) return;
      if (
        !nextStatus ||
        typeof nextStatus.mode !== "string" ||
        !Array.isArray(nextNotes)
      )
        throw new Error("The voice service returned an unreadable response.");
      setStatus(nextStatus);
      const eligible = nextNotes.filter(
        (note: VoiceNote) =>
          ["demo-alex", "local-test"].includes(note.patientId) &&
          typeof note.id === "string" &&
          (note.transcript === null || typeof note.transcript === "string") &&
          Number.isFinite(Date.parse(note.receivedAt)),
      );
      setNotes(eligible);
      notice.current(eligible, token);
      setServiceError("");
      setLocked(false);
    } catch (e) {
      if (mounted.current && sequence === requestSequence.current)
        setServiceError(
          e instanceof Error
            ? e.message
            : "Could not reach the local voice service.",
        );
    } finally {
      if (mounted.current && sequence === requestSequence.current)
        setRefreshing(false);
    }
  }, [request, token]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const working = notes.some(inProgress);
  useEffect(() => {
    if (!working) return;
    const timer = window.setTimeout(() => void refresh(), 2200);
    return () => clearTimeout(timer);
  }, [working, notes, refresh]);
  const active = notes.find((n) => n.id === initialNoteId) ?? null;
  const processing = active && inProgress(active);
  const reviewing = initialNoteId !== null;
  const canUpload =
    status?.mode === "local" && status.localReady && !serviceError;
  const canText = status?.mode === "local" && !serviceError;

  function chooseFile(next?: File) {
    if (!next) return;
    const extension = next.name.split(".").pop()?.toLowerCase() || "";
    if (!next.size) {
      setError("This file is empty. Choose a voice note with audio.");
      return;
    }
    if (next.size > maxAudioBytes) {
      setError("Choose a voice note under 8 MiB.");
      return;
    }
    if (!next.type.startsWith("audio/") && !audioExtensions[extension]) {
      setError("Choose an audio file such as M4A, MP3, WAV or OGG.");
      return;
    }
    setFile(next);
    setError("");
    setRecordingNotice("");
  }
  function startRecording() {
    if (busy || capturing) return;
    audioPlayer.current?.pause();
    setError("");
    setRecordingNotice("");
    recording.current = createVoiceRecording({
      onState: setRecordingState,
      onTime: setRecordingSeconds,
      onError: setError,
      onComplete: (audio, message) => {
        chooseFile(audio);
        setRecordingNotice(message);
      },
    });
    void recording.current.start();
  }
  function cancelRecording() {
    recording.current?.cancel();
    setRecordingState("idle");
    setRecordingSeconds(0);
    setRecordingNotice("Recording cancelled. No audio from this recording was saved.");
  }
  async function submit(transcript?: string) {
    if (busy || capturing) return;
    setBusy(true);
    setError("");
    try {
      let payload: Record<string, unknown>;
      if (transcript) payload = { transcript: transcript.trim() };
      else {
        if (!file) throw new Error("Choose a voice note first.");
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () =>
            reject(
              new Error(
                "The audio file could not be read. Choose it again and retry.",
              ),
            );
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.readAsDataURL(file);
        });
        const extension = file.name.split(".").pop()?.toLowerCase() || "";
        payload = {
          audio: {
            type: "data",
            value: data,
            mimeType: file.type.startsWith("audio/")
              ? file.type
              : audioExtensions[extension],
          },
        };
      }
      await request("local", "POST", { ...payload, context });
      onSaved();
    } catch (e) {
      if (mounted.current)
        setError(
          e instanceof Error ? e.message : "Your note could not be uploaded.",
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function retry(analysisOnly = false) {
    if (!active || busy || capturing) return;
    setBusy(true);
    setError("");
    try {
      await request(`notes/${encodeURIComponent(active.id)}/${analysisOnly ? "analyse" : "retry"}`, "POST");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not retry processing.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="voice-studio voice-note-flow">
      {!reviewing && <p className="voice-note-intro">A quick check-in, a small change, or something for your next appointment.</p>}
      {serviceError && (
        <div className="care-error" role="alert">
          <span>
            {locked
              ? "Unlock the voice service to view its records."
              : "Transcription is unavailable right now. You can still record or choose a file, then reconnect to save it."}
          </span>
          <button onClick={() => void refresh()} disabled={refreshing}>
            <RefreshCw size={14} /> Reconnect
          </button>
        </div>
      )}
      {locked && (
        <form
          className="studio-unlock"
          onSubmit={(e) => {
            e.preventDefault();
            if (tokenDraft === token) void refresh();
            else setToken(tokenDraft);
          }}
        >
          <label>
            Voice service token
            <input
              type="password"
              value={tokenDraft}
              onChange={(e) => setTokenDraft(e.target.value)}
              autoComplete="off"
            />
          </label>
          <button className="care-secondary">Unlock</button>
        </form>
      )}
      {!reviewing && (
        <section className="voice-note-compose" aria-label="Record or upload a voice note">
          {!textMode && <>
            {!file || capturing ? (
              <div className={`studio-recorder ${capturing ? "active" : ""}`}>
                <div className="studio-recorder-status" role="status">
                  {recordingState === "recording" && <span className="studio-recording-dot" />}
                  <strong>
                    {recordingState === "requesting" ? "Waiting for microphone access…"
                      : recordingState === "recording" ? "Recording your note"
                        : recordingState === "stopping" ? "Preparing your recording…"
                          : "How are you feeling?"}
                  </strong>
                </div>
                {capturing ? (
                  <>
                    <span className="studio-recording-time" role="timer" aria-label="Recording duration">
                      {Math.floor(recordingSeconds / 60).toString().padStart(2, "0")}:{(recordingSeconds % 60).toString().padStart(2, "0")}
                    </span>
                    <div className="studio-recorder-actions">
                      {recordingState !== "requesting" && (
                        <button className="care-primary" disabled={recordingState === "stopping"} onClick={() => recording.current?.stop()}>
                          <Square size={13} fill="currentColor" /> Stop & review
                        </button>
                      )}
                      <button className="care-secondary" onClick={cancelRecording}>Cancel recording</button>
                    </div>
                  </>
                ) : (
                  <button className="voice-record-button" disabled={busy} onClick={startRecording} aria-label="Record voice note">
                    <Mic size={29} strokeWidth={1.6} />
                  </button>
                )}
                <p>{capturing ? "Take your time. Stop when you’re ready." : "Tap to record · up to 10 minutes"}</p>
              </div>
            ) : (
              <div className="voice-note-preview">
                <div className="studio-file">
                  <FileAudio size={21} />
                  <div>
                    <strong>{file.name}</strong>
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MiB · ready to add</span>
                  </div>
                  <button aria-label="Remove selected file" disabled={busy} onClick={() => { setFile(null); setRecordingNotice(""); }}>
                    <X size={17} />
                  </button>
                </div>
                {audioUrl && <audio ref={audioPlayer} className="studio-audio" controls src={audioUrl} aria-label="Selected voice note playback" />}
                <p className="studio-caption">Listen back before adding your note.</p>
                <button className="care-text-button" disabled={busy} onClick={startRecording}><Mic size={14} /> Record again</button>
              </div>
            )}
            <input
              ref={fileInput}
              className="studio-file-input"
              type="file"
              tabIndex={-1}
              accept="audio/*,.m4a,.mp3,.wav,.ogg,.opus,.webm,.aac,.flac"
              aria-label="Choose voice note file"
              disabled={busy || capturing}
              onChange={(e) => { chooseFile(e.target.files?.[0]); e.target.value = ""; }}
            />
            <button className="voice-upload-button" disabled={busy || capturing} onClick={() => fileInput.current?.click()}>
              <Upload size={16} /> {file ? "Choose another audio file" : "Or upload an audio file"}
              <span>Up to 8 MiB</span>
            </button>
          </>}
          {recordingNotice && <p className="studio-caption" role="status">{recordingNotice}</p>}
          {error && <p className="care-form-error" role="alert">{error}</p>}
          {textMode && (
            <div className="studio-text-form">
              <label htmlFor="studio-transcript">Voice note transcript</label>
              <textarea id="studio-transcript" rows={5} maxLength={20000}
                placeholder="Paste the words from your voice note…"
                value={text} onChange={(e) => setText(e.target.value)} />
            </div>
          )}
          <div className="voice-note-actions">
            <button className="care-secondary" onClick={onClose}>Cancel</button>
            <button className="care-primary" disabled={busy || capturing || (textMode ? !text.trim() || !canText : !file || !canUpload)}
              onClick={() => void submit(textMode ? text : undefined)}>
              {busy ? <><LoaderCircle className="studio-spin" size={16} /> Adding note…</> : <>Add voice note <ArrowRight size={16} /></>}
            </button>
          </div>
          <p className="voice-note-save-hint">Your note will be transcribed and added to Activity. {status?.analysisProvider === "openai" ? "OpenAI will analyse the transcript alongside earlier notes in your record." : "Automatic AI analysis is not configured."}</p>
          {!canUpload && !serviceError && <p className="studio-caption" role="status">
            {!status ? "Connecting to transcription…"
              : "Audio transcription is unavailable. You can use a transcript under More options."}
          </p>}
          <details className="voice-note-options">
            <summary>More options</summary>
            <div className="studio-input-alternatives">
              <button disabled={busy || capturing} onClick={() => setTextMode(!textMode)}>
                {textMode ? "Record or upload audio" : "Use a transcript instead"}
              </button>
            </div>
          </details>
        </section>
      )}
      {reviewing && (
        <div className="voice-note-review">
          <div className="voice-note-saved" role="status">
            {(processing || refreshing) && <LoaderCircle className="studio-spin" size={21} />}
            <div>
              <strong>{processing ? active?.transcript ? "Analysing your note…" : "Transcribing your note…" : active ? "Saved in your activity" : refreshing ? "Loading your note…" : "Voice note unavailable"}</strong>
              <p>{processing ? "You can close this window. Your transcript and analysis update automatically in Activity."
                : active ? "Your original words, kept with your care record."
                  : !refreshing ? "Reconnect to load this note, or reopen it from Activity." : ""}</p>
            </div>
          </div>
          {error && <p className="care-form-error" role="alert">{error}</p>}
          {active?.status === "failed" && (
            <div className="studio-processing failed" role="alert">
              <div><strong>Transcription needs another try.</strong><span>{active.error || "Your note is saved. Retry when you’re ready."}</span></div>
              <button className="care-secondary" onClick={() => void retry()} disabled={busy}>Retry</button>
            </div>
          )}
          {active?.transcript && <section className="studio-transcript-card">
            <div className="care-card-heading">
              <h2>Transcript</h2>
              {active.source === "demo" && <span className="care-tag">Sample text</span>}
            </div>
            <p className="studio-transcript">{active.transcript}</p>
          </section>}
          {active?.analysisStatus === "completed" && active.analysis && <VoiceAnalysis note={active} />}
          {active?.analysisStatus === "failed" && <div className="studio-processing failed" role="alert">
            <div><strong>Analysis needs another try.</strong><span>{active.analysisError}</span></div>
            <button className="care-secondary" onClick={() => void retry(true)} disabled={busy}>Retry analysis</button>
          </div>}
          {active?.transcript && !processing && active.status !== "failed" && !active.analysis && active.analysisStatus !== "failed" && <p className="studio-caption">
            {status?.analysisProvider === "openai" && active.source !== "demo"
              ? <button className="care-secondary" disabled={busy} onClick={() => void retry(true)}>Analyse note</button>
              : "Automatic AI analysis is not configured for this note."}
          </p>}
          <div className="voice-note-actions">
            <button className="care-primary" onClick={onClose}>Done <Check size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
