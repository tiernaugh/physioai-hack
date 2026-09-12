# PRD — Muscle progress view

Date: 2026-09-12
Status: Accepted direction; prototype implementation in progress

## Outcome
The client switches from Notes to Progress and sees actual muscle shapes coloured according to a dated comparison. Colour follows each mesh's anatomical boundary, never a soft patch painted around a marker.

## Requirements
- Notes and Progress share the viewer. Switching preserves pose, selected region and saved-in-memory notes.
- Progress colours every vertex of each mapped muscle mesh consistently. Unmapped meshes remain neutral. No spatial-radius shading, gradients across adjacent anatomy, whole-body green default or aggregate health score.
- Green means improved, amber unchanged, red worsened. Neutral means no comparison. Text labels and source details accompany colour.
- Selecting a marker or progress card opens the same dated evidence: activity, previous/current values, source type and source wording.
- These examples compare self-reported symptoms on 31 August and 7 September, not measured muscle strength or tissue healing. Lower scores indicate improvement for these particular scales.
- Keep author-selected anatomical display groups explicit. Regional symptoms do not establish which muscle is injured; the prototype must not claim that the agent inferred a diagnosis or muscle-specific measurement.
- Progress details name the muscles used to display the regional record. Notes mode restores the neutral anatomy.
- Camera rotation, pan, focus, expansion and reduced-motion behaviour remain intact. Switching views must not reload geometry.

## Prototype mapping
The authored demo uses these atlas display groups; these are visualization mappings, not clinical findings:

| Record | Meshes coloured | Atlas IDs | Comparison |
|---|---|---|---|
| Left shoulder | All three parts of left deltoid | FJ1467M, FJ1468M, FJ1513M | Overhead-reaching discomfort 5 → 3 / 10; green |
| Left elbow | Left brachialis and brachioradialis | FJ1486M, FJ1487M | Desk-related stiffness 2 → 2 / 10; amber |

The supplied Studio 22 report is separate; none of these scores come from it.

## Acceptance
- [ ] Shoulder colour fills complete deltoid meshes with sharp boundaries.
- [ ] Elbow display group fills complete brachialis/brachioradialis meshes.
- [ ] Adjacent muscles and the opposite side remain neutral.
- [ ] Notes restores neutral colours; switching preserves camera and selection.
- [ ] Both progress cards show dates, values, source comments and anatomical display-group names.
- [ ] Desktop and narrow layouts remain usable; production build passes.

## Deferred
Muscle isolation/explosion, new-region extraction, live provider integration and clinical interpretation. These are not part of this visual correction.

## Timeline and replay — 2026-09-12 refinement
- Add a two-stop scrubber for the actual authored check-ins: 31 August baseline and 7 September consultation.
- Play/Replay begins at baseline and advances after a short hold; Pause and manual date selection stop playback.
- Baseline is neutral because there is no earlier comparison. Whole-muscle colour fades into the recorded change at the second date; numeric values snap to records and are never interpolated into invented measurements.
- A floating callout summarises the selected region (shoulder by default). The evidence panel shows one region with a prominent before/after value and expandable sources, avoiding repeated cards.
- Notes/Progress switches retain camera and selection. Reduced motion skips colour transitions.
- Force generation and percentile overlays are not implemented in this pass. Supplied force data belongs to the separate assessment report; no reference-population percentiles are available.

Implementation: scrubber, playback, whole-muscle transition, callout and simplified evidence panel added. Production build passes. Browser review deferred to the user under the deadline; do not treat this as completed visual acceptance.
