# T-003 — Prove the critical integration

- **Status:** Proposed
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

- [ ] A real request, event, or interaction crosses the critical integration boundary.
- [ ] The response or action needed by the golden path is observable.
- [ ] Required credentials and setup steps are understood without committing secrets.
- [ ] Expected latency and the most likely failure are recorded.
- [ ] A fallback preserves the core environmental claim if the integration fails later.
- [ ] The spike is honestly classified as live, seeded, mocked, or manual.

## Implementation notes

Choose this integration from the selected workflow. Do not assume CopilotKit, WhatsApp, Telegram, or a sponsor API is critical until T-001 establishes the environment.

## Validation

- Repeat the minimum interaction twice.
- Capture a command, log, screenshot, or observable environment result as evidence.

## Completion record

- **Completed:** Pending
- **Result:** Pending
- **Evidence:** Pending
- **Deviations/follow-ups:** None
