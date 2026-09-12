import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  AudioLines,
  Check,
  ChevronRight,
  FileAudio,
  LoaderCircle,
  MapPin,
  Mic,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import BodyViewer from "./BodyViewer";
import { regions } from "./data";
import type { RegionId } from "./data";
import { shortDate } from "./care-data";
import {
  deriveVoiceInsights,
  loadAnnotationEdits,
  sampleVoiceTranscript,
  saveAnnotationEdit,
} from "./voice-annotations";
import type {
  Annotation,
  AnnotationEdit,
  VoiceInsight,
} from "./voice-annotations";
import "./voice-notes.css";

type VoiceNote = {
  id: string;
  patientId: string;
  source: string;
  receivedAt: string;
  status: string;
  transcript: string | null;
  extraction?: { summary: string };
  error: string | null;
};
type VoiceStatus = { mode: string; localReady: boolean };
const inProgress = (note: VoiceNote) =>
  ["received", "transcribing", "extracting"].includes(note.status);
const maxAudioBytes = 8 * 1024 * 1024;
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
}: {
  onNotesChanged: () => void;
}) {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [status, setStatus] = useState<VoiceStatus | null>(null);
  const [serviceError, setServiceError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeInsightId, setActiveInsightId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [textMode, setTextMode] = useState(false);
  const [text, setText] = useState("");
  const [tokenDraft, setTokenDraft] = useState("");
  const [token, setToken] = useState("");
  const [locked, setLocked] = useState(false);
  const [overlay, setOverlay] = useState(true);
  const [initialEdits] = useState(loadAnnotationEdits);
  const [edits, setEdits] = useState(initialEdits.edits);
  const [mappingError, setMappingError] = useState(initialEdits.warning || "");
  const [sample, setSample] = useState(false);
  const [dragging, setDragging] = useState(false);
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
  useEffect(() => {
    const sync = () => {
      const value = loadAnnotationEdits();
      setEdits(value.edits);
      setMappingError(value.warning || "");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
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
      setNotes(
        nextNotes.filter(
          (note: VoiceNote) =>
            ["demo-alex", "local-test"].includes(note.patientId) &&
            typeof note.id === "string" &&
            (note.transcript === null || typeof note.transcript === "string") &&
            Number.isFinite(Date.parse(note.receivedAt)),
        ),
      );
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
  }, [request]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const working = notes.some(inProgress);
  useEffect(() => {
    if (!working) return;
    const timer = window.setTimeout(() => void refresh(), 2200);
    return () => clearTimeout(timer);
  }, [working, notes, refresh]);
  const sampleNote: VoiceNote = {
    id: "preview-voice-anatomy",
    patientId: "demo-alex",
    source: "demo",
    receivedAt: "2026-09-12T09:00:00",
    status: "saved",
    transcript: sampleVoiceTranscript,
    error: null,
  };
  const active = sample
    ? sampleNote
    : (notes.find((n) => n.id === activeId) ?? notes[0] ?? null);
  const insights = active?.transcript
    ? deriveVoiceInsights(active.transcript).map((insight) => {
        const edit = edits[active.id]?.[insight.id];
        return {
          ...insight,
          region: edit ? edit.region : insight.region,
          needsReview: !edit?.reviewed,
          manual: !!edit && edit.region !== insight.region,
        };
      })
    : [];
  const activeInsight =
    insights.find((i) => i.id === activeInsightId) ??
    insights.find((i) => i.region) ??
    insights[0];
  const placed = insights.filter((i) => i.region);
  const annotations: Annotation[] = [
    ...new Set(placed.map((i) => i.region!)),
  ].map((region) => {
    const group = placed.filter((i) => i.region === region);
    const item = group.find((i) => i.id === activeInsight?.id) ?? group[0];
    return {
      id: item.id,
      region,
      label: `${regions.find((r) => r.id === region)!.name}${group.length > 1 ? ` · ${group.length}` : ""}`,
    };
  });
  const processing = active && inProgress(active);
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
    setUploadedFile(null);
    setError("");
  }
  async function submit(transcript?: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      let payload: unknown;
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
      const result = await request("local", "POST", payload);
      if (!mounted.current) return;
      setActiveId(result.id);
      if (!transcript) setUploadedFile(file);
      setActiveInsightId(null);
      setSample(false);
      setText("");
      await refresh();
      notice.current();
    } catch (e) {
      if (mounted.current)
        setError(
          e instanceof Error ? e.message : "Your note could not be uploaded.",
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function retry() {
    if (!active || busy) return;
    setBusy(true);
    setError("");
    try {
      await request(`notes/${encodeURIComponent(active.id)}/retry`, "POST");
      await refresh();
      notice.current();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not retry processing.");
    } finally {
      setBusy(false);
    }
  }
  function editInsight(insight: VoiceInsight, patch: AnnotationEdit) {
    if (!active) return;
    try {
      setEdits(saveAnnotationEdit(active.id, insight.id, patch));
      setMappingError("");
      setActiveInsightId(insight.id);
    } catch (e) {
      setMappingError(
        e instanceof Error
          ? e.message
          : "Your annotation edit could not be saved.",
      );
    }
  }
  function selectNote(note: VoiceNote) {
    setSample(false);
    setActiveId(note.id);
    setActiveInsightId(null);
    setFile(null);
    setError("");
  }
  return (
    <div className="voice-studio">
      <section className="voice-studio-intro">
        <div className="studio-intro-icon">
          <AudioLines size={26} />
        </div>
        <div>
          <span className="care-kicker">SPEAK IT. SEE IT. KEEP IT.</span>
          <h2>A voice note becomes part of your body story.</h2>
          <p>
            Upload a note, explore what was said, and see each observation in
            the right place.
          </p>
        </div>
        <span className={`studio-service ${canUpload ? "ready" : ""}`}>
          <i />
          {canUpload
            ? "Local transcription ready"
            : status?.mode === "demo"
              ? "Sample mode"
              : status?.mode === "live"
                ? "WhatsApp service"
                : "Local service needed"}
        </span>
      </section>
      <div className="studio-flow">
        {[
          "Upload a voice note",
          "Read the transcript",
          "Explore body annotations",
        ].map((label, i) => (
          <span key={label}>
            <b>{i + 1}</b>
            {label}
            {i < 2 && <ChevronRight size={15} />}
          </span>
        ))}
      </div>
      {serviceError && (
        <div className="care-error" role="alert">
          <span>
            {locked
              ? "Unlock the voice service to view its records."
              : "The local voice service could not be reached. Start it with npm run voice, then reconnect. Your file stays here."}
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
      <div className="studio-workspace">
        <div className="studio-input-column">
          <section className="studio-upload-card">
            <div className="care-card-heading">
              <div>
                <span className="care-kicker">START WITH YOUR WORDS</span>
                <h2>Upload a voice note</h2>
              </div>
              <Mic size={20} />
            </div>
            <input
              ref={fileInput}
              className="studio-file-input"
              type="file"
              accept="audio/*,.m4a,.mp3,.wav,.ogg,.opus,.webm,.aac,.flac"
              aria-label="Choose voice note file"
              disabled={busy}
              onChange={(e) => {
                chooseFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              className={`studio-dropzone ${dragging ? "dragging" : ""}`}
              onClick={() => fileInput.current?.click()}
              disabled={busy}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (!busy) chooseFile(e.dataTransfer.files[0]);
              }}
            >
              <span>
                <Upload size={25} />
              </span>
              <strong>
                {file
                  ? "Choose a different voice note"
                  : "Drop your voice note here"}
              </strong>
              <span>or click to browse your files</span>
              <small>M4A, MP3, WAV, OGG & more · up to 8 MiB / 10 min</small>
            </button>
            {file && (
              <div className="studio-file">
                <FileAudio size={20} />
                <div>
                  <strong>{file.name}</strong>
                  <span>
                    {(file.size / 1024 / 1024).toFixed(2)} MiB ·{" "}
                    {file === uploadedFile ? "uploaded" : "ready to upload"}
                  </span>
                </div>
                <button
                  aria-label="Remove selected file"
                  disabled={busy}
                  onClick={() => setFile(null)}
                >
                  <X size={15} />
                </button>
              </div>
            )}
            {audioUrl && (
              <audio
                className="studio-audio"
                controls
                src={audioUrl}
                aria-label="Selected voice note playback"
              />
            )}
            {error && (
              <p className="care-form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="care-primary full"
              disabled={!file || busy || !canUpload || file === uploadedFile}
              onClick={() => void submit()}
            >
              {busy ? (
                <>
                  <LoaderCircle className="studio-spin" size={16} /> Uploading…
                </>
              ) : file && file === uploadedFile ? (
                <>
                  Voice note uploaded <Check size={16} />
                </>
              ) : (
                <>
                  Transcribe & map to body <ArrowRight size={16} />
                </>
              )}
            </button>
            {!canUpload && !serviceError && (
              <p className="studio-caption">
                {status?.mode === "local"
                  ? "Audio transcription needs local Whisper setup. You can still paste a transcript below."
                  : status?.mode === "live"
                    ? "File uploads use the local service mode. Your WhatsApp inbox remains separate."
                    : "Connect the local transcription service to upload your own audio."}
              </p>
            )}
            <div className="studio-local-note">
              <ShieldCheck size={14} />
              <span>Processed on this computer · transcript saved locally</span>
            </div>
            <div className="studio-input-alternatives">
              <button
                onClick={() => setTextMode(!textMode)}
                aria-expanded={textMode}
              >
                Paste a transcript
              </button>
              <button
                onClick={() => {
                  setSample(true);
                  setActiveInsightId(null);
                }}
              >
                Explore a sample <Sparkles size={12} />
              </button>
            </div>
            {textMode && (
              <form
                className="studio-text-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit(text);
                }}
              >
                <label htmlFor="studio-transcript">Voice note transcript</label>
                <textarea
                  id="studio-transcript"
                  rows={5}
                  maxLength={20000}
                  placeholder="My left hamstring felt tight after walking. My right shoulder…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  className="care-secondary"
                  disabled={!text.trim() || busy || !canText}
                >
                  Save transcript & map <ArrowRight size={14} />
                </button>
              </form>
            )}
          </section>
          <section className="studio-notes-card">
            <div className="care-card-heading">
              <h2>
                Your voice notes <span>{notes.length}</span>
              </h2>
              <button
                className="studio-icon-button"
                aria-label="Refresh voice notes"
                disabled={refreshing}
                onClick={() => void refresh()}
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "studio-spin" : ""}
                />
              </button>
            </div>
            {notes.length ? (
              <div className="studio-note-list">
                {notes.map((note) => {
                  const first = note.transcript
                    ? deriveVoiceInsights(note.transcript).find((i) => i.region)
                    : null;
                  return (
                    <button
                      className={
                        !sample && note.id === active?.id ? "selected" : ""
                      }
                      key={note.id}
                      onClick={() => selectNote(note)}
                    >
                      <span className="studio-note-icon">
                        <AudioLines size={18} />
                      </span>
                      <span>
                        <strong>
                          {first?.title ??
                            (inProgress(note)
                              ? "Processing voice note…"
                              : "Voice note")}
                        </strong>
                        <small>
                          {shortDate(note.receivedAt)} ·{" "}
                          {new Date(note.receivedAt).toLocaleTimeString(
                            "en-IE",
                            { hour: "2-digit", minute: "2-digit" },
                          )}{" "}
                          · {note.source === "demo" ? "Sample" : "Uploaded"}
                        </small>
                      </span>
                      {inProgress(note) ? (
                        <LoaderCircle className="studio-spin" size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="studio-note-empty">
                <Mic size={22} />
                <p>Your uploaded notes will appear here.</p>
              </div>
            )}
          </section>
          {active && (
            <section className="studio-transcript-card">
              <div className="care-card-heading">
                <div>
                  <span className="care-kicker">THE ORIGINAL WORDS</span>
                  <h2>Transcript</h2>
                </div>
                <span className="care-tag">
                  {sample || active.source === "demo"
                    ? "Sample text"
                    : "Voice record"}
                </span>
              </div>
              {active.transcript ? (
                <p className="studio-transcript">
                  {activeInsight ? (
                    <>
                      {active.transcript.slice(0, activeInsight.start)}
                      <mark>
                        {active.transcript.slice(
                          activeInsight.start,
                          activeInsight.end,
                        )}
                      </mark>
                      {active.transcript.slice(activeInsight.end)}
                    </>
                  ) : (
                    active.transcript
                  )}
                </p>
              ) : (
                <p className="studio-caption">
                  {processing
                    ? "Transcribing your audio on this computer…"
                    : "No transcript is available yet."}
                </p>
              )}
              <p className="studio-caption">
                {sample
                  ? "Illustrative transcript · no audio was uploaded or transcribed."
                  : "Speech recognition can make mistakes. Check each excerpt before confirming its location."}
              </p>
            </section>
          )}
        </div>
        <div className="studio-body-column">
          <section className="studio-body-card">
            <div className="care-card-heading">
              <div>
                <span className="care-kicker">CONNECTED TO YOUR BODY</span>
                <h2>
                  {active
                    ? "Your observations, in place"
                    : "Give your words a place"}
                </h2>
              </div>
              <span className="care-tag">
                {annotations.length} body{" "}
                {annotations.length === 1 ? "region" : "regions"}
              </span>
            </div>
            <BodyViewer
              selected={activeInsight?.region ?? "left-hamstring"}
              onSelect={(region) => {
                const insight = insights.find((i) => i.region === region);
                if (insight) setActiveInsightId(insight.id);
              }}
              overlay={overlay}
              onOverlay={() => setOverlay(!overlay)}
              recordMode
              snapshotDate={
                active ? shortDate(active.receivedAt) : "Ready for a note"
              }
              annotations={annotations}
              activeAnnotationId={activeInsight?.id}
              onAnnotationSelect={setActiveInsightId}
            />
            {processing && (
              <div className="studio-processing" role="status">
                <LoaderCircle className="studio-spin" size={19} />
                <div>
                  <strong>
                    {active.status === "extracting"
                      ? "Finding observations…"
                      : "Listening to your voice note…"}
                  </strong>
                  <span>
                    Your body annotations will appear when the transcript is
                    ready.
                  </span>
                </div>
              </div>
            )}
            {active?.status === "failed" && (
              <div className="studio-processing failed" role="alert">
                <div>
                  <strong>Processing needs another try.</strong>
                  <span>
                    {active.error ||
                      "Your note is saved. Retry transcription or paste a corrected transcript."}
                  </span>
                </div>
                <button
                  className="care-secondary"
                  onClick={() => void retry()}
                  disabled={busy}
                >
                  Retry
                </button>
              </div>
            )}
            <div className="studio-body-legend">
              <span>
                <i /> Mentioned region
              </span>
              <span>
                <i /> Selected observation
              </span>
              <span>Drag to rotate · select a pin to read its source</span>
            </div>
          </section>
          <section className="studio-insights-card">
            <div className="care-card-heading">
              <div>
                <span className="care-kicker">INSIGHTS FROM YOUR NOTE</span>
                <h2>
                  {active
                    ? `${insights.length} ${insights.length === 1 ? "observation" : "observations"} to explore`
                    : "From a voice note to a clearer picture"}
                </h2>
              </div>
              <Sparkles size={19} />
            </div>
            {mappingError && (
              <p className="care-form-error" role="alert">
                {mappingError}
              </p>
            )}
            {insights.length ? (
              <>
                <p className="studio-caption">
                  Automatically linked from explicit body-region mentions.
                  Review or correct each location.
                </p>
                <div className="studio-insight-list">
                  {insights.map((insight, index) => (
                    <article
                      key={insight.id}
                      className={`studio-insight ${insight.id === activeInsight?.id ? "active" : ""}`}
                    >
                      <button
                        className="studio-insight-main"
                        onClick={() => setActiveInsightId(insight.id)}
                        aria-pressed={insight.id === activeInsight?.id}
                      >
                        <span className="studio-insight-number">
                          {index + 1}
                        </span>
                        <span>
                          <strong>
                            {insight.region
                              ? regions.find((r) => r.id === insight.region)
                                  ?.name
                              : insight.title}
                          </strong>
                          <span
                            className={
                              insight.needsReview ? "review-needed" : "reviewed"
                            }
                          >
                            {!insight.region
                              ? "Choose a location"
                              : insight.needsReview
                                ? "Needs your review"
                                : "Location confirmed"}
                          </span>
                        </span>
                        <MapPin size={16} />
                      </button>
                      <blockquote>{insight.quote}</blockquote>
                      <p>
                        {insight.manual
                          ? "Body region selected by you."
                          : insight.detail}
                      </p>
                      <div className="studio-insight-controls">
                        <label>
                          <span className="sr-only">
                            Location for observation {index + 1}
                          </span>
                          <select
                            aria-label={`Location for observation ${index + 1}`}
                            value={insight.region ?? ""}
                            onChange={(e) =>
                              editInsight(insight, {
                                region: e.target.value
                                  ? (e.target.value as RegionId)
                                  : null,
                                reviewed: false,
                              })
                            }
                          >
                            <option value="">Unplaced · general note</option>
                            {regions.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          disabled={!insight.region}
                          onClick={() =>
                            editInsight(insight, {
                              region: insight.region,
                              reviewed: insight.needsReview,
                            })
                          }
                        >
                          {insight.needsReview ? (
                            <>
                              <Check size={13} /> Confirm location
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={13} /> Confirmed
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="studio-insight-empty">
                <MapPin size={24} />
                <p>
                  {processing
                    ? "Your audio is being transcribed. Keep this page open to watch the annotations arrive."
                    : "Upload a voice note to see observations linked to your musculature, with the original words alongside."}
                </p>
                <button
                  className="care-text-button"
                  onClick={() => {
                    setSample(true);
                    setActiveInsightId(null);
                  }}
                >
                  See how a sample note looks <ArrowRight size={13} />
                </button>
              </div>
            )}
            <div className="studio-insight-footer">
              Region matching uses local rules. These are reported observations,
              not a diagnosis or treatment recommendation.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
