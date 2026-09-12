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
