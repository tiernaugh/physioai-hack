# Technical Contracts
Status: Proposed implementation interfaces under the accepted architecture
Date: 2026-09-12

These are application-owned contracts, not claims about a vendor SDK. Refine them during T-006 and update the document before parallel implementation. The isolated UI prototype uses a smaller two-left-region fixture model; it does not yet implement this full contract.

## Ownership

Current runtime: Vite frontend and existing Node backend per ADR-006. Endpoint paths below are proposed app contracts to adapt to existing routes, not Next.js route-handler requirements. CopilotKit-specific wiring is conditional; semantic context and validated actions remain required.
Browser owns recording buffers, selected region, draft review and demo persistence.
Server owns provider calls and schema validation; credentials never enter browser bundles.
Viewer adapter owns atlas identifiers and camera targets.
Application reducer owns record transitions; model output cannot directly overwrite storage.

## Domain boundaries
Use distinct entities:
- Assessment: id, clientId, measuredAt, structured measurements, source documents.
- SessionEvent: id, assessmentId, authorId, recordedAt, revision, transcript and selection events.
- Proposal: sessionEventId, revision, annotations, unresolved issues, processing status.
- ConfirmedUpdate: proposal identity/revision, confirmedBy, confirmedAt and annotations.
- ClientObservation: id, assessmentId, region/side, exact text, createdAt, updatedAt.
- ReadState: confirmedUpdateId, openedAt.
- Store: schemaVersion and validated collections.

## Source and anatomy contract
Product RegionId is a small broad-region enum, initially shoulder/elbow with hip/ankle added only when verified. Keep side separate: left/right/bilateral/unspecified. One adapter maps region+side to atlas structures. Unspecified side must not default to left.

SourceRef is either a report section/row identifier or transcript character range with an optional time range. Character references must resolve to exact source text. A generated explanation can reference several sources.

Annotation contains id, assessmentId, sourceEventId, regionId or null, laterality, contentType, text, sourceRefs and reviewIssue or null. Measurements are structured facts associated with source rows; generated wording does not own their values.

ContentType: measurement, coach_statement, generated_explanation, client_observation.
Unknown/unsupported mapping: regionId null plus explicit reason, retained for review.

## Proposed server endpoints
| Endpoint | Input | Output and checks |
|---|---|---|
| POST /api/session/transcribe | Multipart audio, sessionEventId, recording MIME type | Transcript plus available timing; validate file type/size and provider result |
| POST /api/session/extract | Transcript, permitted assessment evidence, selection events, sessionEventId/revision | Validated proposal; reject missing/invalid source references |
| /api/copilotkit | Installed CopilotKit runtime contract | Uses server credentials; implementation follows the pinned SDK generation |

Publishing and client-note saving are local application actions for P0, not server endpoints or implied multi-user synchronization.

Suggested spike limits: 60-second recording maximum and 10 MB request cap, with a 20–30-second demo clip. Verify recorder MIME support and provider compatibility on the actual browser. Limits are proposed until tested.

## CopilotKit boundary
Expose semantic context: assessmentId, selected region/side, relevant confirmed annotations and current reviewed update. Do not transmit full mesh data or continuous camera movement.

Tools:
- focus_region(regionId, laterality): validate and invoke the viewer adapter.
- open_update(updateId): resolve an existing update and display its evidence.
- draft_observation(regionId, laterality, text): prepare preview only.

A model tool cannot bypass coach confirmation or save a client note silently. Do not add redundant model calls to ordinary deterministic UI actions. At least one genuine agent-to-viewer action must be demonstrated.

## Recording and time
Use one session-relative clock for selection events and recording intervals. If reliable transcript timing is unavailable, selection events are supporting context only. Do not use the last selected region for every statement. If pause/resume is added, its gaps need explicit timing representation; P0 can use Start/Finish/Discard only.

## State transitions
Idle → Recording → Transcribing → Extracting → Review → Confirmed.
Failures return a retryable error associated with the current event/revision.
Transcript/source edits increment revision and require regeneration or review.
Confirm checks expected revision and unresolved issues before a single store write.
An older provider response must not replace a newer draft.

Event deduplication key: sessionEventId + revision. AssessmentId alone cannot be the dedupe key because multiple updates belong to one assessment.

## Persistence
Use a new versioned namespace, e.g. physioai:body-record:v1. Do not overwrite Kingsley's existing prototype storage. Validate before load/save, retain an unsaved draft on quota/error, and scope reset to this app's fictional fixture. Store transcript and confirmed evidence as necessary; never store raw audio in localStorage.

No cross-device sync or transactional multi-tab guarantee is claimed. Audio buffers remain temporary for processing/retry and are released on completion/discard; avoid server audio/transcript logging.

## Failure checks
Denied microphone → explanation and labelled transcript fallback.
Geometry error → honest retry state, no hidden success.
Provider timeout → retain source and allow retry.
Invalid mapping → unplaced proposal.
Missing source → reject generated item.
Storage failure → no success toast and no discarded draft.
Repeated event → no duplicate; distinct session → valid append.
