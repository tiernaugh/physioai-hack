# T-005 — Align the five screen states

- **Status:** In progress
- **Priority:** P0
- **Owner:** Codex (UI implementation); Tiernan/Kingsley (review)
- **Estimate:** 15–25m
- **Depends on:** None
- **Blocks:** See [plan](plan.md)
- **Concept links:** [PRD](../handoff/prd.md), [screens](../handoff/prd-experience.md), [viewer](../handoff/prd-body-viewer.md)

## Outcome
Use labelled fixtures to show overview, selected region, capture, review and confirmed/client observation states.

## Why this matters
Delivers the agreed body-record demo through an inspectable ui alignment outcome.

## In scope
Use labelled fixtures to show overview, selected region, capture, review and confirmed/client observation states.

## Out of scope
No live provider wiring or framework changes.

## Acceptance criteria
- [ ] Layout and labels reviewed together.
- [x] existing app shell reused.
- [x] fake processing labelled.
- [x] capture and workout actions distinct.

## Implementation notes
Build on the existing Vite app and Node backend. Preserve unrelated work. Estimates are planning ranges, not guarantees; revise after T-006.

## Validation
Demonstrate each criterion on the actual app; record commands or interaction evidence. Label fixtures and fallback paths explicitly.

## Completion record
- **Completed:** Pending
- **Result:** Isolated Body record UI implemented; pending Tiernan/Kingsley review.
- **Evidence:** Production build; 20 existing tests; local Chrome walkthrough of two regions, presets, expansion, simulated capture, failure/retry, proposal validation/edit/confirm, observations, reset and mobile layout.
- **Deviations/follow-ups:** User authorised a 90-minute UI-first pass including expanded viewer controls. Processing/recording are labelled simulations; observations and confirmed updates are in memory only. T-007–T-012 remain pending for full integration. No live-provider capability claimed.
