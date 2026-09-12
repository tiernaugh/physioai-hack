# Agent Workflow

Status: Draft

## Golden loop

```text
Environment changes
→ agent perceives relevant context
→ agent decides whether to intervene
→ agent reasons and/or calls a tool
→ agent proposes or takes an action
→ human steers or approves where appropriate
→ result returns to the environment
→ state is updated for the next event
```

## Trigger

Define the observable event that starts the workflow.

## Inputs and context

List data supplied by the environment, the user, prior state, and external tools. Mark which inputs are required, optional, sensitive, or demo fixtures.

## Reasoning and tools

Describe each meaningful decision or tool call. Keep deterministic transformations outside the model where practical.

## Agent actions

State exactly what the agent can create, update, send, display, or schedule.

## Human control points

Define preview, correction, approval, rejection, retry, and cancellation behaviour.

## State and continuity

Describe what persists and what future event will use it.

## Failure paths

Cover missing input, uncertain interpretation, tool failure, duplicate events, and denied approval where relevant.
