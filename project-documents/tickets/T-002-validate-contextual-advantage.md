# T-002 — Validate the contextual advantage

- **Status:** Ready
- **Priority:** P0
- **Owner:** Unassigned
- **Estimate:** 20 minutes
- **Depends on:** T-001
- **Blocks:** T-004
- **Concept links:** [`../concept/02-users-and-environment.md`](../concept/02-users-and-environment.md), [`../concept/03-agent-workflow.md`](../concept/03-agent-workflow.md), [`../concept/04-positioning.md`](../concept/04-positioning.md)

## Outcome

Demonstrate that the selected environment supplies context, timing, identity, relationships, continuity, or action that materially changes the agent workflow.

## Why this matters

This is the central hackathon-theme claim and the main defence against building a generic chatbot in another wrapper.

## In scope

- Compare the embedded workflow with the equivalent standalone-chat workflow.
- Identify context obtained without manual restatement.
- Specify the natural trigger and the action that returns to the environment.
- Define what the user sees and controls at the intervention point.
- Revise or reject the concept if the environmental advantage is convenience alone.

## Out of scope

- Production user research.
- Broad competitive analysis.
- Technical implementation of the integration.

## Acceptance criteria

- [ ] An incoming coach-note event updates an existing regional record without the client restating its assessment context.

- [ ] A before/after comparison names the additional steps required in standalone chat.
- [ ] At least one material input is available because the agent inhabits the environment.
- [ ] The trigger occurs naturally during existing behaviour.
- [ ] The agent can return or take a meaningful action in the same environment.
- [ ] The human-control model fits the moment and consequence.
- [ ] The claim is reflected consistently across the relevant concept files.

## Implementation notes

Current concept: client body explorer. Demonstrate that region selection and assessment state inform the agent, and that its action updates the same visual record. A new 3D interface alone does not establish theme alignment. Use `../concept/08-demo-story.md` to test the narrative.

Convenience can support the value proposition, but should not be its entire basis. Stronger advantages include continuity across time, shared participants, real-world timing, direct action, multimodal observation, and scoped authority.

## Validation

- Explain the embedded and standalone versions in 20 seconds each.
- Ask what product value disappears when environmental context and actions are removed.

## Completion record

- **Completed:** Pending
- **Result:** Pending
- **Evidence:** Pending
- **Deviations/follow-ups:** None
