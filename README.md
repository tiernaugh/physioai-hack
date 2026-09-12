# PhysioAI Hackathon Project

Working repository for the **Agents, Everywhere: Bots, Channels, & More** global hackathon.

The repository is split into two areas:

- [`project-documents/`](project-documents/README.md) contains the brief, source material, ideation, concept definition, decisions, requirements, and pitch preparation.
- [`project-app/`](project-app/README.md) contains the running Vite/React prototype, assessment story, packaged anatomy and optional WhatsApp backend.

Agent instructions live in `AGENTS.md`. The accompanying `CLAUDE.md` files allow Claude Code to load the same instructions.

## Current direction

A client-facing body record that connects assessment findings, coach updates and client observations to relevant regions. The planned consultation flow is: record a coach explanation → extract sourced proposals → coach reviews and confirms → client explores updates and adds an observation.

Kingsley's existing prototype and Tiernan's consultation handoff are combined in this repository. The prototype already contains a fictional hamstring recovery/routine experience and a separate report-backed assessment story. Golf mockup source and images are retained but are not connected to navigation. These features remain available as exploratory work. The consultation flow is built on the Vite app (ADR-006); no framework migration is planned. See the [handover](project-documents/handoff/next-agent-prototyping.md) for exactly what is live, simulated and pending.

Run the existing app from the repository root:

```sh
cd project-app
npm install
npm run dev
```

## What was built today

Everything in this repository was created on 12 September 2026 during the hackathon. First commit 11:59; the application, body record feature, consultation flow and all documentation followed through the day (see `git log`). Reused building blocks: the Human Atlas renderer and BodyParts3D anatomy (MIT / CC BY 4.0, see `project-app/public/models/muscle-atlas/ATTRIBUTION.md`), React, Three.js, Vite and standard libraries. The de-identified strength report is a real example supplied by a coach interviewed today.

## Demo

Two-minute video: link added at submission.

Start with the [combined implementation status](project-documents/handoff/integration-status.md), [product brief](project-documents/handoff/prd.md), [demo script](project-documents/concept/08-demo-story.md) and [ticket plan](project-documents/tickets/plan.md).
