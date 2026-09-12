# PRD — Explorable Body Record
Version: 1.1
Status: Accepted scope; implementation verification pending
Date: 2026-09-12

## Problem and evidence
A consultation combines measurements, spoken explanation and pointing. Afterward, the client may struggle to reconnect a report with what the coach explained. The founder described this experience; one gym owner described assembling reports with Claude and sending them through WhatsApp/email. These motivate the product but do not establish market demand or clinical benefit.

Sources: [user research](../07-user-research.md), [latest team discussion](../transcripts/2026-09-12-session-and-body-record-discussion.md).

## Users and proposition
- Primary user: client revisiting their assessment and adding observations.
- Contributor: coach/physio recording and reviewing session explanations.
- Buyer hypothesis: a practice or gym includes the service in its offering.
- Proposition: keep explanations and evidence attached to the body regions they concern.

## Core journey
Open prepared client record → coach starts recording → speaks about findings, optionally selecting regions → Finish → transcription/extraction → coach reviews and confirms proposals → client sees updates, explores sources and saves an observation.

## UI specifications
Detailed screen/JTBD contract: [experience PRD](prd-experience.md). Expanded view and orientation contract: [viewer PRD](prd-body-viewer.md). Build on Vite/React and the current Node backend per [ADR-006](../adrs/006-build-on-vite-prototype.md).

## Requirements
| ID | Requirement | Acceptance evidence |
|---|---|---|
| PR-01 | Body is primary navigation | Select and focus at least two supported broad regions on the demo device |
| PR-02 | One app has session and client modes | Same record is visible in both; switching modes is explicitly demo-only |
| PR-03 | Capture is intentional | Start requires capture agreement; recording indicator, timer, Finish and Discard are visible |
| PR-04 | Short live voice note | Real recorded audio becomes visible transcript after Finish |
| PR-05 | Preserve pointing context | Timestamped selections are retained; no invented speech alignment |
| PR-06 | Source-backed extraction | Each proposed annotation resolves to report/transcript evidence and an allowed region, or is marked unplaced |
| PR-07 | Coach controls publication | Edit/remove/confirm actions; no draft appears as a confirmed client update |
| PR-08 | Revision-aware confirmation | Changes invalidate confirmation; only the reviewed revision is committed |
| PR-09 | Client discovers updates | New marker with author/date; Show update focuses the region and opens evidence |
| PR-10 | Distinguish evidence types | Measurement, coach statement, generated explanation and client observation are labelled |
| PR-11 | Client contributes | Exact text can be previewed, saved, edited and deleted at the selected region |
| PR-12 | Persistence and replay safety | Reload preserves confirmed records; replay duplicates nothing; later distinct sessions remain allowed |
| PR-13 | Recovery from failure | Failed recording/model/storage operations retain useful draft state and permit retry or labelled fallback |
| PR-14 | Repeatable demo | Explicit reset restores the fictional fixture without affecting unrelated browser data |
| PR-15 | Expanded body | Fill app viewport; preserve pose/selection; exit and Escape work |
| PR-16 | Predictable camera views | Front/Back/Left/Right and two isometric presets; smooth cancellable movement |
| PR-17 | Useful framing | Fit whole body and Focus selected; manual actions require no model |
| PR-18 | Body-first screen states | Overview, region detail, capture, review and confirmed record meet the experience PRD |
| PR-19 (P1) | Recorded history | Earlier snapshot with explicit date and return-to-latest; no interpolation |

## Interface priorities
Use Kingsley's calm green/cream visual treatment as inspiration. Give the body most of the workspace. Adjacent details show evidence, session review or selected-region notes. Start session records a consultation; it must not resemble the prototype's workout-start action.

## Agent behaviour
Use active assessment, allowed region map, transcript and selection context to propose annotations. Use a validated action bridge to expose semantic context and deliberate viewer actions. CopilotKit is conditional on a short integration check; the real model-to-record workflow is mandatory. Do not require a chatbox to navigate ordinary controls.

The model proposes mappings; deterministic code validates IDs/sources and computes numerical comparisons. Coach confirmation grants permission to publish the current draft. Save client wording exactly; no model rewrite is necessary to persist a note.

## Evidence rules
A joint movement test does not establish a particular injured muscle. Missing side remains unspecified. Selected anatomy alone is not evidence of a clinical finding. The reference body is not a client scan. The supplied report's monitoring thresholds are fixture-specific.

## Demo data
Fictional client with de-identified report values and optionally one labelled fictional historical entry. Use the script in [scope](../concept/06-scope-and-requirements.md). The live spoken observation is fictional too; no actual client data is required.

## P0 exclusions
Exercise planning/logging, golf technique analysis, body or recovery scores, tissue-healing simulation, trend analytics, hardware/WhatsApp integration, separate coach dashboard, multi-user access control, automatic prescriptions and diagnosis.

Recovery and performance are contextual stories, not additional implemented flows.

These exclusions apply to delivery of the consultation P0. Existing prototype recovery/routine features, the assessment story, optional WhatsApp integration and golf mockup source are retained in the combined repository; their presence does not satisfy or expand PR-01 through PR-18. See [combined implementation status](integration-status.md).

## Definition of done
PR-01 through PR-18 pass on the selected demo device. Demonstrate one real recording-to-confirmed-update cycle and one client observation surviving reload. Run twice, record actual latency and disclose all seeded elements. A transcript fallback is useful but does not count as proving PR-04.

## Open product checks
Can a client find the relevant explanation without instruction? Are source labels understandable? Is review fast enough for a coach? These are questions for rehearsal, not established benefits.

## Change control
Only expand P0 through an explicit decision with a time/scope tradeoff. [ADRs](../adrs/README.md) record architectural changes; [tickets](../tickets/plan.md) record execution.
