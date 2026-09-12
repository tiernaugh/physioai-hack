# Agent Workflow
Status: Decided

1. Client opens an existing fictional body record populated from a prepared assessment.
2. A labelled incoming-coach-note fixture triggers processing. The agent derives the region mapping from the note and existing assessment; the trigger must not hide a hardcoded target.
3. Agent proposes a source-backed mapping to an allowed region. Code validates region IDs, laterality and evidence references; unsupported mappings remain unplaced.
4. The application appends the note to the regional record and marks it unread: “Your coach added an update here.” Existing evidence remains intact.
5. Client chooses “Show update.” The application focuses that region, shows the explanation and source, and marks it read when opened. Client can continue exploring or stop navigation.
6. Client selects a region and adds a text observation.
7. Agent proposes a record entry using the selected location, current assessment and the client's exact words.
8. Client confirms; the application saves a dated, editable note at that region.

## Evidence contract
Each annotation contains region, side if known, assessment ID, source reference, content type and text. Content types distinguish measurement, coach statement, generated explanation and client observation.

Incoming updates also carry event ID, author, source timestamp and read/unread state. These are record updates, not claims that the client's measured condition has changed. Retain earlier measurements unchanged unless new measurement evidence arrives. Replaying an event ID must not duplicate an update.

An elbow-flexion test is movement-level evidence: it must not become a diagnosis of a particular muscle. Unspecified ankle laterality stays unspecified.

## Actions
Map finding, focus region, open source, draft observation and save confirmed observation. Navigation cannot silently save or send data.

## Calculations
If displayed, calculate asymmetry in code: abs(right-left)/max(right,left) × 100. The supplied elbow values yield 20.8%. Report thresholds are source-specific, not general standards.

## Failures
Missing evidence produces “No assessment information here.” Invalid model output cannot annotate arbitrary structures. Preserve exact client wording. Model failure allows retry without invented explanations. Reprocessing the same assessment must not duplicate notes.
