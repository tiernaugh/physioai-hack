# Delivery Plan
Status: Active — UI-first, build on existing app
Updated: 2026-09-12

## Objective
Agree the visible experience, then deliver recording → real extraction → review → updated body → client observation in Kingsley's Vite app. No Next.js migration.

## Sources
[Product PRD](../handoff/prd.md), [screen PRD](../handoff/prd-experience.md), [viewer PRD](../handoff/prd-body-viewer.md), [ADR-006](../adrs/006-build-on-vite-prototype.md).

## Ordered tickets
| Seq. | Ticket | Status | Depends on | Estimate | Suggested track |
|---:|---|---|---|---|---|
| 1 | [T-005: Align the five screen states](T-005-align-body-record-ui.md) | In progress | None | 90m approved prototype pass | Codex; Tiernan/Kingsley review |
| 2 | [T-006: Audit reuse and freeze the annotation boundary](T-006-audit-reuse-and-contract.md) | Ready | None | 15–25m | Technical audit; owner unassigned |
| 3 | [T-007: Add multi-region focus, expanded view and presets](T-007-add-viewer-controls.md) | Proposed | T-005, T-006 | 30–45m | Viewer; owner unassigned |
| 4 | [T-008: Connect coach recording and transcript input](T-008-connect-coach-capture.md) | Proposed | T-005, T-006 | 20–35m | Capture; owner unassigned |
| 5 | [T-009: Produce sourced region proposals with a real model](T-009-extract-sourced-proposals.md) | Proposed | T-006 | 25–40m | Agent; owner unassigned |
| 6 | [T-010: Wire review, confirmation and regional updates](T-010-publish-reviewed-updates.md) | Proposed | T-007, T-008, T-009 | 20–30m | Integration; owner unassigned |
| 7 | [T-011: Save client observations and record state](T-011-save-client-observations.md) | Proposed | T-005, T-006 | 15–25m | Persistence; owner unassigned |
| 8 | [T-012: Verify and rehearse the complete experience](T-012-rehearse-complete-demo.md) | Proposed | T-010, T-011 | 20–30m | Verification; owner unassigned |
| 9 | [T-013: Add earlier recorded-session navigation](T-013-add-recorded-snapshots.md) | Proposed | T-012 | 15–25m | History; owner unassigned |

## Sequence and parallel work
- Start T-005 UI alignment and T-006 reuse/contract audit together.
- After both: viewer T-007 and capture T-008 can proceed independently; extraction T-009 can begin from the agreed contract and prepared transcript immediately after T-006.
- Client persistence T-011 can proceed after the contract and UI checkpoint.
- Join viewer, capture and extraction in T-010. Join persistence for T-012 rehearsal.
- T-013 historical switching is P1 and starts only after the full loop is verified.

Parallel work means separate agreed file/component ownership between teammates, not concurrent edits to App.tsx. Assign one owner for shell integration. Agree the adapter/event types in T-006 before divergent implementations.

## Gates
A — UI agreement: walk five states together; fixtures clearly labelled. Do not mistake a mock screen for working processing.
B — Early technical proof: one real transcript produces one valid annotation before visual polish. Viewer resolves two regions. If blocked, report the specific missing capability and proposed fallback.
C — Integrated demo: real audio to confirmed body update plus persistent client observation, with expanded mode and camera controls.
D — Rehearsal: two successful runs on actual device, failure handling, reset and measured latency.

## Time budget
Planning ranges total roughly 2h40–4h15 of person-work for P0, before unexpected failures. With two people and clean ownership, some work overlaps; this is not a promise it fits the remaining event time. Re-estimate immediately after T-006.
Cut P1 history, upload UI and orientation cube first. Do not silently drop real extraction or claim transcript fallback proves recording.

## Feature-complete
PR-01 through PR-18 pass. No fabricated annotations, recovery percentages or hidden simulated agent calls. Existing unrelated prototype features may remain but do not count toward completion.

## Next executable work
T-005: Body record walkthrough is implemented; review the five states with Tiernan/Kingsley. Existing Vite sidebar → Body record. Local Chrome and build/tests pass; human layout/label agreement remains pending.
T-006: independently audit the reusable backend/viewer and finalize shared types.

The approved 90-minute prototype pass includes working camera controls and in-memory review/observations, but does not complete the live integration or persistence tickets. The feature is isolated in src/body-record; App.tsx has only the navigation/mount boundary. Recording and processing are explicit simulations.

## Earlier tickets
T-001 remains completed concept selection. T-002 through T-004 are superseded as planning gates by these concrete tickets; their unchecked criteria are not evidence of completed implementation. Their scope is carried into the new gates and tickets.

## Active blockers
None recorded. Provider readiness, viewer generalization and actual remaining time must be resolved in T-006.
