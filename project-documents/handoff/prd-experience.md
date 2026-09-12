# PRD — Body Record Screens
Version: 1.0
Status: Accepted UI scope; not implemented
Date: 2026-09-12

Complements the [product PRD](prd.md) and [viewer PRD](prd-body-viewer.md). Build inside Kingsley's existing Vite/React app. Preserve unrelated prototype screens.

## Jobs to be done
| View | Person | Job |
|---|---|---|
| My body | Client | Understand where things stand and what is new |
| Selected region | Client | Recover the relevant explanation and evidence |
| Coach note | Coach | Capture the explanation without manually tagging every finding |
| Review | Coach | Check meaning and location before adding it to the record |
| Add observation | Client | Save what I noticed at the place it happened |
| Earlier record (P1) | Client | Revisit what was recorded at a previous session |

## UI-01 — My body
Body occupies the main workspace. A side panel shows latest report summary and new updates. Header displays the assessment date and record update time separately; never label local data “synced” without an actual synchronization source.

A compact date strip shows recorded session dates. P0 may show the current session and dated context without historical switching. Clicking an update opens its region. Record coach note is distinct from any retained workout Start session action.

Markers indicate available information. They do not imply injury severity or measured recovery.

## UI-02 — Selected region
Selecting a body marker or list entry yields the same state: region title, measured values where available, source-backed coach explanation, author/date, source control and client observations.

Keep the body visible. Close returns to the overview panel. No assessment information is distinct from a normal finding. The same detail panel is used during guided navigation.

## UI-03 — Capture drawer
Open Record coach note beside the body. Client and coach identity are visible. Offer Record and Paste transcript; upload is P1 unless trivially reusable.

Before recording, require capture agreement. During recording show timer, recording indicator, Finish and Discard. Region selection remains usable; retain timestamps. Switching panel or expanding the viewer must not silently stop/discard recording.

Processing shows actual stages: recording received, transcribing, preparing proposals. Never show a completed stage before its response arrives.

## UI-04 — Review
Show proposed regional annotations alongside the body. Draft markers differ from confirmed markers by label/style, not colour alone.

Each item offers source words, edit, remove and region correction. Unplaced items prompt Choose a region. Required unresolved issues block confirmation. Confirm publishes the current reviewed revision and returns to the updated body record.

For the UI alignment checkpoint use explicitly labelled fixtures. No fixture-processing animation counts as live extraction.

## UI-05 — Client observation
Within region details, show selected location, date, text field and Cancel/Save. Client can change the location before saving. Save preserves exact text and shows it as a client observation, with edit/delete controls. No notification to the coach is implied.

## UI-06 — Earlier session (P1)
Reuse the same body/detail layout. Display “Viewing record from [date]” and Return to latest. Render information available as of that recorded snapshot, not a projection of biological state. No interpolation, forecasting or recovery percentage.

## Screen acceptance
- [ ] Overview → region details → close works through body and list selection.
- [ ] Capture → processing → review → confirmed updates is visually coherent.
- [ ] Draft, confirmed, client-authored and unavailable information are distinguishable.
- [ ] Dates describe assessment/record events accurately.
- [ ] Client observation preview/save/edit/delete stays attached to its location.
- [ ] Body expand and camera controls follow the viewer PRD.
- [ ] Error/empty/loading states remain usable; no silent data loss.
- [ ] Narrow screens stack panels without losing controls or causing horizontal overflow.

## Alignment checkpoint
Before substantial UI integration, Tiernan and Kingsley walk through the five primary states with a single fictional client and note. Approve layout and action labels, not merely colours. This checkpoint is ticket T-005; technical audit can run alongside it.
