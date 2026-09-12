# Tickets

This directory converts the selected concept into small, executable work items. The live sequence and critical path are maintained in [`plan.md`](plan.md).

## Naming

Ticket filenames use:

```text
T-NNN-short-descriptive-slug.md
```

Examples:

```text
T-001-select-concept.md
T-005-build-trigger-handler.md
T-012-add-approval-state.md
```

IDs are permanent. Do not renumber tickets when work is reordered or removed.

## Ticket qualities

A good ticket:

- produces one observable outcome;
- is small enough to complete and verify quickly;
- states why it matters to the golden path;
- separates acceptance criteria from implementation ideas;
- identifies dependencies and ownership;
- includes a concrete validation method;
- records what was actually completed.

Prefer tickets that take roughly 15–45 minutes during the hackathon. Split a ticket if it combines multiple uncertain integrations or cannot be verified independently.

## Status

- `Proposed` — useful work that has not entered the active plan.
- `Ready` — sufficiently defined and unblocked.
- `In progress` — actively owned; only one owner.
- `Blocked` — cannot proceed; record the exact blocker and next action.
- `Done` — acceptance criteria and validation are complete.
- `Dropped` — deliberately removed; record why.

## Priority

- `P0` — required for the golden path or reliable demo.
- `P1` — materially improves judging strength after the golden path works.
- `P2` — stretch work only.

Priority does not determine sequence by itself. Dependencies and risk may put a later-facing outcome earlier on the critical path.

## Sources of truth

- `plan.md` owns order, parallelism, gates, and current progress.
- Each ticket owns its outcome, scope, acceptance criteria, execution notes, and completion record.
- `../concept/` owns product intent and requirements.
- `../05-decisions-log.md` owns material product and architectural decisions.
