# T-011 — Save client observations and record state

- **Status:** Proposed
- **Priority:** P0
- **Owner:** Unassigned (Persistence)
- **Estimate:** 15–25m
- **Depends on:** T-005, T-006
- **Blocks:** See [plan](plan.md)
- **Concept links:** [PRD](../handoff/prd.md), [screens](../handoff/prd-experience.md), [viewer](../handoff/prd-body-viewer.md)

## Outcome
Implement client text notes and versioned record storage without touching workout records.

## Why this matters
Delivers the agreed body-record demo through an inspectable persistence outcome.

## In scope
Implement client text notes and versioned record storage without touching workout records.

## Out of scope
No cross-device sync.

## Acceptance criteria
- [ ] Preview/save/edit/delete preserves exact words and region.
- [ ] reload works.
- [ ] storage errors retain draft.
- [ ] later distinct sessions append.

## Implementation notes
Build on the existing Vite app and Node backend. Preserve unrelated work. Estimates are planning ranges, not guarantees; revise after T-006.

## Validation
Demonstrate each criterion on the actual app; record commands or interaction evidence. Label fixtures and fallback paths explicitly.

## Completion record
- **Completed:** Pending
- **Result:** Pending
- **Evidence:** Pending
- **Deviations/follow-ups:** None
