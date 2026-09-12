# Agent Workflow
Status: Decided — 2026-09-12

1. Open the fictional client's existing body record with prepared assessment data.
2. Enter coach session mode, confirm capture agreement and start recording.
3. Capture audio plus timed region selections while Stephen explains findings.
4. Finish recording; transcribe server-side and retain transcript source spans.
5. Agent proposes observations against a small region allowlist, using the transcript, existing assessment and time-aligned selection context where available.
6. Validate region IDs, source references and numerical claims. Preserve uncertain findings as unplaced/review-needed.
7. Stephen reviews short proposed updates, correcting or removing any item. Confirm publishes the current revision to the client's body record.
8. Client sees new markers; Show update focuses the region and opens its evidence.
9. Client adds an observation at the selected region, previews it and saves it. The note remains a client report, not a diagnosis.

## Allowed agent actions
Propose annotation; focus region; retrieve source; prepare a region-bound observation. Only explicit confirmation publishes coach updates or saves client notes. Agent output cannot execute arbitrary viewer code.

## Evidence
Distinguish measurements, coach statements, generated explanation and client observations. Movement-test results map to broad joint regions, not assumed individual muscle injury. Preserve unknown laterality.

## States
Idle → recording → transcribing → extracting → review → confirmed.
Client updates: unread → opened. Editing a draft invalidates earlier confirmation.

## Reliability
Deduplicate by source event/session revision, not assessment alone: several sessions may update one assessment. Never overwrite old measurements with narrative notes. Keep exact source wording; compute asymmetry in code. Audio/model failure retains the session and offers retry or clearly labelled transcript input. Storage failure leaves the draft unsaved and visible.
