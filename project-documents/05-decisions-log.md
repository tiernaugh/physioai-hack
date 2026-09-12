# Decisions Log

## 2026-09-12 — Add the supplied assessment as a separate story

- **Status:** Decided
- **Decision:** Keep the existing six-month fictional hamstring experience unchanged and add a separate Assessment story based on the de-identified Studio 22 report.
- **Reason:** The user asked for a second story rather than a replacement. This preserves the original demo while showing how a real report can become a clear, explorable narrative.
- **Evidence boundary:** The report supports the strength readings, ankle-range limitation, four-week rehabilitation priority, progressive loading and retest. It does not specify ankle laterality, diagnose an injured muscle, or prescribe named exercises and doses. The new story therefore labels musculature as associated reference anatomy and all named movements as examples for professional discussion.
- **Experience:** Move from baseline to week four, inspect the full measured-strength table, see ankle-related musculature and connect each phase to a clearly labelled exercise example.
- **Owner:** Team

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

### 2026-09-12 — UI-first delivery on the existing application

- **Status:** Decided
- **Decision:** Build on Kingsley's Vite/React and Node implementation. Agree five screen states first, add expanded body and labelled orientation controls, then connect real capture/extraction/review.
- **Reason:** User explicitly selected reuse under time pressure and requested visual alignment before further work.
- **Consequences:** ADR-006 supersedes Next.js migration. T-005 through T-013 replace the earlier broad planning gates. Historical snapshot switching is P1; orientation cube is deferred. No application behaviour is claimed implemented by these documents.
- **Owner:** Team

### 2026-09-12 — Combine prototype work and consultation handoff

- **Status:** Decided
- **Decision:** Preserve Kingsley's existing application and local assessment/golf work alongside Tiernan's recorded-session brief, with an explicit implementation-status map in `handoff/integration-status.md`.
- **Reason:** The user requested merging and combining the two contributions after reviewing the incoming documentation changes.
- **Consequences:** Existing prototype features remain in the repository. Consultation P0 exclusions are delivery boundaries, not deletion instructions. Next.js/CopilotKit and the recorded-session flow remain pending implementation and validation; this merge does not claim that migration or integration is complete.
- **Owner:** Team

### 2026-09-12 — Publish implementation handoff documents

- **Status:** Decided
- **Decision:** Use `handoff/prd.md` for detailed acceptance criteria, `adrs/` for architectural rationale and `handoff/technical-contracts.md` for proposed implementation interfaces.
- **Reason:** Give Stephen and the team a reviewable starting point with explicit decisions, assumptions and verification gaps.
- **Consequences:** Concept summaries and tickets link to these contracts; changes must be synchronized. Accepted ADRs do not imply completed technical validation.
- **Owner:** Team

### 2026-09-12 — Lock recorded-session capture and client body record

- **Status:** Decided
- **Decision:** Use Next.js App Router, vendored Human Atlas, CopilotKit, OpenAI transcription/structured extraction and localStorage. Add a small Start/Finish session mode: record, extract, coach review, confirm, client exploration and client note.
- **Reason:** User accepted the reviewed stack and session interaction and asked to lock the brief for work planning.
- **Consequences:** Live short recording is P0; transcript input is fallback. No exercise planning, recovery percentages, hardware/WhatsApp integration or separate coach dashboard. T-003 still must prove the integration; T-004 still must create estimated implementation tickets.
- **Corrections to earlier proposal:** Upstream callbacks do not prove our integration. Localhost geometry on the presentation laptop does not depend on venue Wi-Fi. Deduplicate source events, not entire assessments.
- **Owner:** Team

### 2026-09-12 — Transplant the Human Atlas renderer; Next.js + CopilotKit + OpenAI stack

- **Status:** Superseded by locked stack and session-capture decision above; retained as proposal history
- **Decision:** Vendor Human Atlas's renderer (`scene.tsx` + four sibling files) and packaged BodyParts3D geometry into our own Next.js App Router app as `src/atlas/`, rather than forking the repo or rebuilding a viewer. Use CopilotKit for agent ↔ UI shared state and actions, OpenAI structured outputs with a region-allowlist enum for extraction, `localStorage` for notes, and `localhost` for the demo. Skip Auth0, Trigger.dev, Exa, Ambiguous AI and Cloud Run in P0.
- **Reason:** Reading the upstream source (2026-09-12) shows `scene.tsx` depends only on `react`, `three` and sibling files, the build config is plain Vite, and an agent-drives-viewer tool layer already exists upstream. The agent-to-viewer integration T-003 was written to test is therefore already proven; the remaining risk is the 33 MB geometry payload on venue wifi and the CopilotKit shared-state wrapper. Two load-bearing sponsor integrations map directly to required behaviour; the rest are non-goals or belong to the superseded coach-first concept.
- **Alternatives considered:** Fork wholesale (fast, but inherits a 102 MB repo, unused beta toolchain and a UI we rewrite anyway; weak provenance for judges). Rebuild from scratch (the packaged geometry is the expensive part; pointless). Vite + separate Node runtime for CopilotKit (viable; two processes for no gain).
- **Consequences:** T-003 is re-scoped from "can the agent move the viewer" to "transplant under 30 minutes, cold-load on the demo device, CopilotKit wraps `SceneState`". The hand-authored movement → region allowlist and the `Annotation` shape become the first artefacts both tracks depend on. Upstream MIT LICENSE and CC BY 4.0 ATTRIBUTION.md ship with the vendored module. Full analysis in `concept/05-technical-architecture.md`.
- **Owner:** Product lead proposes; CTO to confirm or amend before build lock.

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
