# ADR-001 — Next.js Application
Status: Accepted
Date: 2026-09-12

## Context
The agreed agent flow is unbuilt. Kingsley's Vite app is exploration, not a framework commitment. The build needs a React body explorer and server-side provider endpoints.

## Decision
Use Next.js App Router and TypeScript with Node runtime. Mount the Three.js viewer through a browser-only client boundary. Keep provider credentials on the server. Pin compatible dependencies after the spike.

## Alternatives
Vite plus a separate Node service is viable, but adds process/proxy configuration. Keeping the exploration unchanged would not implement the selected flow.

## Consequences
A single app owns UI and agent endpoints. Browser APIs and localStorage must stay out of server rendering. Preserve the exploration in git and isolate it before replacing its shell.

## Validation
T-003 must render the viewer and serve one real provider-backed flow. No migration has been completed by accepting this ADR.
