# Decisions Log

Status: Draft

Record decisions that materially affect product scope, interaction design, architecture, or the demo. Do not use this file for routine implementation details.

## Template

### YYYY-MM-DD — Decision title

- **Status:** Proposed | Decided | Superseded
- **Decision:** What was chosen.
- **Reason:** Why it best supports the user, environment, judging criteria, and build constraints.
- **Alternatives considered:** Serious alternatives and why they were rejected.
- **Consequences:** What this enables, constrains, or requires.
- **Owner:** Person responsible for following through.

## Current decisions

### 2026-09-12 — Demonstrate continuity through an incoming update

- **Status:** Decided
- **Decision:** Start the demo with an existing body record. A labelled coach-note fixture triggers agent mapping and a regional update; the client explores it and adds an observation there.
- **Reason:** Show a natural event, shared context and an actual record change to strengthen theme alignment.
- **Consequences:** Add event identity, source attribution, unread state and deduplication. Keep delivery simulated and mapping real. No external messaging integration or trend dashboard is required.
- **Owner:** Team

### 2026-09-12 — Centre the client body explorer

- **Status:** Decided
- **Decision:** Make the client the primary user and the body the main navigation. Map prepared assessment context to regions, guide exploration and save a client observation at a selected location.
- **Reason:** The user explicitly redirected the concept toward understanding and viewing the body, with Human Atlas as inspiration.
- **Alternatives considered:** Coach-first clarification and approval flow; retained as historical thinking only.
- **Consequences:** The assessment-room brief below is superseded. Live audio, hardware feeds and a coach dashboard leave P0. Viewer integration, evidence mapping and note persistence become the critical path.
- **Owner:** Team; documented by Codex following user confirmation.

### 2026-09-12 — Select the assessment-room concept

- **Status:** Superseded by the client body explorer
- **Decision:** Capture the accepted ambient assessment-room brief in `concept/`: one baseline-session segment, elbow readings, spoken observation, clarification and coach approval.
- **Reason:** The shared session provides active-test context and an opportunity to resolve disagreement while both people are present.
- **Alternatives considered:** The full ecosystem is too broad; post-assessment messaging is a fallback with a weaker timing advantage.
- **Consequences:** Hardware input is explicitly simulated. Technical validation and final build lock remain open. Other assessment purposes are illustrative future workflows.
- **Owner:** Team; documented by Codex following user acceptance.

### 2026-09-12 — Separate project knowledge from implementation

- **Status:** Decided
- **Decision:** Maintain shared thinking and source material in `project-documents/`; build the application in `project-app/` after concept selection.
- **Reason:** The team needs a stable place to compare ideas and define the golden path without prematurely coupling the concept to a framework.
- **Alternatives considered:** Scaffolding the application immediately and documenting inside it.
- **Consequences:** The app directory remains intentionally minimal until the concept and stack are chosen.
- **Owner:** Team

### 2026-09-12 — Use shared instructions across coding agents

- **Status:** Decided
- **Decision:** Keep canonical agent instructions in scoped `AGENTS.md` files and use lightweight `CLAUDE.md` imports for Claude Code compatibility.
- **Reason:** Codex and Claude should follow the same project intent without maintaining duplicated instruction text.
- **Alternatives considered:** Separate full instruction files for each agent.
- **Consequences:** Changes belong in `AGENTS.md`; the `CLAUDE.md` bridge files should stay minimal.
- **Owner:** Team
