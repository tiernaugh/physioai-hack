# Selected Concept

Status: Decided — concept selected 2026-09-12

The locked direction is a client-facing body record with a small coach session mode. Stephen records an explanation, reviews agent-proposed region updates and confirms them; the client explores and adds observations. Next.js, vendored Human Atlas, CopilotKit and OpenAI are selected. Technical feasibility still needs the T-003 spike.

## Concept file map

The detailed acceptance contract is the [PRD](../handoff/prd.md). Architectural rationale lives in [ADRs](../adrs/README.md); proposed implementation interfaces are in [technical contracts](../handoff/technical-contracts.md). This folder remains the concise concept and pitch reference.

Current demo loop: existing body record → Start session → record → Finish → agent proposes regional updates → coach reviews/confirms → client explores → client adds an observation.

1. [`01-proposition.md`](01-proposition.md) — concise concept, problem, outcome, and non-goals.
2. [`02-users-and-environment.md`](02-users-and-environment.md) — target users, setting, jobs, relationships, and contextual advantage.
3. [`03-agent-workflow.md`](03-agent-workflow.md) — trigger, perception, reasoning, tools, action, state, and human control.
4. [`04-positioning.md`](04-positioning.md) — category, alternatives, differentiation, and “why here rather than ChatGPT.”
5. [`05-technical-architecture.md`](05-technical-architecture.md) — chosen stack, components, data flow, integration boundaries, and failure handling.
6. [`06-scope-and-requirements.md`](06-scope-and-requirements.md) — golden path, acceptance criteria, non-goals, and stretch scope.
7. [`07-risks-and-open-questions.md`](07-risks-and-open-questions.md) — product, technical, safety, demo, and evidence risks.
8. [`08-demo-story.md`](08-demo-story.md) — two-minute narrative, prepared data, operator steps, and fallback.

Keep these files compact. Their purpose is to keep product, engineering, and pitch decisions aligned during a short build.
