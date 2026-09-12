import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Dumbbell,
  Heart,
  LayoutGrid,
  Leaf,
  ListFilter,
  Menu,
  MessageCircle,
  Mic,
  Plus,
  Search,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import BodyRecord from "./body-record/BodyRecord";
import AssessmentStory from "./AssessmentStory";
import VoiceInbox from "./VoiceInbox";
import VoiceNotes from "./VoiceNotes";
import type { VoiceNote } from "./VoiceNotes";
import VoiceAnalysis from './VoiceAnalysis';
import { buildVoiceContext, voiceActivity, voiceInProgress, voiceAnalysisText } from './voice-analysis';
import type { VoiceAnalysis as VoiceAnalysisData } from './voice-analysis';
import AgentDeepDive from "./AgentDeepDive";
import { agentAnalyses, analysisText } from "./agent-analysis";
import {
  exercises,
  exportProfile,
  loadSessions,
  regions,
  storageKey,
} from "./data";
import type { Exercise, RegionId, Session } from "./data";
import {
  actorNames,
  dayKey,
  demoToday,
  loadCareStore,
  nextAppointment,
  sampleActivity,
  sampleAgeComparison,
  saveCareStore,
  sessionActivity,
  shortDate,
  snapshots,
} from "./care-data";
import type { ActivityEntry, Actor, CareStore, Human } from "./care-data";
import "./refresh.css";
import "./today-hero.css";

type Page = "today" | "progress" | "activity";
type Panel = "help" | "assessment" | "voice" | "update" | null;
// Retain the earlier screens for future work, without exposing them in the app.
const legacyViewsEnabled = false;
const nav = [
  {
    id: "today",
    label: "Today",
    icon: LayoutGrid,
    caption: "Your health at a glance",
  },
  {
    id: "progress",
    label: "Your progress",
    icon: CalendarDays,
    caption: "Every step forward",
  },
  {
    id: "activity",
    label: "Activity",
    icon: Activity,
    caption: "One shared conversation",
  },
] as const;

function Modal({
  title,
  children,
  onClose,
  wide = false,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current!;
    el.showModal();
    return () => el.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal care-modal ${wide ? "wide" : ""} ${className}`}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <div>
          <span className="eyebrow">YOUR MOVEMENT, CONNECTED</span>
          <h2>{title}</h2>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function ActorIcon({ actor, size = 17 }: { actor: Actor; size?: number }) {
  return actor === "physio" ? (
    <Stethoscope size={size} />
  ) : actor === "agent" ? (
    <Sparkles size={size} />
  ) : (
    <UserRound size={size} />
  );
}
function ScoreChart() {
  const points = snapshots.map((s, i) => ({
    x: 12 + i * 115.2,
    y: 15 + (100 - s.score) * 1.6,
  }));
  const path = points
    .map((p, i) =>
      i === 0
        ? `M ${p.x} ${p.y}`
        : `C ${points[i - 1].x + 58} ${points[i - 1].y} ${p.x - 58} ${p.y} ${p.x} ${p.y}`,
    )
    .join(" ");
  return (
    <div className="score-chart">
      <div className="chart-axis">
        <span>100</span>
        <span>75</span>
        <span>50</span>
        <span>25</span>
      </div>
      <div className="chart-plot">
        <svg
          viewBox="0 0 600 150"
          role="img"
          aria-label="Illustrative health score rises from 48 on 20 July to 78 on 12 September"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="score-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#91b38c" stopOpacity=".28" />
              <stop offset="100%" stopColor="#91b38c" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[15, 55, 95, 135].map((y) => (
            <line
              key={y}
              x1="0"
              x2="600"
              y1={y}
              y2={y}
              stroke="#e8ece5"
              strokeDasharray="4 5"
            />
          ))}
          <path d={`${path} L 588 150 L 12 150 Z`} fill="url(#score-fill)" />
          <path d={path} fill="none" stroke="#477652" strokeWidth="3" />
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#fff"
              stroke="#477652"
              strokeWidth="2"
            />
          ))}
        </svg>
        <div className="chart-labels">
          {snapshots.map((s) => (
            <span key={s.date}>{shortDate(s.date)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    const hash = location.hash.slice(1);
    if (hash === "voice-notes") return "today";
    return nav.some((item) => item.id === hash) ? (hash as Page) : "today";
  });
  const [mobileMenu, setMobileMenu] = useState(false);
  const [actor, setActor] = useState<Human>("user");
  const [initialSessions] = useState(loadSessions);
  const [sessions, setSessions] = useState(initialSessions.sessions);
  const [initialCare] = useState(loadCareStore);
  const [care, setCare] = useState(initialCare.data);
  const [error, setError] = useState(
    initialCare.warning || initialSessions.warning || "",
  );
  const [toast, setToast] = useState("");
  const [panel, setPanel] = useState<Panel>(
    () => location.hash === "#voice-notes" ? "update" : null,
  );
  const [voiceNoteId, setVoiceNoteId] = useState<string | null>(null);
  const voiceToken = useRef("");
  const [voiceWorking, setVoiceWorking] = useState(false);
  const [detail, setDetail] = useState<Exercise | null>(null);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [filter, setFilter] = useState<Actor | "all">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 8, 1));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const voiceEntries = voiceActivity(voiceNotes);
  const analysisForEntry = (id: string) => id.startsWith("voice-analysis:") ? voiceNotes.find(note => note.id === id.slice(15))?.analysis : undefined;
  const [voiceState, setVoiceState] = useState("Checking voice notes…");
  const entries = [
    ...care.entries,
    ...sampleActivity,
    ...sessionActivity(sessions),
    ...voiceEntries,
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const pending = entries.filter(
    (e) => !(care.updates[e.id]?.done ?? e.kind === "exercise"),
  ).length;
  const todaySets = (id: string) =>
    sessions
      .filter((s) => dayKey(s.date) === demoToday)
      .reduce((total, s) => total + (s.completed[id] ?? 0), 0);
  const finishedExercises = exercises.filter(
    (e) => todaySets(e.id) >= e.sets,
  ).length;
  const filtered = entries.filter(
    (e) =>
      (filter === "all" || e.actor === filter) &&
      (statusFilter === "all" ||
        (care.updates[e.id]?.done ?? e.kind === "exercise") ===
          (statusFilter === "done")) &&
      `${e.title} ${e.body} ${actorNames[e.actor]} ${analysisText(e.id)} ${voiceAnalysisText(analysisForEntry(e.id))}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const fn = () => {
      const hash = location.hash === "#body-record" ? "today" : location.hash.slice(1);
      if (hash === "voice-notes") {
        setPage("today");
        setVoiceNoteId(null);
        setPanel("update");
        history.replaceState(null, "", "#today");
      } else if (nav.some((item) => item.id === hash)) {
        setPage(hash as Page);
      }
    };
    fn();
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    if (panel !== "voice" && panel !== "update") void refreshVoice();
  }, [panel, page]);
  useEffect(() => {
    if (!voiceWorking || panel === "update") return;
    const timer = window.setTimeout(() => void refreshVoice(), 2200);
    return () => clearTimeout(timer);
  }, [voiceWorking, voiceNotes, panel]);
  useEffect(() => {
    const fn = () => {
      const next = loadCareStore();
      const logged = loadSessions();
      if (next.warning || logged.warning)
        setError(next.warning || logged.warning || "");
      else {
        setCare(next.data);
        setSessions(logged.sessions);
      }
    };
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, []);
  function receiveVoiceNotes(notes: VoiceNote[], token = voiceToken.current) {
    voiceToken.current = token;
    const eligible = notes.filter(
      (n) => ["demo-alex", "local-test"].includes(n.patientId) &&
        typeof n.id === "string" && Number.isFinite(Date.parse(n.receivedAt)),
    );
    setVoiceWorking(eligible.some(voiceInProgress));
    setVoiceNotes(eligible);
    setVoiceState("Voice notes connected");
  }
  async function refreshVoice() {
    try {
      const response = await fetch("/api/voice/notes", {
        headers: voiceToken.current ? { Authorization: `Bearer ${voiceToken.current}` } : {},
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(response.status === 401
        ? "Voice notes locked · add a voice note to unlock" : "Voice notes unavailable");
      const notes = await response.json();
      if (!Array.isArray(notes)) throw new Error("Voice notes unavailable");
      receiveVoiceNotes(notes);
    } catch (err) {
      setVoiceState(err instanceof Error ? err.message : "Voice notes unavailable");
    }
  }
  function openVoiceNote(id: string | null = null) {
    setVoiceNoteId(id);
    setPanel("update");
  }
  function navigate(next: Page) {
    setPage(next);
    location.hash = next;
    setMobileMenu(false);
    window.scrollTo({ top: 0 });
  }
  function commit(change: (latest: CareStore) => CareStore) {
    const latest = loadCareStore();
    if (latest.warning) {
      setError(latest.warning);
      return false;
    }
    try {
      const next = change(latest.data);
      saveCareStore(next);
      setCare(next);
      setError("");
      return true;
    } catch {
      setError(
        "Your changes could not be saved. They are still here; allow browser storage and try again.",
      );
      return false;
    }
  }
  function updateEntry(entry: ActivityEntry, note?: string) {
    const date = new Date().toISOString();
    return commit((latest) => {
      const old = latest.updates[entry.id] ?? {
        done: entry.kind === "exercise",
        by: actor,
        date,
        notes: [],
      };
      return {
        ...latest,
        updates: {
          ...latest.updates,
          [entry.id]: {
            done: note ? old.done : !old.done,
            by: note ? old.by : actor,
            date: note ? old.date : date,
            notes: note
              ? [
                  ...old.notes,
                  { id: crypto.randomUUID(), actor, date, text: note },
                ]
              : old.notes,
          },
        },
      };
    });
  }
  function exportRecord() {
    const log = entries
      .map(
        (e) =>
          `### ${e.title}\n${e.date} · ${actorNames[e.actor]} · ${e.source}\n${e.body}\n${analysisText(e.id)}\n${voiceAnalysisText(analysisForEntry(e.id))}\nStatus: ${(care.updates[e.id]?.done ?? e.kind === "exercise") ? "Done" : "Open"}\n${(care.updates[e.id]?.notes ?? []).map((n) => `- ${n.date} · ${actorNames[n.actor]}: ${n.text}`).join("\n")}`,
      )
      .join("\n\n");
    const url = URL.createObjectURL(
      new Blob(
        [exportProfile(sessions), "\n\n# Shared activity log\n\n", log],
        { type: "text/markdown" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "alex-movement-record.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast("Your movement record has been exported.");
  }
  function activityCard(entry: ActivityEntry, compact = false) {
    const state = care.updates[entry.id];
    return (
      <ActivityCard
        key={entry.id}
        entry={entry}
        done={state?.done ?? entry.kind === "exercise"}
        completedBy={
          state?.done
            ? `${actorNames[state.by]} · ${shortDate(state.date)}`
            : undefined
        }
        notes={state?.notes ?? []}
        actor={actor}
        onDone={() => updateEntry(entry)}
        onNote={(text) => updateEntry(entry, text)}
        onOpenVoice={entry.id.startsWith("voice:") ? () => openVoiceNote(entry.id.slice(6))
          : entry.id.startsWith("voice-analysis:") ? () => openVoiceNote(entry.id.slice(15)) : undefined}
        voiceAnalysis={analysisForEntry(entry.id)}
        compact={compact}
      />
    );
  }
  const appointmentEntries = entries.filter((e) => e.kind === "appointment");
  const calendarEntries = selectedDay
    ? entries.filter((e) => dayKey(e.date) === selectedDay)
    : appointmentEntries;
  const appointmentSelected = selectedDay === dayKey(nextAppointment.date);
  const daysOffset =
    (new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1,
    ).getDay() +
      6) %
    7;
  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0,
  ).getDate();

  return (
    <div className="care-app">
      {mobileMenu && (
        <button
          className="care-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <aside className={`care-sidebar ${mobileMenu ? "is-open" : ""}`}>
        <a
          href="#today"
          className="care-brand"
          onClick={() => navigate("today")}
        >
          <span>
            <Activity size={25} />
          </span>
          physio<span className="brand-light">ai</span>
        </a>
        <div className="care-space-label">YOUR MOVEMENT SPACE</div>
        <nav aria-label="Main navigation">
          {nav.map(({ id, label, icon: Icon, caption }) => (
            <button
              key={id}
              aria-current={page === id ? "page" : undefined}
              className={`care-nav ${page === id ? "is-active" : ""}`}
              onClick={() => navigate(id)}
            >
              <Icon size={20} />
              <span>
                <strong>{label}</strong>
                <small>{caption}</small>
              </span>
              {id === "activity" && <b>{pending}</b>}
            </button>
          ))}
        </nav>
        <div className="care-team">
          <span className="care-kicker">IN YOUR CORNER</span>
          <div>
            <span className="care-avatar physio-avatar">ST</span>
            <span>
              <strong>Stephen</strong>
              <small>Your physiotherapist</small>
            </span>
            <span className="online-dot" />
          </div>
          <div>
            <span className="care-avatar agent-avatar">
              <Sparkles size={18} />
            </span>
            <span>
              <strong>Physio companion</strong>
              <small>Demo insights</small>
            </span>
          </div>
        </div>
        <div className="care-sidebar-message">
          <Leaf size={24} />
          <p>
            Small steps.
            <br />
            <em>Stronger every day.</em>
          </p>
          <span>A space for your whole recovery.</span>
        </div>
        <div className="care-account">
          <button onClick={() => setPanel("help")} className="care-help">
            <CircleHelp size={16} /> About this demo <ArrowUpRight size={14} />
          </button>
          <div>
            <span className="care-avatar user-avatar">AM</span>
            <span>
              <strong>Alex Morgan</strong>
              <small>Personal movement record</small>
            </span>
          </div>
        </div>
      </aside>
      <main className="care-main">
        <header className="care-topbar">
          <div>
            <button
              className="icon-button care-mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={22} />
            </button>
            <span>Your space</span>
            <ChevronRight size={13} />
            <strong>{nav.find((n) => n.id === page)!.label}</strong>
          </div>
          <div>
            <span className="care-demo">
              <i /> Sample profile
            </span>
            <label className="care-role">
              <span>Viewing as</span>
              <select
                aria-label="Demo role"
                value={actor}
                onChange={(e) => setActor(e.target.value as Human)}
              >
                <option value="user">Alex · User</option>
                <option value="physio">Stephen · Physio</option>
              </select>
            </label>
            <span className="care-avatar user-avatar top-user">
              {actor === "user" ? "AM" : "ST"}
            </span>
          </div>
        </header>
        <div className="care-content">
          <div className="care-page-heading">
            <div>
              <span className="care-kicker">
                {page === "today"
                  ? "SATURDAY, 12 SEPTEMBER 2026"
                  : page === "progress"
                    ? "THE BIGGER PICTURE"
                    : "CONNECTED CARE"}
              </span>
              <h1>
                {page === "today" ? (
                  <>
                    A little stronger, every day<span>.</span>
                  </>
                ) : page === "progress" ? (
                  <>
                    Look how far you’ve come<span>.</span>
                  </>
                ) : (
                  <>
                    Your care, all in one place<span>.</span>
                  </>
                )}
              </h1>
              <p>
                {page === "today"
                  ? "Welcome back, Alex. Here’s where you are and what’s next."
                  : page === "progress"
                    ? "Your progress, appointments and the notes that connect them."
                    : "Every check-in, physio update and agent insight. Nothing lost along the way."}
              </p>
            </div>
            <button
              className={page === "today" ? "care-primary" : "care-secondary"}
              onClick={() => page === "today" ? openVoiceNote() : exportRecord()}
            >
              {page === "today" ? <Mic size={16} /> : <ArrowDownToLine size={16} />}
              {page === "today" ? "Add a voice note" : "Download my record"}
            </button>
          </div>
          {error && (
            <div className="care-error" role="alert">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}

          {page === "today" && (
            <>
              <section
                className="care-goals-hero care-anatomy-hero"
                aria-label="Your goals and body overview"
              >
                <div className="care-hero-story">
                  <div className="care-goals-copy">
                    <span className="care-kicker">
                      <span /> YOUR GOALS · YOUR PACE
                    </span>
                    <h2>
                      Back to the walks
                      <br />
                      you love.
                    </h2>
                    <p>
                      More freedom to move. More confidence in your body.
                      <br />
                      Here’s what you and Stephen are working towards.
                    </p>
                    <div className="care-goal-chips">
                      <span>
                        <Check size={13} /> Comfortable 5 km walks
                      </span>
                      <span>
                        <TrendingUp size={13} /> Confidence on stairs
                      </span>
                      <span>
                        <Dumbbell size={13} /> A consistent routine
                      </span>
                    </div>
                    <button className="care-hero-progress" onClick={() => navigate("progress")}>
                      Follow your progress <ArrowRight size={15} />
                    </button>
                  </div>
                  <section
                    className="care-age-comparison"
                    aria-labelledby="age-comparison-title"
                  >
                    <div className="care-comparison-heading">
                      <span className="care-kicker" id="age-comparison-title">YOUR AGE GROUP</span>
                      <span className="care-comparison-sample">Example comparison</span>
                    </div>
                    <div className="care-percentile-number">
                      <span>Top</span> {100 - sampleAgeComparison.percentile}<span>%</span>
                    </div>
                    <p>
                      {sampleAgeComparison.percentile}nd percentile <span>·</span> Ages {sampleAgeComparison.ageBand}
                    </p>
                    <div className="care-percentile-scale" aria-hidden="true">
                      <span style={{ left: `${sampleAgeComparison.percentile}%` }} />
                    </div>
                    <div className="care-percentile-labels" aria-hidden="true">
                      <span>0</span><span>50</span><span>100</span>
                    </div>
                    <details className="care-comparison-info">
                      <summary><CircleHelp size={14} /> About this comparison</summary>
                      <p>
                        This example places a health score above {sampleAgeComparison.percentile}% of an
                        illustrative age group. Alex’s age isn’t recorded and no
                        age-matched population dataset is connected, so this is
                        not a measured ranking. It is separate from the 78/100 health score.
                      </p>
                    </details>
                  </section>
                </div>
                <section
                  className="care-body-card care-hero-body"
                  aria-label="Your body today"
                >
                  <BodyRecord embedded />
                </section>
              </section>
              <div className="care-summary-row">
                <section className="care-score-card">
                  <div className="care-score-ring">
                    <svg viewBox="0 0 100 100" aria-hidden="true">
                      <circle
                        cx="50"
                        cy="50"
                        r="43"
                        fill="none"
                        stroke="#e4e8d9"
                        strokeWidth="6"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="43"
                        fill="none"
                        stroke="#647b45"
                        strokeWidth="6"
                        strokeDasharray={`${78 * 2.702} 270.2`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div>
                      <strong>78</strong>
                      <span>/ 100</span>
                    </div>
                  </div>
                  <div>
                    <span className="care-kicker">YOUR HEALTH SCORE</span>
                    <h2>Moving forward</h2>
                    <p>
                      <TrendingUp size={15} /> +12 since 31 August
                    </p>
                    <small>Illustrative score · sample data</small>
                  </div>
                </section>
                <section className="care-status-card">
                  <span className="care-kicker">
                    <Heart size={15} /> CURRENT STATUS
                  </span>
                  <h2>Rebuilding strength</h2>
                  <p>Left hamstring · your current focus</p>
                  <span className="care-status-pill">
                    <i /> Building capacity
                  </span>
                </section>
                <section className="care-next-card">
                  <span className="care-kicker">
                    <CalendarDays size={15} /> NEXT APPOINTMENT
                  </span>
                  <h2>Thursday, 17 Sept</h2>
                  <p>10:00 am · Stephen · Studio 22</p>
                  <button
                    onClick={() => {
                      setSelectedDay("2026-09-17");
                      navigate("progress");
                    }}
                  >
                    View appointment <ArrowRight size={15} />
                  </button>
                </section>
              </div>
              <div className="care-today-grid care-today-followup">
                <div className="care-right-column">
                  <section className="care-routine-card">
                    <div className="care-card-heading">
                      <div>
                        <span className="care-kicker">
                          A LITTLE TIME FOR YOU
                        </span>
                        <h2>Today’s exercises</h2>
                      </div>
                      <span className="care-round-icon">
                        <Dumbbell size={19} />
                      </span>
                    </div>
                    <div className="care-routine-meta">
                      <span>
                        <Clock3 size={14} /> 20 minutes
                      </span>
                      <span>{finishedExercises} of 4 complete</span>
                    </div>
                    <div className="care-routine-progress">
                      <i
                        style={{ width: `${(finishedExercises / 4) * 100}%` }}
                      />
                    </div>
                    <div className="care-exercises">
                      {exercises.map((e, i) => (
                        <button
                          className="care-exercise"
                          key={e.id}
                          onClick={() => setDetail(e)}
                        >
                          <span className={`care-exercise-art exercise-${i}`}>
                            <ExerciseDrawing variant={i} />
                            {todaySets(e.id) >= e.sets && (
                              <b>
                                <Check size={12} />
                              </b>
                            )}
                          </span>
                          <span>
                            <small>{e.category}</small>
                            <strong>{e.name}</strong>
                            <span>
                              {e.sets} sets · {e.reps}
                            </span>
                          </span>
                          <ChevronRight size={16} />
                        </button>
                      ))}
                    </div>
                    <button
                      className="care-primary full"
                      onClick={() => setSessionOpen(true)}
                    >
                      {finishedExercises === 4
                        ? "Log another session"
                        : "Start your session"}
                      <ArrowRight size={17} />
                    </button>
                    <p className="care-caption">
                      Sample routine · not a prescribed programme
                    </p>
                  </section>
                  <section className="care-companion-card">
                    <div>
                      <span className="care-round-icon">
                        <Sparkles size={20} />
                      </span>
                      <span className="care-kicker">
                        A NOTE FROM YOUR COMPANION
                      </span>
                    </div>
                    <h3>Consistency is adding up.</h3>
                    <p>
                      You’ve logged {sessions.length} sessions. Keep your notes
                      close—how you feel is part of the picture.
                    </p>
                    <button
                      onClick={() => {
                        setFilter("agent");
                        navigate("activity");
                      }}
                    >
                      See companion updates <ArrowRight size={15} />
                    </button>
                    <small>Scripted demo insight</small>
                  </section>
                </div>
              </div>
              <div className="care-bottom-link">
                <span>
                  <span className="online-dot" /> Your next step, connected to
                  your care team.
                </span>
                <button onClick={() => navigate("activity")}>
                  See all activity <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}

          {page === "progress" && (
            <>
              <section className="care-progress-overview">
                <div>
                  <span className="care-kicker">PROGRESS OVER TIME</span>
                  <h2>Small steps. A clearer picture.</h2>
                  <div className="care-progress-number">
                    78 <span>/100</span>
                    <b>
                      <TrendingUp size={14} /> +30 from baseline
                    </b>
                  </div>
                  <p>Illustrative health score · 20 July – 12 September</p>
                </div>
                <ScoreChart />
              </section>
              <div className="care-progress-grid">
                <section className="care-calendar-card">
                  <div className="care-card-heading">
                    <h2>
                      {calendarMonth.toLocaleDateString("en-IE", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h2>
                    <div className="care-calendar-controls">
                      <button
                        aria-label="Previous month"
                        onClick={() => {
                          setCalendarMonth(
                            new Date(
                              calendarMonth.getFullYear(),
                              calendarMonth.getMonth() - 1,
                              1,
                            ),
                          );
                          setSelectedDay(null);
                        }}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        aria-label="Next month"
                        onClick={() => {
                          setCalendarMonth(
                            new Date(
                              calendarMonth.getFullYear(),
                              calendarMonth.getMonth() + 1,
                              1,
                            ),
                          );
                          setSelectedDay(null);
                        }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="care-calendar-week">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>
                  <div className="care-calendar-days">
                    {Array.from({ length: daysOffset }, (_, i) => (
                      <span key={`blank-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const key = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                      const events = entries.filter(
                        (e) => dayKey(e.date) === key,
                      );
                      const appt =
                        key === dayKey(nextAppointment.date) ||
                        events.some((e) => e.kind === "appointment");
                      return (
                        <button
                          key={key}
                          className={`${selectedDay === key ? "selected" : ""} ${key === demoToday ? "today" : ""}`}
                          aria-label={`${shortDate(key)}, ${events.length} updates${appt ? ", appointment" : ""}`}
                          aria-pressed={selectedDay === key}
                          onClick={() =>
                            setSelectedDay(selectedDay === key ? null : key)
                          }
                        >
                          {i + 1}
                          <span>
                            {appt && <i className="appointment-dot" />}
                            {events.some((e) => e.kind === "exercise") && (
                              <i className="exercise-dot" />
                            )}
                            {events.some(
                              (e) =>
                                e.kind !== "exercise" &&
                                e.kind !== "appointment",
                            ) && <i className="update-dot" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="care-calendar-legend">
                    <span>
                      <i className="appointment-dot" /> Appointment
                    </span>
                    <span>
                      <i className="exercise-dot" /> Exercise
                    </span>
                    <span>
                      <i className="update-dot" /> Update
                    </span>
                  </div>
                  <button
                    className="care-text-button"
                    onClick={() => {
                      setCalendarMonth(new Date(2026, 8, 1));
                      setSelectedDay(null);
                    }}
                  >
                    Back to this month
                  </button>
                  <div className="care-next-appointment">
                    <span className="care-kicker">COMING UP NEXT</span>
                    <div>
                      <span className="care-appointment-date">
                        <strong>17</strong>SEP
                      </span>
                      <div>
                        <strong>Progress review</strong>
                        <p>Thursday · 10:00 am</p>
                        <span>Stephen · Studio 22</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDay("2026-09-17");
                        setCalendarMonth(new Date(2026, 8, 1));
                      }}
                    >
                      View appointment <ArrowRight size={14} />
                    </button>
                  </div>
                </section>
                <section className="care-appointment-panel">
                  <div className="care-card-heading">
                    <div>
                      <span className="care-kicker">
                        YOUR JOURNEY, REMEMBERED
                      </span>
                      <h2>
                        {selectedDay
                          ? shortDate(selectedDay, true)
                          : "Appointment notes"}
                      </h2>
                    </div>
                    {selectedDay ? (
                      <button
                        className="care-text-button"
                        onClick={() => setSelectedDay(null)}
                      >
                        All appointments <X size={13} />
                      </button>
                    ) : (
                      <span className="care-tag">
                        {appointmentEntries.length} appointments
                      </span>
                    )}
                  </div>
                  {appointmentSelected && (
                    <div className="care-upcoming-detail">
                      <span className="care-status-pill">Upcoming</span>
                      <h3>{nextAppointment.title}</h3>
                      <p>17 September · 10:00–10:30 am</p>
                      <p>{nextAppointment.description}</p>
                      <span>
                        Bring your exercise notes and any questions you’d like
                        to discuss.
                      </span>
                      <button
                        className="care-secondary"
                        onClick={() => openVoiceNote()}
                      >
                        <Plus size={15} /> Add a voice note
                      </button>
                    </div>
                  )}
                  {calendarEntries.length
                    ? calendarEntries.map((e) => activityCard(e, true))
                    : !appointmentSelected && (
                        <div className="care-empty">
                          <CalendarDays size={27} />
                          <h3>A little breathing room.</h3>
                          <p>No recorded activity on this date.</p>
                          <button
                            className="care-text-button"
                            onClick={() => setSelectedDay(null)}
                          >
                            Show appointment notes
                          </button>
                        </div>
                      )}
                  {legacyViewsEnabled && (
                    <button
                      className="care-assessment-link"
                      onClick={() => setPanel("assessment")}
                    >
                      <span className="care-round-icon">
                        <ListFilter size={18} />
                      </span>
                      <span>
                        <strong>Explore the strength assessment</strong>
                        <small>
                          Separate de-identified report · measurements & 3D
                          anatomy
                        </small>
                      </span>
                      <ArrowUpRight size={18} />
                    </button>
                  )}
                </section>
              </div>
            </>
          )}

          {page === "activity" && (
            <>
              <div className="care-activity-summary">
                <div>
                  <span className="care-round-icon">
                    <Activity size={20} />
                  </span>
                  <span>
                    <strong>{entries.length}</strong> updates in your care
                    record
                  </span>
                </div>
                <div className="care-people-stack">
                  <span>AM</span>
                  <span>ST</span>
                  <span>
                    <Sparkles size={15} />
                  </span>
                  <p>You, your physio & your companion</p>
                </div>
              </div>
              <section className="care-activity-panel">
                <div className="care-activity-toolbar">
                  <div
                    className="care-filter-tabs"
                    role="group"
                    aria-label="Filter activity by source"
                  >
                    {(["all", "user", "physio", "agent"] as const).map((f) => (
                      <button
                        key={f}
                        className={filter === f ? "selected" : ""}
                        aria-pressed={filter === f}
                        onClick={() => setFilter(f)}
                      >
                        {f === "all"
                          ? "All activity"
                          : f === "user"
                            ? "From you"
                            : f === "physio"
                              ? "Physio"
                              : "Agent"}
                        <span>
                          {f === "all"
                            ? entries.length
                            : entries.filter((e) => e.actor === f).length}
                        </span>
                      </button>
                    ))}
                  </div>
                  <label className="care-status-filter">
                    <ListFilter size={14} />
                    <select
                      aria-label="Activity status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All statuses</option>
                      <option value="open">To do</option>
                      <option value="done">Done</option>
                    </select>
                  </label>
                </div>
                <div className="care-search-row">
                  <label>
                    <Search size={16} />
                    <input
                      aria-label="Search activity"
                      placeholder="Search your activity…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                  <span>{filtered.length} updates · newest first</span>
                </div>
                <div className="care-feed">
                  {filtered.map((e, i) => (
                    <div key={e.id}>
                      {(!i ||
                        dayKey(filtered[i - 1].date) !== dayKey(e.date)) && (
                        <div className="care-feed-date">
                          <span>
                            {dayKey(e.date) === demoToday ? "Today · " : ""}
                            {shortDate(e.date, true)}
                          </span>
                          <i />
                        </div>
                      )}
                      {activityCard(e)}
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="care-empty">
                      <Search size={28} />
                      <h3>No updates found</h3>
                      <p>Try another search or choose a different filter.</p>
                      <button
                        className="care-text-button"
                        onClick={() => {
                          setFilter("all");
                          setStatusFilter("all");
                          setSearch("");
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
                <div className="care-log-footer">
                  <span>{voiceState}</span>
                  <span>
                    Notes & completion saved on this device · demo roles
                  </span>
                </div>
              </section>
            </>
          )}
          <footer className="care-footer">
            <span>
              physioai <i /> A little movement. A little more you.
            </span>
            <span>Demo workspace · fictional recovery data</span>
          </footer>
        </div>
      </main>
      {page === "today" && (
        <button
          className="care-voice-add"
          onClick={() => openVoiceNote()}
          aria-label="Add a voice note"
          title="Add a voice note"
        >
          <Plus size={26} strokeWidth={1.8} />
        </button>
      )}
      {toast && (
        <div className="care-toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <div className="care-detail-art">
            <ExerciseDrawing
              variant={exercises.findIndex((e) => e.id === detail.id)}
            />
          </div>
          <div className="care-detail-stats">
            <span>
              <strong>{detail.sets}</strong> sets
            </span>
            <span>
              <strong>{detail.reps}</strong> per set
            </span>
            <span>
              <strong>{detail.minutes}</strong> minutes
            </span>
          </div>
          <p>{detail.cue}</p>
          <div className="care-detail-note">
            <strong>Equipment</strong>
            <p>{detail.equipment}</p>
            <strong>Body region</strong>
            <p>{regions.find((r) => r.id === detail.region)?.name}</p>
          </div>
          <p className="care-caption">
            Illustrative exercise and dose for this demo.
          </p>
          <button
            className="care-primary full"
            onClick={() => {
              setDetail(null);
              setSessionOpen(true);
            }}
          >
            Start your session <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {sessionOpen && (
        <SessionModal
          onClose={() => setSessionOpen(false)}
          onSave={(next) => {
            setSessions(next);
            setSessionOpen(false);
            setToast(
              "Session saved. You’ll find it in your activity and calendar.",
            );
          }}
        />
      )}
      {panel === "update" && (
        <Modal
          title={voiceNoteId ? "Voice note" : "Add a voice note"}
          className="voice-note-modal"
          onClose={() => setPanel(null)}
        >
          <VoiceNotes
            initialNoteId={voiceNoteId}
            initialToken={voiceToken.current}
            context={buildVoiceContext(entries, care)}
            onClose={() => setPanel(null)}
            onNotesChanged={receiveVoiceNotes}
            onSaved={() => {
              setPanel(null);
              setFilter("all");
              setStatusFilter("all");
              setSearch("");
              navigate("activity");
              void refreshVoice();
              setToast("Voice note added to your activity.");
            }}
          />
        </Modal>
      )}
      {legacyViewsEnabled && panel === "voice" && (
        <Modal title="Your voice notes" wide onClose={() => setPanel(null)}>
          <VoiceInbox />
        </Modal>
      )}
      {legacyViewsEnabled && panel === "assessment" && (
        <Modal
          title="Your assessment story"
          wide
          onClose={() => setPanel(null)}
        >
          <AssessmentStory />
        </Modal>
      )}
      {panel === "help" && (
        <Modal
          title="A connected movement record"
          onClose={() => setPanel(null)}
        >
          <p>
            Your workspace brings together daily exercises, progress and shared
            activity. Drag the 3D body, explore dated snapshots,
            or add a note to any activity.
          </p>
          <div className="care-detail-note">
            <strong>About the demo</strong>
            <p>
              Alex’s profile, health scores, age-group comparison, appointments and agent insights are
              fictional examples. The anatomy is a reference muscle atlas, not a
              personal scan. The health score is illustrative and does not
              measure tissue healing.
            </p>
            <strong>One device, two perspectives</strong>
            <p>
              Switch “Viewing as” to try user or physio actions. These are demo
              roles, with browser-local notes and completion. They do not
              provide authentication or cross-device sharing.
            </p>
            <strong>Voice notes from Today</strong>
            <p>
              In Today, choose Add a voice note or the floating plus button.
              Record or upload audio, listen back, then add it to your activity.
              In Activity, reopen a saved voice note to read its transcript,
              or choose Download my record to save your movement record.
            </p>
          </div>
          <button className="care-primary full" onClick={exportRecord}>
            <ArrowDownToLine size={16} /> Export your movement record
          </button>
        </Modal>
      )}
    </div>
  );
}

function ActivityCard({
  entry,
  done,
  completedBy,
  notes,
  actor,
  onDone,
  onNote,
  onOpenVoice,
  voiceAnalysis,
  compact,
}: {
  entry: ActivityEntry;
  done: boolean;
  completedBy?: string;
  notes: { id: string; actor: Human; date: string; text: string }[];
  actor: Human;
  onDone: () => void;
  onNote: (text: string) => boolean;
  onOpenVoice?: () => void;
  voiceAnalysis?: VoiceAnalysisData | null;
  compact: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [saveError, setSaveError] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    if (text.trim() && onNote(text.trim())) {
      setText("");
      setAdding(false);
      setSaveError("");
    } else
      setSaveError(
        "This note could not be saved. Your text is still here; check browser storage and try again.",
      );
  }
  return (
    <article className={`care-activity-card ${compact ? "compact" : ""}`}>
      <div className={`care-actor-icon actor-${entry.actor}`}>
        <ActorIcon actor={entry.actor} />
      </div>
      <div className="care-entry-content">
        <div className="care-entry-meta">
          <strong>{actorNames[entry.actor]}</strong>
          <span className={`care-source source-${entry.actor}`}>
            {entry.actor === "user"
              ? "You"
              : entry.actor === "physio"
                ? "Physio"
                : "Agent"}
          </span>
          <time dateTime={entry.date}>
            {compact
              ? shortDate(entry.date, true)
              : new Date(entry.date).toLocaleTimeString("en-IE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
          </time>
          <small>
            {entry.source === "sample"
              ? "Sample"
              : entry.source === "whatsapp"
                ? "WhatsApp"
                : "On this device"}
          </small>
        </div>
        <h3>{entry.title}</h3>
        <p>{entry.body}</p>
        {entry.region && (
          <span className="care-region-tag">
            <Activity size={11} />
            {regions.find((r) => r.id === entry.region)?.name}
          </span>
        )}
        {agentAnalyses[entry.id] && (
          <AgentDeepDive
            analysis={agentAnalyses[entry.id]}
            compact={compact}
            onDiscuss={() => setAdding(true)}
          />
        )}
        {voiceAnalysis && <VoiceAnalysis analysis={voiceAnalysis} showSummary={false} />}
        {notes.length > 0 && (
          <div className="care-entry-notes">
            {notes.map((n) => (
              <div key={n.id}>
                <span>
                  <strong>{actorNames[n.actor]}</strong>
                  <time dateTime={n.date}>
                    {shortDate(n.date)} ·{" "}
                    {new Date(n.date).toLocaleTimeString("en-IE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </span>
                <p>{n.text}</p>
              </div>
            ))}
          </div>
        )}
        <div className="care-entry-actions">
          {onOpenVoice && (
            <button onClick={onOpenVoice}>
              <Mic size={14} /> View voice note
            </button>
          )}
          <button
            className={done ? "is-done" : ""}
            aria-pressed={done}
            onClick={onDone}
          >
            <span className="care-checkbox">{done && <Check size={11} />}</span>
            {done ? "Done" : "Mark as done"}
          </button>
          <button onClick={() => setAdding(!adding)} aria-expanded={adding}>
            <MessageCircle size={14} />
            {notes.length ? `Add note · ${notes.length}` : "Add note"}
          </button>
          {completedBy && <small>Marked by {completedBy}</small>}
        </div>
        {adding && (
          <form className="care-note-form" onSubmit={submit}>
            <label htmlFor={`note-${entry.id}`}>
              Note from {actorNames[actor]}
            </label>
            <textarea
              id={`note-${entry.id}`}
              autoFocus
              rows={3}
              maxLength={2000}
              placeholder="Add context, a question, or how you’re feeling…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {saveError && (
              <p className="care-form-error" role="alert">
                {saveError}
              </p>
            )}
            <div>
              <button
                type="button"
                className="care-text-button"
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>
              <button className="care-primary" disabled={!text.trim()}>
                Save note <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
}
function SessionModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (sessions: Session[]) => void;
}) {
  const [started] = useState(Date.now);
  const [completed, setCompleted] = useState<Record<string, number[]>>({});
  const [discomfort, setDiscomfort] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const count = Object.values(completed).reduce((a, b) => a + b.length, 0);
  function save() {
    const latest = loadSessions();
    if (latest.warning) {
      setError(latest.warning);
      return;
    }
    const next: Session[] = [
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        title: "Hamstring recovery",
        completed: Object.fromEntries(
          Object.entries(completed).map(([id, sets]) => [id, sets.length]),
        ),
        discomfort,
        note: note.trim(),
        minutes: Math.max(1, Math.round((Date.now() - started) / 60000)),
        source: "demo-entry",
      },
      ...latest.sessions,
    ];
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      onSave(next);
    } catch {
      setError(
        "This session could not be saved. Your entries are still here; allow browser storage and try again.",
      );
    }
  }
  return (
    <Modal title="A little time for your movement." onClose={onClose} wide>
      <p className="care-session-intro">
        Mark each set you complete. Your session will appear in your calendar
        and activity log.
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
                  aria-pressed={(completed[e.id] ?? []).includes(i)}
                  className={
                    (completed[e.id] ?? []).includes(i) ? "complete" : ""
                  }
                  onClick={() =>
                    setCompleted((old) => ({
                      ...old,
                      [e.id]: (old[e.id] ?? []).includes(i)
                        ? old[e.id].filter((n) => n !== i)
                        : [...(old[e.id] ?? []), i],
                    }))
                  }
                >
                  {(completed[e.id] ?? []).includes(i) ? (
                    <Check size={16} />
                  ) : (
                    i + 1
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="care-update-form">
        <label>
          Discomfort after this session <span>(optional)</span>
          <select
            aria-label="Discomfort after this session"
            value={discomfort ?? ""}
            onChange={(e) =>
              setDiscomfort(
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          >
            <option value="">Not recorded</option>
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i} value={i}>
                {i}/10
              </option>
            ))}
          </select>
        </label>
        <label>
          Anything you’d like to remember?
          <textarea
            rows={3}
            maxLength={2000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How did that feel?"
          />
        </label>
        {error && (
          <p className="care-form-error" role="alert">
            {error}
          </p>
        )}
        <div className="care-session-save">
          <span>
            {count} of {exercises.reduce((a, b) => a + b.sets, 0)} sets marked
          </span>
          <button className="care-primary" disabled={!count} onClick={save}>
            Save session <Check size={16} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
function ExerciseDrawing({ variant }: { variant: number }) {
  return (
    <svg viewBox="0 0 100 78" fill="none" aria-hidden="true">
      <ellipse
        cx="50"
        cy="65"
        rx="39"
        ry="5"
        fill="currentColor"
        opacity=".07"
      />
      <path d="M12 64H89" stroke="currentColor" strokeWidth="2" opacity=".2" />
      {variant === 3 ? (
        <g
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="67" cy="20" r="6" fill="currentColor" stroke="none" />
          <path d="M58 27L39 39L41 50L32 63M39 39L52 51L56 63M55 29L66 43" />
        </g>
      ) : (
        <g
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="19" cy="53" r="6" fill="currentColor" stroke="none" />
          <path
            d={
              variant === 0
                ? "M30 57L50 57L64 40L79 61M48 57L70 61"
                : variant === 1
                  ? "M29 57L50 38L66 40L80 61M48 39L60 46L66 61"
                  : "M29 57L49 44L69 54L83 57M49 44L65 42L81 54"
            }
          />
          <path d="M31 58L43 61" strokeWidth="4" />
        </g>
      )}
    </svg>
  );
}
