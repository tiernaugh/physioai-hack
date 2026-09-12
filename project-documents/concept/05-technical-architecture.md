# Locked Technical Stack
Status: Decided — 2026-09-12
Validation: integration spike still required; decisions below are not claims of working capability

## Decisions

See [ADRs](../adrs/README.md) for rationale and alternatives, and [technical contracts](../handoff/technical-contracts.md) for proposed implementation interfaces.
| Layer | Choice | Purpose |
|---|---|---|
| Application | Existing Vite/React/TypeScript and Node backend | Build on Kingsley's app; no framework migration |
| Viewer | Extend current Three.js viewer behind an adapter; reuse upstream helpers as needed | Two-region selection, presets, focus and expanded mode |
| Agent/UI | Validated application action bridge; CopilotKit conditional on quick integration | Share semantic context and expose focus/review actions |
| Model | OpenAI transcription and structured extraction | Recorded session → transcript → source-backed region proposals |
| Capture | Browser MediaRecorder plus timed region-selection events | Record in-session; process on Finish |
| Storage | Versioned localStorage for demo records and notes | Reload persistence without accounts/backend database |
| Hosting | Localhost on the presentation laptop | Serve packaged anatomy locally |
| Scope | One fictional client, one recording, few allowed regions | Repeatable end-to-end demonstration |

Human Atlas reference: https://github.com/ashemag/human-atlas
Next.js client loading: https://nextjs.org/docs/app/guides/lazy-loading
CopilotKit runtime: https://docs.copilotkit.ai/strands/copilot-runtime

The viewer remains browser-rendered in Vite. ADR-006 supersedes the earlier Next.js mounting strategy. Verify current CopilotKit imports/package compatibility before scaffolding; do not mix older proposal examples with newer APIs. Final model identifiers remain configuration choices after access verification.

## Preserve exploratory work
Kingsley's Vite prototype remains useful visual reference. Its muscle viewer directly selects the left hamstring, not all required broad regions. Build on it directly; do not treat its recovery percentages, routine UI or WhatsApp backend as P0 requirements.

If upstream renderer/types/helpers or assets are imported, record their commit, with MIT code notice and CC BY 4.0 data attribution. Keep vendored code separate from product components. The upstream inspection callback is an integration seam, not proof of our CopilotKit integration.

## Adapter and state
Product region IDs are stable broad-region identifiers independent of atlas IDs. A hand-authored adapter maps them to one or more anatomical structures and camera targets. The model selects from the product allowlist; it never invents mesh IDs.

Share selected region, assessment, relevant annotations and session context with the agent. Keep orbit/camera animation local. Expose deliberate validated actions such as focus_region; do not stream every camera frame into model context.

## Record contract
- SourceEvent: id, assessmentId, author, recordedAt, revision, transcript, timestamped selection events.
- Annotation: id, assessmentId, sourceEventId, regionId or null, laterality (left/right/bilateral/unspecified), contentType, exact source references, text, createdAt.
- Measurement payload: structured readings/unit; derived asymmetry calculated by code.
- Review metadata: proposed/confirmed, confirmed revision and coach attribution.
- Client metadata: unread/read state; notes retain exact user text, region and date.
- Store: schemaVersion plus collections; validate on load/save.

Each source reference resolves to an actual report location or transcript span. If transcription timing is unavailable, do not pretend to align individual words to a selection; show that uncertainty for review.

## Privacy and failure boundaries
Server-held keys; no raw audio in git or localStorage. Audio exists only for session processing/retry and is discarded on completion/discard; implementation must define bounded request sizes and avoid audio logging. Demo uses fictional information. Browser mode switch is not access control.

Handle denied microphone access, unsupported recording formats, missing geometry, malformed model outputs and storage failures explicitly. Prepared transcript fallback preserves the mapping demonstration but is disclosed as fallback.

## Verification gates
1. Extend the existing viewer and select/focus at least two relevant regions; verify expanded view and presets.
2. Record and transcribe a short clip on the actual demo device.
3. Produce supported annotations, review them and trigger one real CopilotKit viewer action.
4. Confirm updates and client notes survive reload; replayed event does not duplicate them.
5. Measure cold and warm localhost load, parsing/GPU performance and model latency.

Venue Wi-Fi does not carry localhost geometry on the same laptop. A phone accessing that laptop is a separate network/device test. No payload figure substitutes for measurement.

## Excluded services
No Auth0, Trigger.dev, Exa, Ambiguous or WhatsApp integration in P0. Finish-session processing runs directly through the app; background infrastructure is unnecessary for this bounded demo.


## Implemented voice-note context analysis — 2026-09-12

The existing Today voice-note flow now uses local Whisper, then optional server-side OpenAI Responses structured analysis. New notes trigger processing automatically. Earlier patient voice transcripts and a capture-time snapshot of human Activity notes/session reports provide context; generated interpretations and future entries are excluded. Bounded source snapshots and model provenance are retained in the existing backend note store. Activity and the saved-note modal render the analysis, source comparisons, uncertainties and review questions. A failed model call keeps the transcript and allows analysis-only retry. This does not implement the separate coach-session region proposals, body annotations or CopilotKit actions described above. The local parser is not a contextual LLM; full offline reasoning remains unimplemented.


## Shared analysis presentation and anatomy — 2026-09-12

Progress/session reviews and generated voice-note reviews share `AgentDeepDive` and `AnalysisAnatomy`. A presentation adapter converts saved note analysis into that contract. It indexes explicit current-transcript locations, attaches exact source wording, and resolves allowlisted body areas to the packaged atlas's reference geometry and bounds. Selection focuses the camera and updates a numbered locator; both review types expose Front/Back/Oblique views. Unknown sides stay unplaced. This display layer introduces no provider call, stored clinical measurement, body-record publication or inferred injury. Existing saved analyses use it immediately.
