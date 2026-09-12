# Movement workspace and voice annotations

Status: Implemented prototype refresh — 2026-09-12
Source: Kingsley's UI-refresh request and subsequent request for a goals hero.

The initial UI refresh was clarified to **three screens**. A subsequent explicit request adds **Voice notes** as a fourth screen. Keep the calm green/cream design and the working 3D musculature.

1. **Today:** A goals hero leads with the current movement goals, followed by health score/status, a 3D muscle body with dated snapshots and daily exercises. Clicking an exercise opens details; completed sets feed the daily summary and activity log.
2. **Your progress:** An illustrative score trend, navigable monthly calendar, appointment notes and upcoming review. Selecting a day surfaces recorded activity. Appointment notes support the same attributed completion and note actions as Activity.
3. **Activity:** One chronological feed of user, physio and agent entries with visible provenance. Two authored agent notes expand into deep dives: a 12 September progress review and an 8 September shortened-session review. Each connects comparison metrics, three selectable annotations on reference 3D anatomy, an evidence-based assessment, uncertainties, questions for Stephen and source excerpts. The notes open expanded in Activity and collapsed in compact calendar cards. Humans can add updates, mark items done/reopen them and add notes, including directly from a deep dive. Author/status filters and full-analysis search make the shared record inspectable; Markdown export includes the full analysis and annotation text.

The goals shown are assumed examples for the existing fictional Alex profile: comfortable walks, confidence on stairs and a consistent routine. They are not extracted from the supplied assessment. Health scores, appointments, body snapshots and agent insights remain sample fixtures. Only user-entered updates, notes, completion and exercise sets reflect current interactions.

4. **Voice notes:** Upload a real audio file, transcribe locally with the existing Whisper service, and inspect source-linked annotations on the reference musculature. Selecting a pin selects its exact transcript excerpt. Ambiguous locations stay unplaced; humans can choose/correct and confirm a location. Original wording remains visible. These are locally indexed observations rather than diagnoses or autonomous treatment updates.

Voice transcripts persist in the existing backend. Region corrections and confirmations are browser-local and scoped to each note; all automatic matches initially require review. An explicit sample preview demonstrates the annotations without pretending to transcribe audio. The original backend review state remains separate from annotation-location confirmation.

Only Today, Your progress, Activity and Voice notes are visible. The existing assessment and voice inbox components and modal code are preserved behind a disabled `legacyViewsEnabled` flag, with no visible entry points. Activity’s voice shortcut opens the new Voice notes page. Optional voice data is read from the existing backend for the fictional profile and explicit local tests; local activity completion does not imply clinical approval or backend review.

This updates the current Vite prototype's information architecture. It does not implement the separate recorded-consultation P0 or revise its technical acceptance evidence. User and physio are demo roles; shared activity persists in one browser, with no authenticated multi-user service. The detailed setup and demo contract is in [the application README](../../project-app/README.md).
