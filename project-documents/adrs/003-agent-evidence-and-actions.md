# ADR-003 — Evidence-Backed Proposals and Controlled Actions
Status: Accepted
Date: 2026-09-12

## Context
The agent must do real work in the body interface without inventing findings or losing source attribution.

## Decision
Use OpenAI transcription/structured extraction and CopilotKit for semantic context and frontend actions. Validate region IDs, laterality and evidence references in application code. Keep numerical calculation deterministic. Coach review confirms publication.

## Alternatives
A scripted companion cannot prove model-driven extraction. Unrestricted prose is hard to validate. Exposing all viewer state creates unnecessary noise; a simple extraction call followed only by hardcoded animation would not prove the intended UI integration.

## Consequences
Use one compatible CopilotKit SDK generation. Share region/assessment/evidence context, not camera frames or geometry. Allow unplaced findings. A valid enum value alone is not proof of a correct mapping. Note saving preserves client wording and does not need an extra model call.

## Validation
Demonstrate a real source-backed proposal and a real agent-driven focus action. Invalid source or mapping cannot be published as a supported fact.
