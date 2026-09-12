# Review Checklist for Stephen
Status: Ready for interrogation

## Product
- Does the body make it easier to recover the explanation than a report?
- Is one session capture/review mode sufficient for the coach?
- Can the same event support recovery and performance contexts without adding workout planning?
- Is source attribution clear enough to separate coach words from generated explanation?

## Technical gates
- Verify the [stack](../concept/05-technical-architecture.md) on the actual demo device.
- Resolve at least two broad regions without assuming joint tests identify specific muscles.
- Prove real microphone → transcript → sourced proposal → confirmation → body focus.
- Verify the chosen transcription response before relying on time alignment.
- Pin a compatible Next/React/Three/CopilotKit package set and model configuration.
- Verify event/revision deduplication, stale-response handling and local storage errors.

## Decisions to challenge with evidence
The chosen framework is Next.js, but a failed time-boxed integration should produce a concrete alternative and tradeoff. Viewer reuse is preferred; upstream tooling alone is not proof. Exact package versions and region IDs remain open engineering choices.

## Deliver back
1. Confirmed assumptions and evidence.
2. Blocking unknowns with the smallest experiment to resolve each.
3. Proposed ADR changes, if any.
4. Implementation ticket split and estimates against actual time remaining.
5. One proven end-to-end spike, with live/seeded/fallback boundaries stated.

## Start
Read the PRD, then run [T-003](../tickets/T-003-prove-critical-integration.md). Product review [T-002](../tickets/T-002-validate-contextual-advantage.md) can proceed independently. Final ticket planning is [T-004](../tickets/T-004-freeze-golden-path.md); do not mark technical checks passed from documentation alone.
