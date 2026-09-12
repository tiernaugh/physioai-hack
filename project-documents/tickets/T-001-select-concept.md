# T-001 — Select the hackathon concept

- **Status:** Done
- **Priority:** P0
- **Owner:** Codex (documenting the team's selection)
- **Estimate:** 30 minutes
- **Depends on:** None
- **Blocks:** T-002, T-003
- **Concept links:** [`../03-idea-exploration.md`](../03-idea-exploration.md), [`../04-idea-scorecard.md`](../04-idea-scorecard.md), [`../07-user-research.md`](../07-user-research.md), [`../concept/`](../concept/README.md)

## Outcome

Select one concept with a specific user, environment, natural trigger, contextual advantage, controlled agent action, and memorable demo result.

## Why this matters

Implementation choices cannot be judged or scoped coherently until the team chooses the environmental relationship the demo must prove.

## In scope

- Generate and challenge a small set of credible candidates.
- Use the gym-owner interview and supplied assessment report as evidence, while separating stated needs from inferred opportunities.
- Score finalists against all four judging criteria based on today's buildable version.
- Identify the smallest end-to-end workflow and fatal concern for each finalist.
- Select one concept and populate the concept proposition plus users-and-environment files.
- Record the decision and rejected finalist rationale.

## Out of scope

- Framework selection.
- Application scaffolding.
- Detailed visual design.
- Full market analysis.

## Acceptance criteria

- [x] One primary user and one concrete environment are named.
- [x] A natural trigger and context available in the environment are specified.
- [x] The agent's action and human-control point are observable.
- [x] The “why here instead of ChatGPT?” answer is concrete.
- [x] The smallest build and memorable demo moment fit the remaining time.
- [x] Finalists are scored and the selection is recorded in the decision log.
- [x] `../concept/01-proposition.md` and `../concept/02-users-and-environment.md` reflect the decision.

## Implementation notes

The team revised the selection to the client-facing body explorer. Current concept documents and the decision log supersede the assessment-room direction. Contextual advantage and integration reliability still require T-002 and T-003 validation.

## Validation

- Review the selected concept against the explicit questions in `../03-idea-exploration.md`.
- Run the custom-GPT test and articulate what disappears outside the chosen environment.

## Completion record

- **Completed:** 2026-09-12
- **Result:** Accepted brief captured across the concept documents.
- **Evidence:** User requested capture of the proposed brief; concept files answer the selection questions; alternatives and provisional scores are retained in the scorecard; decision recorded.
- **Deviations/follow-ups:** Feasibility is estimated, not proven. Validate through T-002/T-003 before build lock.
