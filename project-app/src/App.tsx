import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Dumbbell,
  ExternalLink,
  Flame,
  Heart,
  History,
  LayoutGrid,
  Leaf,
  Menu,
  Mic,
  Play,
  Plus,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  ClipboardList,
  X,
} from "lucide-react";
import BodyViewer from "./BodyViewer";
import AssessmentStory from "./AssessmentStory";
import VoiceInbox from "./VoiceInbox";
import BodyRecord from "./body-record/BodyRecord";
import {
  exercises,
  exportProfile,
  loadSessions,
  regions,
  storageKey,
  type Exercise,
  type RegionId,
  type Session,
} from "./data";

type Page = "overview" | "assessment" | "routine" | "history" | "profile" | "voice" | "body-record";
type Message = { role: "assistant" | "user"; text: string };
function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`modal ${wide ? "wide" : ""}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <div>
          <span className="eyebrow">AI PHYSIO · DEMO</span>
          <h2>{title}</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selected, setSelected] = useState<RegionId>("left-hamstring");
  const [overlay, setOverlay] = useState(true);
  const [loaded] = useState(loadSessions);
  const [sessions, setSessions] = useState(loaded.sessions);
  const [toast, setToast] = useState(loaded.warning ?? "");
  const [detail, setDetail] = useState<Exercise | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi Alex. Your sample hamstring recovery is ready. I can show the injured muscle, open your routine, or recap your demo sessions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<{
    id: string;
    started: number;
    completed: Record<string, number[]>;
  } | null>(null);
  const [discomfort, setDiscomfort] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [saveError, setSaveError] = useState("");
  const region = regions.find((r) => r.id === selected)!;
  const related = exercises.filter(
    (e) =>
      e.region === selected ||
      (selected === "core" && e.id === "bridge") ||
      (selected === "right-hip" && e.id === "bridge") ||
      (selected === "right-calf" && e.id === "calf-raise"),
  );
  const completedSets = draft
    ? Object.values(draft.completed).reduce((a, b) => a + b.length, 0)
    : 0;
  const totalSets = exercises.reduce((a, b) => a + b.sets, 0);
  const nav = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "body-record", label: "Body record", icon: Target },
    { id: "assessment", label: "Assessment story", icon: ClipboardList },
    { id: "routine", label: "My routine", icon: Dumbbell },
    { id: "history", label: "Session history", icon: History },
    { id: "voice", label: "WhatsApp notes", icon: Mic },
    { id: "profile", label: "My profile", icon: UserRound },
  ] as const;
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 7000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!draft) return;
    const timer = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - draft.started) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [draft?.started]);
  function navigate(next: Page) {
    setPage(next);
    setMobileMenu(false);
    window.scrollTo({ top: 0 });
  }
  function startSession() {
    setDraft({ id: crypto.randomUUID(), started: Date.now(), completed: {} });
    setDiscomfort(null);
    setNote("");
    setElapsed(0);
    setSaveError("");
    setDetail(null);
    setShowChat(false);
  }
  function saveSession() {
    if (!draft || completedSets === 0) return;
    const entry: Session = {
      id: draft.id,
      date: new Date().toISOString(),
      title: "Hamstring recovery",
      completed: Object.fromEntries(
        Object.entries(draft.completed).map(([id, sets]) => [id, sets.length]),
      ),
      discomfort,
      note: note.trim(),
      minutes: Math.max(1, Math.round(elapsed / 60)),
      source: "demo-entry",
    };
    const latest = loadSessions();
    if (latest.warning) {
      setSaveError(
        "The saved demo data could not be read. Your new entries are still here; export or repair the stored data before saving.",
      );
      return;
    }
    const next = [entry, ...latest.sessions.filter((s) => s.id !== entry.id)];
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      setSaveError(
        "This browser could not save the session. Your entries are still here; allow browser storage and try again.",
      );
      return;
    }
    setSessions(next);
    setDraft(null);
    setToast("Demo session saved on this device.");
  }
  function downloadProfile() {
    const url = URL.createObjectURL(
      new Blob([exportProfile(sessions)], { type: "text/markdown" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "alex-demo-profile.md";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast("Demo profile and session history exported.");
  }
  function chat(text: string) {
    const value = text.trim();
    if (!value) return;
    const normal = value.toLowerCase();
    let response: string;
    const match = regions.find((r) => normal.includes(r.name.toLowerCase()));
    if (match) {
      setSelected(match.id);
      setPage("overview");
      response = `I’ve selected ${match.name.toLowerCase()} in the body explorer. ${match.reported === null ? "There is no discomfort score recorded for this region." : `The fictional profile records ${match.reported}/10 discomfort.`} ${match.note}`;
    } else if (/\b(hamstring|knee|calf|hip|shoulder)\b/.test(normal))
      response =
        "Which side would you like to see — left or right? Try “show my left hamstring”.";
    else if (/history|progress|recap|last session/.test(normal)) {
      const last = sessions[0];
      response = last
        ? `You have ${sessions.length} demo sessions logged. The latest includes ${Object.values(last.completed).reduce((a, b) => a + b, 0)} of ${totalSets} sets, with ${last.discomfort === null ? "no discomfort score recorded" : `${last.discomfort}/10 reported discomfort`}. You can see each entry in Session history.`
        : "There are no sessions to recap yet.";
    } else if (/routine|exercise|start/.test(normal)) {
      setPage("routine");
      response =
        "Your sample hamstring routine has four exercises: heel-dig isometric, double-leg bridge, slider hamstring curl, and hip hinge drill. Open “Start session” to try logging sets. The doses are fictional demo data.";
    } else if (/voice|microphone/.test(normal))
      response =
        "Voice is a simulated interaction in version zero. No microphone is connected or recording. This demo uses a small set of scripted responses.";
    else
      response =
        "This version uses scripted demo responses. Try “show my left hamstring”, “open my routine”, or “recap my progress”. A personal agent and clinical reasoning are not connected.";
    setMessages((old) => [
      ...old,
      { role: "user", text: value },
      { role: "assistant", text: response },
    ]);
    setInput("");
    setShowChat(true);
  }
  function exerciseList() {
    return (
      <div className="exercise-list">
        {exercises.map((e, i) => (
          <button
            key={e.id}
            className={`exercise-row ${related.some((item) => item.id === e.id) ? "related" : ""}`}
            onClick={() => {
              setSelected(e.region);
              setDetail(e);
            }}
          >
            <span className={`exercise-art art-${i}`} aria-hidden="true">
              {i === 0 ? (
                <Activity />
              ) : i === 1 ? (
                <Dumbbell />
              ) : i === 2 ? (
                <TrendingUp />
              ) : (
                <MoveIcon />
              )}
              <span>0{i + 1}</span>
            </span>
            <span className="exercise-copy">
              <span className="exercise-category">{e.category}</span>
              <strong>{e.name}</strong>
              <span>
                {e.sets} sets <i /> {e.reps}
              </span>
            </span>
            <span className="exercise-time">
              {e.minutes} min
              <ChevronRight size={16} />
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
        >
          <span className="brand-symbol">
            <Activity size={24} />
          </span>
          <span>
            physio<span className="brand-ai">ai</span>
            <small>YOUR MOVEMENT COMPANION</small>
          </span>
        </a>
        <div className="workspace-label">YOUR SPACE</div>
        <nav aria-label="Main navigation">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              className={page === id ? "nav-item active" : "nav-item"}
              onClick={() => navigate(id)}
              key={id}
              aria-label={label}
              aria-current={page === id ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === "routine" && <span className="nav-count">4</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="leaf-icon">
            <Leaf size={23} />
          </span>
          <p>
            A little movement.
            <br />
            <strong>A little more you.</strong>
          </p>
          <span>One session at a time.</span>
        </div>
        <div className="sidebar-bottom">
          <button className="help-link" onClick={() => setShowHelp(true)}>
            <CircleHelp size={18} /> About this prototype
            <ArrowUpRight size={15} />
          </button>
          <button
            className="profile-switch"
            onClick={() => navigate("profile")}
          >
            <span className="avatar">AM</span>
            <span>
              <strong>Alex Morgan</strong>
              <small>Demo profile</small>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={22} />
            </button>
            <span>My workspace</span>
            <ChevronRight size={13} />
            <strong>{nav.find((n) => n.id === page)!.label}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-badge">
              <span /> MOCK DATA <i /> V0
            </span>
            <button
              className="top-avatar"
              onClick={() => navigate("profile")}
              aria-label="Open demo profile"
            >
              AM
            </button>
          </div>
        </header>
        <div className="page-content">
          {page !== "body-record" && <div className="page-heading">
            <div>
              <div className="eyebrow">
                {page === "overview"
                  ? "A LITTLE PROGRESS, EVERY DAY"
                  : page === "assessment"
                    ? "REAL CASE · DE-IDENTIFIED"
                  : "YOUR PERSONAL WORKSPACE"}
              </div>
              <h1>
                {page === "overview" ? (
                  <>
                    Let’s keep you moving<span>.</span>
                  </>
                ) : page === "assessment" ? (
                  "Your assessment, made visible."
                ) : page === "routine" ? (
                  "Your movement routine."
                ) : page === "history" ? (
                  "Every session counts."
                ) : page === "voice" ? (
                  "Your words, remembered."
                ) : (
                  "Your story, remembered."
                )}
              </h1>
              <p>
                {page === "overview"
                  ? "Welcome back, Alex. Make a little time for yourself today."
                  : page === "assessment"
                    ? "A separate story built from the supplied September 2026 strength and mobility report."
                  : page === "routine"
                    ? "Hamstring recovery · a fictional programme for this demo."
                    : page === "history"
                      ? "Your sample sessions and the moments you’ve logged on this device."
                      : page === "voice"
                        ? "A simple voice note. A lasting record of your progress."
                      : "A fictional patient profile, ready to explore and export."}
              </p>
            </div>
            {page !== "voice" && <button
              className="outline-button heading-action"
              onClick={downloadProfile}
            >
              <ArrowDownToLine size={15} /> Export profile
            </button>}
          </div>

          }
          {page === "body-record" && <BodyRecord />}
          {page === "voice" && <VoiceInbox />}
          {page === "assessment" && <AssessmentStory />}
          {page === "overview" && (
            <>
              <div className="metrics">
                <div className="metric">
                  <span className="metric-icon mint">
                    <Target size={21} />
                  </span>
                  <div>
                    <span className="metric-label">Your focus</span>
                    <strong>Move with confidence</strong>
                    <small>Hamstring recovery</small>
                  </div>
                </div>
                <div className="metric">
                  <span className="metric-icon peach">
                    <Flame size={21} />
                  </span>
                  <div>
                    <span className="metric-label">Showing up</span>
                    <strong>
                      {sessions.length} <span>sessions logged</span>
                    </strong>
                    <small>Small steps. Real consistency.</small>
                  </div>
                  <div className="mini-bars" aria-hidden="true">
                    {[35, 57, 43, 76, 64, 89, 74].map((h, i) => (
                      <i key={i} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="metric">
                  <span className="metric-icon cream">
                    <Clock3 size={21} />
                  </span>
                  <div>
                    <span className="metric-label">Today’s routine</span>
                    <strong>
                      20 <span>minutes for you</span>
                    </strong>
                    <small>4 exercises · at your own pace</small>
                  </div>
                </div>
              </div>
              <div className="workspace-grid">
                <div className="body-column">
                  <BodyViewer
                    selected={selected}
                    onSelect={setSelected}
                    overlay={overlay}
                    onOverlay={() => setOverlay(!overlay)}
                  />
                  <div className="region-card">
                    <div className="region-main">
                      <span className="region-symbol">
                        <FocusIcon />
                      </span>
                      <div>
                        <span className="eyebrow">EXPLORING</span>
                        <label className="sr-only" htmlFor="region">
                          Select body region
                        </label>
                        <select
                          id="region"
                          value={selected}
                          onChange={(e) =>
                            setSelected(e.target.value as RegionId)
                          }
                        >
                          {regions.map((r) => (
                            <option value={r.id} key={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                        <p>{region.structure}</p>
                      </div>
                      <span className="reported-score">
                        {region.reported === null ? (
                          <small>Not recorded</small>
                        ) : (
                          <>
                            <strong>
                              {region.reported}
                              <small>/10</small>
                            </strong>
                            <span>Reported discomfort</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="region-footer">
                      <span>
                        <span className="legend-dot coral" />
                        {region.note}
                      </span>
                      <span>
                        {related.length} related exercise
                        {related.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="routine-column">
                  <section className="routine-card">
                    <div className="card-heading">
                      <div>
                        <span className="eyebrow">YOUR NEXT SMALL STEP</span>
                        <h2>Today’s routine</h2>
                      </div>
                      <span className="soft-badge">Sample plan</span>
                    </div>
                    <div className="routine-subtitle">
                      <span>Hamstring recovery</span>
                      <span>
                        <Clock3 size={13} />
                        20 min
                      </span>
                    </div>
                    {exerciseList()}
                    <button
                      className="primary-button start-button"
                      onClick={startSession}
                    >
                      <Play size={16} fill="currentColor" />
                      Start session
                      <ArrowRight size={17} />
                    </button>
                    <span className="routine-note">
                      Sample doses · no clinical plan connected
                    </span>
                  </section>
                  <section className="assistant-card">
                    <div className="assistant-heading">
                      <span className="assistant-symbol">
                        <Sparkles size={19} />
                      </span>
                      <div>
                        <h3>A little guidance, on hand.</h3>
                        <span>Your demo physio companion</span>
                      </div>
                      <span className="tiny-label">SCRIPTED</span>
                    </div>
                    <p>
                      Explore your body map, find your routine,
                      <br className="desktop-break" /> or look back on your
                      progress.
                    </p>
                    <div className="assistant-actions">
                      <button onClick={() => setShowChat(true)}>
                        Let’s talk
                        <ArrowUpRight size={16} />
                      </button>
                      <button
                        className="voice-button"
                        aria-label="Try simulated voice demo"
                        title="Simulated voice demo"
                        onClick={() =>
                          chat("Simulated voice: show my left hamstring")
                        }
                      >
                        <Mic size={16} />
                        <span>Voice demo</span>
                      </button>
                    </div>
                  </section>
                </div>
              </div>
              <div className="workspace-footer">
                <span>
                  <span className="legend-dot green" />
                  Recovered tissue <span className="legend-dot coral" />
                  Injury intensity
                </span>
                <span>Fictional profile · sessions stay on this device</span>
              </div>
            </>
          )}

          {page === "routine" && (
            <div className="secondary-grid">
              <section className="routine-card">
                <div className="card-heading">
                  <div>
                    <span className="eyebrow">SAMPLE PLAN · REVISION 1</span>
                    <h2>Hamstring recovery</h2>
                  </div>
                  <span className="soft-badge">4 exercises</span>
                </div>
                <p className="section-copy">
                  A 20-minute sample routine. Open an exercise to see its
                  variant and associated body region.
                </p>
                {exerciseList()}
                <button
                  className="primary-button start-button"
                  onClick={startSession}
                >
                  <Play size={16} /> Start session
                  <ArrowRight size={17} />
                </button>
              </section>
              <section className="info-card">
                <BookOpen size={25} />
                <h2>A routine with context.</h2>
                <p>
                  This is a fictional routine for trying the interface. It has
                  no clinician approval or individual restrictions attached.
                </p>
                <dl>
                  <div>
                    <dt>Equipment</dt>
                    <dd>Chair, exercise mat</dd>
                  </div>
                  <div>
                    <dt>Programme source</dt>
                    <dd>Version zero mock data</dd>
                  </div>
                  <div>
                    <dt>Restrictions</dt>
                    <dd>Not recorded</dd>
                  </div>
                </dl>
                <button
                  className="text-button"
                  onClick={() => navigate("overview")}
                >
                  Explore the body map
                  <ArrowRight size={16} />
                </button>
              </section>
            </div>
          )}

          {page === "history" && (
            <section className="history-card">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">YOUR SESSION JOURNAL</span>
                  <h2>{sessions.length} sessions, one step at a time</h2>
                </div>
                <button className="outline-button" onClick={startSession}>
                  <Plus size={15} /> New session
                </button>
              </div>
              <div className="session-list">
                {sessions.map((s) => (
                  <article className="session-item" key={s.id}>
                    <div className="session-date">
                      <strong>{new Date(s.date).getDate()}</strong>
                      <span>
                        {new Date(s.date).toLocaleDateString("en-IE", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="session-copy">
                      <div>
                        <h3>{s.title}</h3>
                        <span className="soft-badge">
                          {s.source === "mock" ? "Sample" : "Demo entry"}
                        </span>
                      </div>
                      <p>
                        {Object.values(s.completed).reduce((a, b) => a + b, 0)}{" "}
                        / {totalSets} sets · {s.minutes} min ·{" "}
                        {s.discomfort === null
                          ? "Discomfort not recorded"
                          : `${s.discomfort}/10 discomfort`}
                      </p>
                      <p className="session-note">
                        {s.note || "No note added."}
                      </p>
                      <details>
                        <summary>View completed exercises</summary>
                        {exercises.map((e) => (
                          <p key={e.id}>
                            {e.name}
                            <strong>
                              {s.completed[e.id] ?? 0}/{e.sets} sets
                            </strong>
                          </p>
                        ))}
                      </details>
                    </div>
                    <span className="session-check">
                      <Check size={17} />
                    </span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {page === "profile" && (
            <div className="secondary-grid">
              <section className="profile-card">
                <div className="profile-hero">
                  <span className="avatar large">AM</span>
                  <div>
                    <span className="eyebrow">FICTIONAL PATIENT</span>
                    <h2>Alex Morgan</h2>
                    <p>Personal movement profile</p>
                  </div>
                  <span className="soft-badge">Demo</span>
                </div>
                <div className="profile-section">
                  <h3>
                    <Target size={18} /> What I’m working towards
                  </h3>
                  <p>
                    Return to comfortable walks and build a consistent movement
                    routine.
                  </p>
                </div>
                <div className="profile-section">
                  <h3>
                    <Heart size={18} /> My recent observations
                  </h3>
                  <p>
                    <strong>Left knee · 2/10</strong>
                    <br />
                    Mild stiffness after sitting, easing with movement.
                  </p>
                  <p>
                    <strong>Left calf · 1/10</strong>
                    <br />A little tight after the weekend walk.
                  </p>
                  <span className="metadata">
                    Fictional self-reports · 10 September 2026
                  </span>
                </div>
                <div className="profile-section">
                  <h3>
                    <BookOpen size={18} /> My plan & preferences
                  </h3>
                  <p>
                    Hamstring recovery, revision 1. Exercise mat and sliders.
                    About 20 minutes available.
                  </p>
                  <p>
                    Clinical restrictions: <strong>not recorded.</strong>
                  </p>
                </div>
              </section>
              <section className="info-card">
                <ArrowDownToLine size={25} />
                <h2>Your memory, in your hands.</h2>
                <p>
                  Export the demo profile, sample routine, and full session
                  history as a readable Markdown file.
                </p>
                <button className="primary-button" onClick={downloadProfile}>
                  Export profile.md
                  <ArrowDownToLine size={16} />
                </button>
                <div className="note-box">
                  Version zero stores session entries in this browser. The
                  profile itself is mock data; a canonical patient record and
                  agent integration come later.
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <div className="exercise-modal-art">
            <Dumbbell size={46} />
            <span>{detail.category}</span>
          </div>
          <div className="detail-stats">
            <div>
              <strong>{detail.sets}</strong>
              <span>sets</span>
            </div>
            <div>
              <strong>{detail.reps.split(" ")[0]}</strong>
              <span>reps</span>
            </div>
            <div>
              <strong>{detail.minutes}</strong>
              <span>minutes</span>
            </div>
          </div>
          <p>{detail.cue}</p>
          <div className="note-box">
            <strong>Equipment</strong>
            <br />
            {detail.equipment}
            <br />
            <br />
            <strong>Associated region</strong>
            <br />
            {regions.find((r) => r.id === detail.region)!.name}
          </div>
          <p className="metadata">
            Mock exercise record. No reviewed video is attached to this variant.
          </p>
          <a
            className="outline-button external-resource"
            href="https://www.ouh.nhs.uk/physiotherapy/outpatients/videos/"
            target="_blank"
            rel="noreferrer"
          >
            Browse the OUH exercise catalogue
            <ExternalLink size={15} />
          </a>
          <button
            className="primary-button"
            onClick={() => {
              setPage("overview");
              setSelected(detail.region);
              setDetail(null);
            }}
          >
            Show on body map
            <ArrowRight size={16} />
          </button>
        </Modal>
      )}

      {draft && (
        <Modal
          title="Make this session yours."
          wide
          onClose={() => {
            setDraft(null);
            setToast("Session closed without saving.");
          }}
        >
          <div className="session-status">
            <span>
              <span className="legend-dot green" /> Demo session in progress
            </span>
            <span>
              <Clock3 size={15} />
              {Math.floor(elapsed / 60)
                .toString()
                .padStart(2, "0")}
              :{(elapsed % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <p className="section-copy">
            Tap each set you’ve completed. Only the sets you mark will be
            logged.
          </p>
          <div className="session-exercises">
            {exercises.map((e) => (
              <div className="session-exercise" key={e.id}>
                <div>
                  <strong>{e.name}</strong>
                  <span>
                    {e.sets} × {e.reps} · sample dose
                  </span>
                </div>
                <div className="set-buttons">
                  {Array.from({ length: e.sets }, (_, i) => (
                    <button
                      key={i}
                      aria-label={`${e.name}, set ${i + 1}`}
                      aria-pressed={(draft.completed[e.id] ?? []).includes(i)}
                      className={
                        (draft.completed[e.id] ?? []).includes(i)
                          ? "complete"
                          : ""
                      }
                      onClick={() =>
                        setDraft(
                          (d) =>
                            d && {
                              ...d,
                              completed: {
                                ...d.completed,
                                [e.id]: (d.completed[e.id] ?? []).includes(i)
                                  ? (d.completed[e.id] ?? []).filter(
                                      (set) => set !== i,
                                    )
                                  : [...(d.completed[e.id] ?? []), i],
                              },
                            },
                        )
                      }
                    >
                      {(draft.completed[e.id] ?? []).includes(i) ? (
                        <Check size={17} />
                      ) : (
                        i + 1
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="discomfort-field">
            <label htmlFor="discomfort">
              Discomfort after this session <span>Optional</span>
            </label>
            <select
              id="discomfort"
              value={discomfort ?? ""}
              onChange={(e) =>
                setDiscomfort(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            >
              <option value="">Not recorded</option>
              {Array.from({ length: 11 }, (_, i) => (
                <option value={i} key={i}>
                  {i}/10
                  {i === 0 ? " — none" : i === 10 ? " — worst imaginable" : ""}
                </option>
              ))}
            </select>
          </div>
          <label className="note-label" htmlFor="session-note">
            Anything you’d like to remember?
          </label>
          <textarea
            id="session-note"
            placeholder="How it felt, a skipped set, a small win…"
            maxLength={1500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {saveError && (
            <p role="alert" className="error-message">
              {saveError}
            </p>
          )}
          <div className="session-save">
            <span>
              {completedSets} of {totalSets} sets marked
            </span>
            <button
              className="primary-button"
              disabled={!completedSets}
              onClick={saveSession}
            >
              Save demo session
              <Check size={16} />
            </button>
          </div>
          <p className="metadata">
            Saved locally in this browser · no patient record or clinician is
            connected
          </p>
        </Modal>
      )}

      {showChat && (
        <Modal
          title="Your movement companion"
          onClose={() => setShowChat(false)}
        >
          <div className="chat-disclosure">
            <Sparkles size={15} /> Scripted demo · voice and AI are not
            connected
          </div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.role}`}>
                <span>{m.role === "assistant" ? "PHYSIO AI" : "YOU"}</span>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          <div className="chat-prompts">
            <button onClick={() => chat("Show my left hamstring")}>
              Show my left hamstring
            </button>
            <button onClick={() => chat("Recap my progress")}>
              Recap my progress
            </button>
          </div>
          <form
            className="chat-input"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              chat(input);
            }}
          >
            <input
              aria-label="Message demo assistant"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your demo routine…"
            />
            <button aria-label="Send message" disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </Modal>
      )}

      {showHelp && (
        <Modal
          title="A first step for AI Physio."
          onClose={() => setShowHelp(false)}
        >
          <p>
            This version zero brings the project plan into a working interface
            with mock data.
          </p>
          <ul className="about-list">
            <li>
              <Check size={17} />
              Selectable Three.js body regions
            </li>
            <li>
              <Check size={17} />
              Sample routine and session logging
            </li>
            <li>
              <Check size={17} />
              Local session history and Markdown export
            </li>
            <li>
              <Check size={17} />
              Scripted companion interactions
            </li>
          </ul>
          <div className="note-box">
            The anatomy is simplified procedural geometry. Patient data and
            doses are fictional. Clinical review, a licensed anatomy atlas, a
            canonical Markdown record, live AI, and microphone input are not
            connected.
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function FocusIcon() {
  return <Target size={24} />;
}
function MoveIcon() {
  return <Activity size={24} />;
}
