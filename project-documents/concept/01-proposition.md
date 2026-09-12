# Locked Product Brief
Status: Decided — 2026-09-12
Implementation status: not yet validated

## Proposition
A client-facing body record that connects assessment measurements, coach explanations and client observations to the relevant places on a 3D reference body.

Client benefit: understand and revisit what was discussed, and see the record develop over time.
Buyer hypothesis: a gym, coach or physiotherapy practice provides it as part of its service. This is a hypothesis from the team discussion, not validated willingness to pay.

## Golden path
Stephen opens a client record → starts a session recording → explains findings while optionally selecting regions → finishes → agent transcribes, extracts and proposes sourced region updates → Stephen reviews and confirms → client explores the new annotations and adds an observation in place.

## Scope decision
The client explorer remains the primary experience. Coach session mode is a small capture/review flow in the same app, not a separate dashboard. The incoming update now comes from this session; a prepared transcript is the labelled fallback.

## Surrounding stories
Recovery and performance are two lenses on the same record. A past hamstring episode or golf goal may be seeded context. Neither creates a second working product flow. A simple dated list makes continuity visible; analytics and workout planning are outside P0.

## Language
“Digital twin” is team shorthand for the vision. Describe the demo as a personal body record on reference anatomy. Geometry is not a scan, and colours must not imply measured tissue healing. Do not invent a body score or recovery percentage.

## Success
A real recording produces real, source-backed annotations after coach review; the client can inspect and contribute to the same record. The existing prototype is exploratory reference, not an implementation specification.
