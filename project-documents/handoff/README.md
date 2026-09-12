# PhysioAI — Build and Review Handoff
Status: Ready for review
Prepared: 2026-09-12
Audience: Stephen and the implementation team

## Read in this order
1. [PRD](prd.md): users, golden path, requirements and acceptance criteria.
2. [Selected stack](../concept/05-technical-architecture.md): chosen technologies and verification gates.
3. [Technical contracts](technical-contracts.md): data boundaries, state, endpoints and viewer integration.
4. [Architecture decisions](../adrs/README.md): rationale, alternatives and consequences.
5. [Review checklist](review-checklist.md): what to challenge before implementation.
6. [Work plan](../tickets/plan.md) and [reuse/contract audit](../tickets/T-006-audit-reuse-and-contract.md).

For a new agent chat, start with the [prototyping handover](next-agent-prototyping.md).

## Brief
A client explores a 3D body record containing assessment evidence and coach explanations. A coach records a short session note inside the app, the agent proposes sourced region annotations, and the coach confirms them. The client explores those updates and adds an observation at the selected location.

## Current repository reality
The combined Vite prototype includes muscle visualization, fictional recovery/routine screens, a report-backed Assessment story, an optional WhatsApp backend and a scripted companion. Golf mockup source and images are retained but not mounted in navigation. See [combined implementation status](integration-status.md) for the boundary between existing features and the planned consultation flow. The consultation agent loop remains pending. Build on this Vite app under ADR-006; preserve existing work.

## What is decided
Client-first body navigation; one coach capture/review mode; recording processed after Finish; Vite/React with the existing Node backend, an extended viewer adapter, real model extraction and localStorage; one fictional client; localhost demo.

Detailed UI acceptance: [screen PRD](prd-experience.md) and [viewer PRD](prd-body-viewer.md). CopilotKit is conditional; no framework migration is planned.

## What is not proven
Exact package/model versions, multi-region viewer integration, recording format, transcript timing, live agent actions, payload performance and full-loop reliability. T-006 through T-012 must supply evidence. No production authentication or clinical validation is claimed.

## Document ownership
The PRD is the detailed product acceptance contract. Concept files supply concise product context and the pitch. ADRs own architectural rationale. Technical contracts are proposed implementation interfaces until verified by the spike. Tickets own execution order and completion evidence.

When a decision changes, supersede its ADR, update the PRD/contracts where affected and note it in the decision log. Do not silently reinterpret exploratory transcripts as requirements.
