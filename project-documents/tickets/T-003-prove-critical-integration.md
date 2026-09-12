# T-003 — Prove the critical integration

- **Status:** Ready
- **Priority:** P0
- **Owner:** Unassigned
- **Estimate:** 30 minutes
- **Depends on:** T-001
- **Blocks:** T-004
- **Concept links:** [`../concept/03-agent-workflow.md`](../concept/03-agent-workflow.md), [`../concept/05-technical-architecture.md`](../concept/05-technical-architecture.md), [`../concept/07-risks-and-open-questions.md`](../concept/07-risks-and-open-questions.md)

## Outcome

Prove the single riskiest external or environmental integration through the smallest executable spike, and identify a fallback that preserves the product claim.

## Why this matters

The build should fail early on an uncertain dependency rather than after the interface and agent logic assume it works.

## In scope

- Identify the integration with the greatest combination of uncertainty and criticality.
- Verify credentials, basic event or data access, and the required return action.
- Measure rough latency for the demo path.
- Record constraints and a time-bounded fallback.
- Update the architecture and risk documents with evidence.

## Out of scope

- Production-quality implementation.
- Multiple sponsor integrations.
- Polished interface work.
- Non-critical stretch capabilities.

## Acceptance criteria

- [ ] An incoming fixture note is mapped from source text to a validated region, shown as an unread update and opened through viewer focus.
- [ ] Replaying the event does not duplicate it; the update and client observation survive reload.

- [ ] A real request, event, or interaction crosses the critical integration boundary.
- [ ] The response or action needed by the golden path is observable.
- [ ] Required credentials and setup steps are understood without committing secrets.
- [ ] Expected latency and the most likely failure are recorded.
- [ ] A fallback preserves the core environmental claim if the integration fails later.
- [ ] The spike is honestly classified as live, seeded, mocked, or manual.

## Implementation notes

Re-scoped 2026-09-12 after reading the Human Atlas source (see `../concept/05-technical-architecture.md`, status Proposed pending CTO review).

**Retired by inspection:** agent-driven region selection. Upstream `app/agent-tools.ts` already selects concepts in the 3D scene via `SceneState.selected`; `scene.tsx` is a controlled component depending only on `react`, `three` and four sibling files.

**Current critical boundary, in order:**

1. **Transplant** — scaffold Next.js App Router; vendor `scene.tsx`, `anatomy.ts`, `model-download.ts`, `pointer-tap.ts`, `explosion-layout.ts` and `public/models/` into `src/atlas/` with upstream LICENSE and ATTRIBUTION.md. Mount via `dynamic(..., {ssr:false})`. **Time-box 30 minutes.** Fallback: fork and gut `page.tsx`.
2. **Cold load on the demo device** — ~33 MB across 14 chunks. Measure from `localhost` and from venue wifi; record both. This is the most likely demo failure.
3. **CopilotKit wraps `SceneState`** — `useCopilotReadable` on selection + assessment; one `useCopilotAction('focus_region')` that mutates real state and visibly moves the viewer. This is the actual unproven boundary.
4. **Allowlist resolution** — find the atlas concept IDs for elbow, hip, shoulder and ankle joint regions in `public/models/atlas.json` and fill the TBDs in the architecture doc.

Audio capture and live device integration remain outside P0.

## Validation

- Repeat the minimum interaction twice.
- Capture a command, log, screenshot, or observable environment result as evidence.

## Completion record

- **Completed:** Pending
- **Result:** Pending
- **Evidence:** Pending
- **Deviations/follow-ups:** None
