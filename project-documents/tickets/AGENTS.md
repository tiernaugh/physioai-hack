# Ticket Instructions

These instructions extend the repository and project-document instructions for work in this directory.

## How to use tickets

1. Read `plan.md`, the relevant ticket, and its linked concept documents before starting.
2. Confirm that dependencies marked in the ticket are complete or explicitly waived.
3. Set the ticket to `In progress` and record the owner before making material changes.
4. Work only toward the stated outcome and acceptance criteria. Put newly discovered work in a follow-up ticket instead of silently expanding scope.
5. Run the ticket's validation steps.
6. Record the completion result, material deviations, and evidence.
7. Set the ticket to `Done` only when every required acceptance criterion passes.
8. Update `plan.md` whenever status, sequence, ownership, dependency, critical path, or scope changes.
9. Record enduring product or architecture decisions in `../05-decisions-log.md`; do not bury them in a ticket.

## Ticket writing conventions

- Use the next unused permanent ID in `T-NNN` format.
- Give each ticket one outcome phrased as a completed result.
- Keep acceptance criteria observable and binary where possible.
- Write implementation notes as guidance, not disguised requirements.
- Link to relevant concept requirements rather than copying and allowing them to diverge.
- Mark seeded, mocked, manual, and live behaviour explicitly.
- Include the expected demo impact for P0 and P1 work.
- Record an exact blocker. “Need more time” is not a useful blocker.
- Prefer a follow-up ticket when work grows beyond about 45 minutes or crosses another system boundary.
- Do not create tickets for trivial edits that are naturally part of an active ticket.

## Ticket template

Use this structure for new `T-NNN-short-slug.md` files:

```markdown
# T-NNN — Outcome-oriented title

- **Status:** Proposed | Ready | In progress | Blocked | Done | Dropped
- **Priority:** P0 | P1 | P2
- **Owner:** Unassigned
- **Estimate:** 15–45 minutes
- **Depends on:** None | T-NNN
- **Blocks:** None | T-NNN
- **Concept links:** Relative links to relevant source-of-truth documents

## Outcome

Describe the single observable result this ticket will produce.

## Why this matters

Connect the outcome to the golden path, contextual advantage, reliability, or demo.

## In scope

- Required work.

## Out of scope

- Adjacent work deliberately excluded.

## Acceptance criteria

- [ ] Observable, binary criterion.
- [ ] Relevant failure or fallback criterion.

## Implementation notes

Non-binding technical guidance, known constraints, or useful references.

## Validation

- Command, interaction, inspection, or evidence required before completion.

## Completion record

- **Completed:** YYYY-MM-DD or pending
- **Result:** Pending
- **Evidence:** Pending
- **Deviations/follow-ups:** None
```

## Plan conventions

`plan.md` is an operational view, not a second requirements document. It must show:

- the current objective and definition of feature-complete;
- the ordered critical path;
- work that can happen concurrently;
- decision or integration gates;
- ticket status and owner;
- the next executable ticket;
- stretch work kept outside the critical path;
- any active blocker and recovery choice.

Keep sequence numbers separate from ticket IDs so tickets can be reordered without renaming files.

## Plan template

Use this structure when rebuilding or substantially revising `plan.md`:

```markdown
# Delivery Plan

Status: Active

## Current objective

One sentence describing the outcome currently being pursued.

## Feature-complete means

- Observable end-to-end conditions.

## Critical path

| Seq. | Ticket | Outcome | Status | Owner | Depends on | Estimate |
|---:|---|---|---|---|---|---:|
| 1 | `T-NNN` | Result | Ready | Unassigned | — | 30m |

## Parallel work

| Track | Tickets | May begin when | Coordination point |
|---|---|---|---|
| Demo | T-NNN | Gate or ticket | Shared fixture or interface |

## Gates

### Gate A — Name

- Entry condition:
- Decision or evidence required:
- Exit condition:
- Fallback:

## Next action

Name the next executable ticket and why it is next.

## Stretch queue

Ordered P1/P2 tickets that must not delay feature completion.

## Active blockers

Record ticket, blocker, owner, next action, and fallback.
```
