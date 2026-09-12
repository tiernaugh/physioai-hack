# Handover — Body record, muscle progress and timeline

Updated: 2026-09-12
Status: Iterating with Tiernan; latest progress replay is build-checked, awaiting user feedback

## GitHub merge update
During commit/push, origin/main contained Kingsley's commits 69b5e2e and 4f3d85b. These were merged, preserving his refreshed Today / Your progress / Activity / Voice notes workspace and adding Body record as a separate navigation page. His new VoiceNotes, voice-annotations, AgentDeepDive and related code are now present: audit these before building new extraction capabilities, because the earlier capability inventory below predates them. Body record itself still uses its isolated simulated flow. The combined production build passes; no browser review was run for the merged shell. All prototype/docs changes are being committed and pushed in this sync.

## Immediate instructions for the next chat
- Continue in the existing app. Do not restart architecture or scaffold Next.js.
- Tight deadline: the user explicitly asked not to spend tokens repeatedly testing in a browser. Run a proportionate build check; let Tiernan report visual/interaction issues unless a targeted check is needed to resolve a concrete bug.
- Write concrete, useful UX copy. User rejected slogans such as “Where things stand” and “The conversation doesn’t have to end when you leave the room.”
- Do not repeat “fictional” throughout product content. One compact prototype/demo disclosure is used; actual processing remains explicitly simulated until implemented.
- Requirements first for new behaviour, then prototype changes. Do not add muscle isolation/explosion: the user explicitly deferred it.
- No delegation requested. Preserve Kingsley's files and all existing uncommitted work.

## Read first
Read applicable AGENTS.md files, then [screen PRD](prd-experience.md), [viewer PRD](prd-body-viewer.md), [product PRD](prd.md), [ticket plan](../tickets/plan.md), [ADR-006](../adrs/006-build-on-vite-prototype.md) and [technical contracts](technical-contracts.md).

Read [progress PRD](prd-progress-view.md) for the latest whole-muscle colouring and timeline requirements; this extends the original UI scope.

## Current direction
Build on Kingsley's existing Vite/React/TypeScript app and Node backend. Do not scaffold Next.js or replace the app. The client body record is primary; exercises, golf, hardware and a broad coach dashboard are outside this golden path.

The user authorised an isolated, roughly 90-minute UI walkthrough before real provider wiring. Implementation lives in project-app/src/body-record/, with a small sidebar integration in App.tsx. Other screens and the recovery viewer are preserved.

## Try the prototype
From project-app, run npm run dev and open the printed local URL. Choose **Body record**. The app README contains the complete walkthrough.

- Explore shoulder/elbow through atlas markers or the region list.
- Expand the viewer; visual cube icons replace written Front/Back/Iso buttons. Hover/focus tooltips explain orientations. Rotate/Pan modes, right-drag pan, zoom, Fit body and Focus selected work through the local camera adapter. Escape closes a nested observation dialog before exiting expansion.
- **Add consultation** opens coach mode within the client view. There are no separate accounts or permissions. It offers simulated recording and paste input. No microphone is accessed. Finish loads the authored sample transcript.
- Processing is a manual simulation checkpoint with failure/retry preview. Proposals come from the labelled sample transcript, not arbitrary pasted text.
- Review supports edit/remove/location correction. Empty or unplaced notes block confirmation.
- Confirmed notes and exact client observations remain in memory for this visit. Observation edit/delete and Reset demo work. No persistence or cross-device sync is claimed.

The reference atlas's left deltoid and anconeus bounds anchor broad shoulder/elbow markers. This does not identify injured muscles. All consultation fixtures are fictional with no fabricated strength values; the real assessment story remains separate.

## Latest content and progress experience
- Client view starts with four dated coach notes (7 September), two client observations (9/10 September), and a 21 September review agenda. Scenario: left shoulder discomfort with overhead reaching; left elbow stiffness after desk work. Source excerpts are visible.
- Notes / Progress switches share the same viewer and preserve pose/selection. Opening Add consultation switches back to Notes.
- Progress uses two authored self-reported check-ins: 31 August and 7 September. Shoulder discomfort 5 → 3 /10; elbow stiffness 2 → 2 /10. These are demo observations, not data from the Studio 22 report.
- User explicitly wanted **actual muscles coloured**, not soft regional heat patches or just coloured markers. Geometry is coloured by complete atlas mesh IDs, preserving anatomical boundaries.
- Green: improved; amber: unchanged; red: worsened; neutral: no comparison. Do not default the whole body to green or invent an overall health score.
- Shoulder display group: left deltoid parts FJ1467M, FJ1468M, FJ1513M. Elbow display group: left brachialis FJ1486M and brachioradialis FJ1487M. These are authored visual mappings of regional records, not diagnoses or muscle-specific measurements.
- A two-stop timeline beneath the viewer supports scrub/click dates and Play/Pause/Replay. Replay starts at the neutral baseline, waits 2.2 seconds, then advances to 7 September. Numeric values snap to recorded dates; whole-muscle colours animate. Reduced motion skips the fade.
- A floating callout shows the selected region's change (shoulder by default). The simplified panel shows one region, large before/after values, region buttons and expandable evidence/muscle mapping.
- Latest timeline implementation has NOT received browser verification or user acceptance. Do not imply playback is a real model-driven narrative or clinical recovery simulation.

## Code map
- `project-app/src/body-record/BodyRecord.tsx`: feature state, Notes/Progress switch, capture/review, observations, replay state and floating callout.
- `RecordViewer.tsx`: local atlas loader, merged geometry, per-mesh vertex colours, camera/pan/presets, marker overlays. No new dependency or model download source added.
- `ProgressPanel.tsx`: dated symptom comparisons and sources.
- `ProgressTimeline.tsx`: scrubber, date buttons and playback UI.
- `model.ts`: two-region types, seed content, progress records and mesh mapping.
- `body-record.css`: scoped feature styling.
- `project-app/src/App.tsx`: small Body record sidebar/mount integration. Existing default overview and other screens preserved.

The full feature directory is currently untracked. Include it if committing; tracked-file diff alone omits it.

## Force generation and percentiles
Tiernan is interested in force, left/right balance and percentile overlays from VALD ForceFrame. Discussed as future separate overlays; not implemented. The supplied report has real values (e.g. elbow flexion R 82.0 N, L 103.5 N, 20.8% asymmetry, Monitor), but belongs to a separate de-identified assessment story. Do not silently attach it to Alex or turn movement-test results into isolated-muscle force readings. No actual percentile values or comparison cohort were supplied; do not fabricate them. Requirements should define Symptoms / Strength / Balance separately if this work resumes.

## Verification
Latest `npm run build` and whitespace check pass. Earlier in this session, all 20 existing tests passed (backend tests need localhost binding). Earlier Chrome checks passed two-region selection, pan, camera buttons, expansion, simulated recording/finish, failure/retry, review/edit/publish, exact observations/edit/delete, nested Escape, reset and mobile overflow. These checks predate the latest progress/timeline changes.

Whole-muscle colours were visually confirmed in a screenshot. However, subsequent automated progress marker clicks intermittently timed out reporting that the canvas intercepted the pointer. A z-index/isolation CSS adjustment was added, but the follow-up check was interrupted/inconclusive. The user has successfully shown a selected elbow progress panel. Treat marker hit-target behaviour as an unresolved verification issue, not a proven blocker; fix if reported/reproduced. Do not spend the deadline on repeated blind browser runs.

Timeline/callout layout, playback and mobile/expanded fit remain for user review. Build emits the existing large Three.js chunk warning. No live agent acceptance has passed.

## Next
1. Get Tiernan's feedback on Progress → Replay, muscle colouring and layout; make targeted fixes. T-005 remains In progress; no formal complete sign-off recorded.
2. T-006: finalize region/side, source and event contracts against code. Prototype types only represent the two left-side fixtures; they are not the complete extraction schema.
3. Connect real extraction, recording/transcription, reviewed publication and persistence through T-007–T-012. Replace fixture processing explicitly; model output cannot bypass confirmation.
4. Prove source-backed annotations and a real agent viewer action before widening scope.

Highest-value functional gap: real note → proposed locations → coach confirmation → new body markers. Current extraction is fixed and only shoulder/elbow are supported. Intended future contract allows one note attached to multiple locations, with broad regions retained when source wording is broad. It is not built. Current notes/observations clear on leaving Body record or refresh; persistence is also pending.

No commit or push was requested for this UI pass. Check git status before integrating; earlier documentation work is also local.
