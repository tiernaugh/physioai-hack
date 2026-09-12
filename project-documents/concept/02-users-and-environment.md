# Users and Environment
Status: Decided

## Primary user
A gym or physiotherapy client revisiting an assessment and trying to understand what was discussed. The coach supplies findings and interpretation; a separate coach UI is outside this build.

## Environment
A new client-facing body explorer used during or after the consultation. It is not an existing product already adopted by clients. The agent shares its selected region, active assessment, source material and saved observations.

Human Atlas is the interaction reference: https://github.com/ashemag/human-atlas
Its reference anatomy provides navigation; personal records provide personalization. Do not claim the geometry is a scan or a model of the client's actual anatomy.

## Triggers
A new coach note arrives while the client has an existing body record open. The agent uses the current assessment and note content to place a sourced update at the relevant region. The demo operator triggers a labelled incoming-note fixture; no live coach messaging integration is implied. “Show update” focuses that region. Region selection supplies context for explanation and client note capture.

## Human control
The client controls navigation, can stop the tour, inspect sources and preview/edit/delete their own note. Generated explanations stay distinct from coach-authored statements. No invented coach approval or clinical verification.

## Surrounding journeys
Baseline, focused hamstring assessment, shoulder assessment, knee reassessment and ankle review can be named as future product contexts. They are not implemented clinical protocols. Return-to-sport decisions remain with the practitioner.
