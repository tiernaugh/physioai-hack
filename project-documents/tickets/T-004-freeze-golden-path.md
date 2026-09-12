# T-004 — Freeze the golden path

- **Status:** Dropped
- **Priority:** P0
- **Owner:** Unassigned
- **Estimate:** 20 minutes
- **Depends on:** T-002, T-003
- **Blocks:** Implementation tickets
- **Concept links:** [`../concept/03-agent-workflow.md`](../concept/03-agent-workflow.md), [`../concept/05-technical-architecture.md`](../concept/05-technical-architecture.md), [`../concept/06-scope-and-requirements.md`](../concept/06-scope-and-requirements.md), [`../concept/08-demo-story.md`](../concept/08-demo-story.md)

## Superseded planning gate
Superseded by T-005 through T-012 under the UI-first Vite plan. Requirements carry forward; unchecked validation is not claimed complete. Retained below for historical context.

## Outcome

Freeze one buildable end-to-end workflow, its technical boundaries, acceptance criteria, demo fixture, and explicit non-goals.

## Why this matters

The build needs a shared contract that product, engineering, interface, and pitch work can follow without continuous scope drift.

## In scope

- Write the step-by-step golden path.
- Define observable acceptance criteria and the human-control point.
- Choose the minimum stack using evidence from T-003.
- Specify demo data, starting state, reset procedure, and fallback.
- List explicit non-goals.
- Create and sequence implementation tickets in `plan.md`.

## Out of scope

- Implementing the workflow.
- Stretch-feature design.
- Production-readiness requirements unrelated to the demo.

## Acceptance criteria

- [ ] One trigger-to-result workflow is documented without alternative branches in the happy path.
- [ ] Requirements are observable and fit the remaining build time.
- [ ] Live, seeded, mocked, and manual boundaries are explicit.
- [ ] Human control and likely failure recovery are defined.
- [ ] Stack choices map directly to required behaviour.
- [ ] P0 implementation tickets cover the complete loop and are sequenced in `plan.md`.
- [ ] P1 and P2 work cannot delay feature completion.

## Implementation notes

The user locked product scope and stack on 2026-09-12. Do not reopen those choices merely because this ticket is pending. Remaining work is to incorporate spike evidence, produce implementation tickets and confirm the schedule fits actual time remaining.

If estimates do not fit, remove steps or integrations before creating build tickets. Preserve the environmental claim, meaningful agent reasoning, and human-control moment.

## Validation

- Walk through the documented demo using only the specified fixture and boundaries.
- Confirm every visible step maps to a P0 implementation ticket.

## Completion record

- **Completed:** Pending
- **Result:** Pending
- **Evidence:** Pending
- **Deviations/follow-ups:** None
