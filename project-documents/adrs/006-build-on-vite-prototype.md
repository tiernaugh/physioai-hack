# ADR-006 — Build on Kingsley's Existing App
Status: Accepted
Date: 2026-09-12
Supersedes: ADR-001; amends ADR-002/003 implementation strategy

## Context
The user explicitly chose to build on Kingsley's version under time pressure and align the UI first. A framework migration would consume time without proving the core agent workflow.

## Decision
Keep Vite/React/TypeScript, Three.js and the existing Node backend. Reuse compatible UI, capture and persistence components. Extend the viewer behind a small selection/focus/preset adapter. Import upstream anatomy code only where needed, with attribution; no wholesale replacement prerequisite.

Retain real transcription and source-backed model extraction as required behaviours. Prefer the working transcription path after audit; verify provider readiness rather than assuming local Whisper exists. Server-side OpenAI remains an extraction option. CopilotKit is conditional on a short integration check; a validated application action bridge is acceptable if it preserves the real agent loop.

## Consequences
No Next.js migration or new production-app folder. Preserve unrelated prototype work. New consultation records remain distinct from workout storage. The specialized viewer still requires multi-region support; reuse does not mean that capability exists.

## Validation
Prove a real transcript-to-annotation update and two selectable/focusable regions early. Build the agreed UI states first with labelled fixtures, then replace fixture boundaries with real processing. ADR-002's attribution and region separation principles remain; ADR-003's evidence and human-control rules remain.
