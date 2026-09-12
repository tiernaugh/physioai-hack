# PhysioAI Hackathon Project

Working repository for the **Agents, Everywhere: Bots, Channels, & More** global hackathon.

The repository is split into two areas:

- [`project-documents/`](project-documents/README.md) contains the brief, source material, ideation, concept definition, decisions, requirements, and pitch preparation.
- [`project-app/`](project-app/README.md) contains the running Vite/React prototype, assessment story, packaged anatomy and optional WhatsApp backend.

Agent instructions live in `AGENTS.md`. The accompanying `CLAUDE.md` files allow Claude Code to load the same instructions.

## Current direction

A client-facing body record that connects assessment findings, coach updates and client observations to relevant regions. The planned consultation flow is: record a coach explanation → extract sourced proposals → coach reviews and confirms → client explores updates and adds an observation.

Kingsley's existing prototype and Tiernan's consultation handoff are combined in this repository. The prototype already contains a fictional hamstring recovery/routine experience and a separate report-backed assessment story. Golf mockup source and images are retained but are not connected to navigation. These features remain available as exploratory work; the new consultation flow and Next.js/CopilotKit migration still require implementation and verification.

Run the existing app from the repository root:

```sh
cd project-app
npm install
npm run dev
```

Start with the [combined implementation status](project-documents/handoff/integration-status.md), [product brief](project-documents/handoff/prd.md), [demo script](project-documents/concept/08-demo-story.md) and [ticket plan](project-documents/tickets/plan.md).
