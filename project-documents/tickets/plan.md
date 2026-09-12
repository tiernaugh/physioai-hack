# Delivery Plan

Status: Active
Last updated: 2026-09-12

## Current objective

Review entry point: [handoff](../handoff/README.md). Build acceptance criteria: [PRD](../handoff/prd.md). Implementation boundaries: [technical contracts](../handoff/technical-contracts.md).

Product and stack are locked. Validate the recorded-session-to-body-update path, then break implementation into estimated tickets. See `../concept/`. The earlier simulated incoming-note path is now the transcript fallback.

## Feature-complete means

- A natural environmental trigger starts the workflow.
- The agent uses context already present in that environment.
- One meaningful reasoning or tool-use step is implemented.
- The result returns to or changes the original environment.
- A person can understand and control the consequential action.
- The golden path works repeatedly with prepared demo data.
- The most likely failure has a credible recovery path.

## Critical path

| Seq. | Ticket | Outcome | Status | Owner | Depends on | Estimate |
|---:|---|---|---|---|---|---:|
| 1 | [T-001](T-001-select-concept.md) | Select the concept and environmental claim | Done | Team / Codex documentation | — | 30m |
| 2 | [T-002](T-002-validate-contextual-advantage.md) | Prove the environment materially changes the workflow | Ready | Unassigned | T-001 | 20m |
| 3 | [T-003](T-003-prove-critical-integration.md) | Retire the largest integration risk with a spike | Ready | Unassigned | T-001 | 30m |
| 4 | [T-004](T-004-freeze-golden-path.md) | Freeze requirements, boundaries, and demo fixture | Proposed | Unassigned | T-002, T-003 | 20m |

Implementation tickets should be written immediately after T-004, when their boundaries can reflect the selected environment and proven integration. The intended build sequence is:

```text
environment trigger
→ context ingestion
→ agent reasoning/tool step
→ human control
→ action back in the environment
→ state update
→ failure recovery
→ demo hardening
```

## Parallel work

| Track | Work | May begin when | Coordination point |
|---|---|---|---|
| Product | T-002 contextual-advantage test | T-001 is decided | Must inform T-004 requirements |
| Engineering | T-003 critical-integration spike | T-001 is decided | Must expose a stable boundary or fallback for T-004 |
| Pitch | Draft problem framing and before-state | T-001 is decided | Must use the same user and environment as the concept files |

T-002 and T-003 can run concurrently after concept selection.

## Gates

### Gate A — Concept selection

Passed: user accepted capture of the brief in the concept folder. See the decision log.

- **Entry condition:** At least two credible candidates have been described and challenged.
- **Decision or evidence required:** Scores, environmental claim, smallest workflow, and fatal concern for each finalist.
- **Exit condition:** T-001 records one selected concept and updates `../concept/`.
- **Fallback:** Narrow the strongest candidate to a single user, trigger, and action.

### Gate B — Environment and integration proof

- **Entry condition:** T-001 is done.
- **Decision or evidence required:** T-002 shows why the experience depends on the environment; T-003 demonstrates the riskiest real integration or a credible fallback.
- **Exit condition:** Both tickets are done and the central product claim remains intact.
- **Fallback:** Change the interface or integration while preserving the validated contextual advantage.

### Gate C — Build lock

- **Entry condition:** Gate B is passed.
- **Decision or evidence required:** Golden path, acceptance criteria, data fixture, human-control point, architecture, explicit non-goals, and demo moment.
- **Exit condition:** T-004 is done and implementation tickets are sequenced.
- **Fallback:** Remove steps until one complete agentic loop fits the remaining time.

## Next action

Run [T-003](T-003-prove-critical-integration.md) against the chosen stack: Next.js viewer, short recording/transcription, sourced region extraction, coach confirmation and one agent-triggered focus action. [T-002](T-002-validate-contextual-advantage.md) evaluates the session capture and client exploration story. Neither is complete.

Product-track prerequisite for both: hand-author the movement → region allowlist and agree the `Annotation` shape (starter versions in the architecture doc).

## Implementation decomposition after the spike

1. Preserve exploration; establish Next.js shell, pinned dependencies and viewer adapter.
2. Implement session recording, source events and transcription.
3. Add validated extraction and coach review/confirmation.
4. Connect confirmed updates to body focus, evidence panel and unread state.
5. Add client observation persistence and edit/delete.
6. Rehearse, reset, exercise failure paths and record the two-minute demo.

These are planning boundaries, not completed tickets. Product/stack lock does not mean the technical gate passed. T-004 remains open for validated estimates and ticket creation. Recalculate the remaining time before assigning work; historical schedule times are not a current deadline estimate.

## Stretch queue

No stretch tickets yet. Add P1 or P2 work only after implementation tickets define the full P0 golden path.

## Active blockers

None. Contextual and technical validation are the current gate.
