# AI Physio — connected movement workspace

A React + TypeScript + Three.js prototype with two screens: **Today** and **Your progress**. Progress combines the strength graph, calendar and activity feed. Voice notes are created in a modal from Today. The **Today hero** embeds the client body record: selectable anatomy, consultation notes, observations and muscle-progress replay. **Open record** or a region marker expands that same record without leaving Today. The refreshed UI keeps the packaged 3D muscle atlas and exercise session storage. The older report-backed assessment and voice inbox code is retained behind the disabled `legacyViewsEnabled` flag in `src/App.tsx`.

## Body record UI walkthrough

**Progress:** switch from Notes to Progress, use the dated scrubber or Play/Replay to move from the neutral 31 August baseline to 7 September. Muscle colours reflect the authored symptom comparison; values snap to recorded dates. Select shoulder/elbow to update the floating callout and evidence panel. This does not add force or percentile data to Alex's record. The hero and expanded workspace share the selected view, check-in, notes and observations during the current visit.

The client record now starts with four dated shoulder/elbow consultation notes, two client observations and a 21 September follow-up agenda. This authored demo scenario is separate from the supplied Studio 22 report and contains no invented force measurements. Product-facing copy uses consultation language; the prototype banner identifies demo data. **Add consultation** opens coach mode within the client workspace. Processing remains simulated and the two-region limit is unchanged.

Run `npm run dev` and open **Today**. Use **Notes / Progress** on the hero body, select a shoulder/elbow marker or a region shortcut, or select **Open record**. Existing `#body-record` links open the expanded record on Today. No backend or API key is needed for this view.

1. Select the shoulder or elbow marker in the hero to expand the body and its regional record. The region shortcuts also work if the 3D model is unavailable.
2. Use **Open record** for the full workspace and the cube view icons for Front/Back/Left/Right and the two three-quarter views. Hover or keyboard-focus controls for labels. Switch between Rotate and Pan for dragging; right-drag or two-finger touch also pans. Framing and zoom use icon buttons. Escape exits expanded mode; an open observation dialog closes first. Closing the workspace returns to the hero with the whole body framed and your notes, observations and progress selection retained.
3. Select **Add consultation**, agree to the sample capture, then Start simulated recording → Finish. This does not access the microphone.
4. Preview sample processing → Show sample proposals. The failure preview retains the transcript for retry. Supplied text is not analysed; all proposals explicitly use the fictional sample source.
5. Edit, remove or relocate proposals, then confirm. Unplaced or empty notes cannot be confirmed.
6. Add an observation at a region; edit/delete it. Text is preserved exactly. Changes are in memory only and clear when you leave Today or refresh; expanding and collapsing the body does not clear them.
7. The reset icon in the expanded record restores the baseline fixture and fits the body. It does not touch existing workout or voice-inbox storage.

Feature-owned code is in `src/body-record/`. Its viewer reuses the packaged anatomy and adapts the existing renderer without changing the recovery viewer. Broad-region markers are anchored to atlas landmarks, not claims of injured muscles. The fixture contains no measured strength values. Historical navigation, real providers and persistence are follow-up work.

## Run locally

Use Node.js 22.13 or newer. From `project-app/`:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173).

```sh
npm test       # Data, activity persistence, anatomy and voice-pipeline tests
npm run build  # TypeScript check and production assets in dist/
npm run preview
```

For the optional voice backend, run `npm run voice` in a second terminal from `project-app/`. Vite proxies `/api/voice` to port 3001. Or run `npm run build` followed by `npm run voice` and open http://127.0.0.1:3001. Microphone recording, uploads and transcription are available through **Today → Add a voice note** or its floating plus button. Recording and playback work without the backend; transcription needs the service. Local mode uses local Whisper for audio and a basic parser for text. With an OpenAI key configured on the server, each new transcript also receives automatic contextual analysis; see below. See [WhatsApp setup](WHATSAPP-SETUP.md).

## Workspace demo

1. **Today:** Choose **Add a voice note** in the header or the floating plus to record or upload audio, listen back and save. Saving opens Activity with the new entry while transcription continues. Start with the combined goals and anatomy hero: comfortable walks, confidence on stairs and a consistent routine alongside the interactive 3D body. The age-group card shows an explicitly labelled example: **Top 28% / 72nd percentile, ages 35–44**. **About this comparison** explains that Alex’s age and a population benchmark are unavailable, so this is not a real ranking or a conversion of the health score. Review the illustrative current health score and status below the hero. Drag the muscle atlas, switch front/back and zoom. Toggle **Notes / Progress** to inspect the imported shoulder/elbow record and replay its two dated check-ins. Select a marker to read the source notes or add an observation in the expanded record. These consultation fixtures are separate from the sample hamstring status and health score below the hero.
2. Open any of **Today’s exercises** for its sample dose, equipment and movement illustration. **Start your session**, mark individual completed sets, optionally record discomfort and a note, then save. Today’s completed exercise count reflects recorded sets for the demo date.
3. **Your progress:** Switch between **Strength progress** and **Overall progress**. Both are explicitly illustrative scores. Every activity, voice note, agent update and saved comment appears on the tracker graph. Numbered labels show the original title or a transcript/comment excerpt. Select any label to read the original text, move the calendar to its month and show its activity. Open voice note opens the saved transcript directly; View full activity focuses its exact feed entry. The graph uses elapsed calendar time across all record and score dates, with separate dated tracks for voice notes, user activity, physio notes and agent updates. Same-day records stack individually; the graph remains complete when calendar or feed filters change. Scores stop at their final snapshot without extrapolating into newer activity. On mobile, swipe within the graph to reach later dates. The strength example is not a force measurement or a result from the separate report.
4. **Your activity & calendar:** The feed sits beside the calendar and initially shows September 2026. Select a day to see every associated session, note and appointment. Previous/next month changes the month’s activity; **All dates** opens the complete record. **View appointment** selects the upcoming 17 September review. Author/status filters and search (including saved comments) work within the chosen date range. Deep dives start collapsed here; **Read full analysis** opens their existing evidence and anatomy. Saved voice notes remain accessible. Old `#activity` links open this combined view, and saving a voice note opens the complete activity feed so the new entry is visible.
5. Switch **Viewing as** between Alex and Stephen to try the two demo perspectives. Either can mark items done, reopen them or add attributed notes. Reload to check persistence. Notes and completion on appointment entries stay consistent between Progress and Activity.
6. In **Activity**, **Download my record** downloads the existing profile/session export together with the shared activity log and notes. **About this demo** explains provenance and storage.

## Data and integration boundaries

The timeline is anchored to the hackathon demo date, **12 September 2026**. Newly saved events receive their actual timestamp. Alex’s identity, goals, health scores, appointments, recovery dates and agent insights are explicit sample data. Scores and muscle colours are illustrative, not measurements of tissue healing or a personal treatment plan. The separate supplied assessment retains its report attribution and labels its exercise examples.

The two deep dives are authored snapshots of the fictional source fixtures at their entry dates, not live analyses of edited/local logs. Their full text and anatomical insights are searchable and included in the Markdown record export. The 8 September review is timed after its source session and uses no later observations. Anatomical pins identify approximate discussion locations; amber identifies the routine’s hamstring focus. Both studies reuse the packaged atlas, share one cached download, load near the viewport, and render on interaction. If WebGL or the download fails, the written analysis remains available.

The model is the adult male BodyParts3D 4.0 reference anatomy, adapted through the MIT-licensed [Human Atlas](https://github.com/ashemag/human-atlas) project. It is not a personal scan. BodyParts3D is CC BY 4.0; source and adaptation notes remain in `public/models/muscle-atlas/ATTRIBUTION.md`. Today uses the imported body record’s shoulder and elbow landmarks and authored progress muscle groups. The earlier hamstring viewer remains available in the source. Voice note creation does not expose anatomy or manual annotation controls. Annotation handling belongs to the agent and is outside this change.

Session data keeps the existing `ai-physio:v0:sessions` localStorage key. Activity entries, attributed notes and completion use `ai-physio:v1:care-log`. Data is validated on load; unreadable records remain untouched, and failed writes do not claim success. Storage events refresh other open tabs, but simultaneous writes are not transactionally coordinated. Demo roles do not implement authentication, shared accounts or cross-device sync.

The optional voice integration uses its separate backend store. Activity reads voice records mapped to `demo-alex` or explicitly labelled `local-test` only, and displays voice-service availability. It does not send WhatsApp messages or change backend clinical review state when an activity is marked done. Use **Today → Add a voice note** for recording and uploads; the previous inbox UI is retained but hidden. Other patient mappings are not merged into this fictional profile.

The previous free-form scripted chat has become contextual companion cards and attributed activity entries. The selected recorded-consultation workflow, Next.js migration and CopilotKit actions remain separate planned work; this refresh does not prove those requirements. See [implementation status](../project-documents/handoff/integration-status.md).

## Structure

- `src/App.tsx` — two-screen shell, goals hero, integrated calendar/activity, exercise logging and dialogs.
- `src/ProgressOverview.tsx`, `src/progress.css` — strength/health trend, all source-linked activity and comment annotations, shared date selection and responsive combined progress layout.
- `src/progress-timeline.ts` — complete activity/comment projection, calendar range and collision-free note positioning.
- `src/refresh.css` — refreshed desktop/mobile layout, layered over the retained report and viewer styles.
- `src/today-hero.css` — combined goals/anatomy hero and illustrative age-comparison card; mobile places the body directly after the goals.
- `src/care-data.ts` — dated fixtures, activity contracts, validation, storage and session-to-activity mapping.
- `src/agent-analysis.ts`, `src/AgentDeepDive.tsx`, `src/agent-analysis.css` — authored case reviews, searchable/exportable analysis and responsive timeline presentation.
- `src/AnalysisAnatomy.tsx` — 3D studies with anatomy-anchored selectable insights and posterior/oblique views.
- `src/BodyViewer.tsx` — packaged muscle renderer with dated record, legacy timeline and source-linked annotation modes.
- `src/VoiceNotes.tsx`, `src/voice-recording.ts`, `src/voice-notes.css` — voice-note modal opened from Today for creation and Activity for saved transcripts, microphone capture, audio upload, playback, transcription and saved transcript display.
- `src/voice-annotations.ts` — retained annotation helpers; not invoked by note creation.
- `src/AssessmentStory.tsx` — separate report-backed four-week story and measured strength table.
- `src/VoiceInbox.tsx` and `server/` — existing optional voice integration.
- `src/data.ts` — existing exercises, region IDs, session storage and Markdown export.
- `src/GolfSwing.tsx` — retained exploratory mockup, not mounted.

## Verification

All 56 automated tests and the production build pass. Persistence tests cover both human authors, completion, corrupted data, invalid actors/regions/dates, partial-session import and blocked storage. Recording tests cover final audio chunks, format selection, permission failures, cancellation, resource cleanup, microphone disconnection and duration/size limits. Browser checks cover desktop/mobile layout, full 3D anatomy rendering, goals navigation, appointment selection, session completion appearing in Today and the calendar, attributed notes persisting after reload, and activity filters. The build retains the existing warning about the Three.js bundle size.


## Voice notes from Today

Open **Today → Add a voice note**, or the floating **+** at the bottom right of Today. Tap the microphone, speak, then choose **Stop & review**. Listen back and choose **Add voice note**. The modal closes as soon as the backend accepts the note and opens Activity. The note appears immediately, and its transcript updates automatically while the existing local Whisper service processes it. Choose **View voice note** to read a saved transcript or retry a failed transcription or analysis. Existing `#voice-notes` links open the composer over Today.

You can also upload an audio file. **More options → Use a transcript instead** preserves the existing text fallback. Supported audio includes M4A, MP3, WAV, OGG/Opus, WebM, AAC and FLAC, up to 8 MiB and ten minutes. Failed uploads retain the selected file in the open modal. Creation has no title/type/body-region form, annotation preview, location correction or confirmation step. Agent annotation work is deferred.

Microphone access requires localhost or HTTPS and a browser with `getUserMedia` and `MediaRecorder`. The existing recorder selects a supported WebM/Opus, MP4/M4A or OGG format, stops near the size/duration limits and releases the microphone on stop, cancel or modal dismissal. Captured audio is temporary until submitted. Closing the modal discards an unsaved draft; cancelling a replacement recording preserves the previously selected audio. Denied access, unsupported recording and empty captures show actionable errors, with upload available as an alternative.

`npm run voice` now finds an existing model in either `project-app/models/ggml-base.en.bin` or the repository's `models/ggml-base.en.bin`. An explicit `WHISPER_MODEL_PATH` still takes precedence. If using the pre-merge voice records in the repository root, start the service from `project-app/` with:

```sh
VOICE_MODE=local VOICE_DATA_DIR=../data/voice-local npm run voice
```

The original admin/WhatsApp inbox code remains intact, with its entry points and modal disabled. Notes stay scoped to the fictional profile and explicit local tests. Creating a note sends no external messages and does not approve a clinical record. Transcripts use the existing backend store; raw audio is discarded after successful transcription, and playback is available for the selected file before submission.

Verification: all 56 automated tests and the production build pass. Browser checks of this modal cover opening from the floating plus, selecting a synthetic spoken WAV, playable audio preview, saving and closing, the new pending note appearing in Activity, automatic transcript refresh, reopening the transcript, mobile layout, Escape dismissal and old voice-page links. Microphone resource cleanup and recording limits remain covered by the existing recorder tests. Physical microphone/device checks remain a demo-device step.


## Automatic contextual voice-note analysis

The app runs locally. Audio transcription runs offline through Whisper; contextual reasoning runs through the OpenAI Responses API and requires internet access. There is no on-device language model for contextual reasoning. The basic offline parser only extracts simple reported fields.

In `project-app/.env` (ignored by git), configure:

```dotenv
VOICE_MODE=local
VOICE_ANALYSIS_PROVIDER=openai
OPENAI_API_KEY=your-key-here
OPENAI_ANALYSIS_MODEL=gpt-5-mini
# Use this if your existing notes are in the repository root:
VOICE_DATA_DIR=../data/voice-local
```

Run `npm run voice` from `project-app/`, plus `npm run dev` in another terminal. Restart the voice process after changing its code or environment. Never prefix the key with `VITE_`; it belongs only on the server. Set `VOICE_ANALYSIS_PROVIDER=off` for offline transcription and basic parsing. The composer discloses whether OpenAI analysis is enabled.

1. In **Today → Add a voice note**, record or upload audio, listen back, and save. The transcript fallback follows the same analysis pipeline.
2. Activity immediately shows the saved voice note and an Agent entry. After local transcription, the server automatically compares the new transcript with earlier voice notes in the same patient store and the human-authored Activity notes, comments and session reports supplied at capture time.
3. **Your voice note, in context** shows the generated summary, source-backed comparisons, uncertainties and questions for review. Expand **View source note** to inspect the exact earlier text. The analysis also appears when reopening the voice note, under the **Agent** filter, in search and in **Download my record**.
4. Failed analysis keeps the transcript and offers **Retry analysis**. An older saved note without analysis offers **Analyse note**; it uses earlier server voice notes, since older captures have no saved browser-context snapshot. Notes are never backfilled with model calls just because the key is added.

The server retains a bounded evidence snapshot (up to 40 earlier notes / 60,000 characters; each earlier source up to 6,000 characters). It excludes future-dated sources, other patients and previous agent interpretations. Browser context is accepted only for the explicitly local fictional workspace, never for a WhatsApp patient. Sample sources remain labelled; a banner identifies analyses that include fictional history. Body-record consultation state is separate and is not included in this Activity context.

Transcripts and selected prior note text are sent to OpenAI with `store: false`; raw audio remains local and is discarded once transcription is saved. The server validates structured output and cited source IDs, stores provenance, processes notes in order per patient, deduplicates concurrent requests and resumes interrupted work. Analysis has separate pending/analysing/completed/failed states, so provider failure cannot erase a successful transcript. Analysis does not publish body annotations, approve a clinical record or change the routine.

Verification: 56 automated tests pass, including patient/time scoping, concurrent audio ordering, model errors, frozen evidence on retry, invalid output/references, asynchronous upload/retry, and Activity context/projection. Production TypeScript/build checks pass with the existing Three.js bundle warning. A real OpenAI request returned a validated comparison from a synthetic current/prior note pair. Browser verification passed with a synthetic spoken WAV through local Whisper and OpenAI, automatic Activity updates, the Agent filter, the saved-note view and expandable source text; physical microphone/device coverage remains as documented above.

API references: [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini).

## Integrated progress verification — 12 September 2026

The integrated view keeps the existing local activity/session stores and voice backend. Three additional authored sample check-ins/reviews fill the earlier graph dates. Strength values are display-only indices (38 → 69 / 100), independent of the illustrative health score (48 → 78 / 100); neither is derived from real notes or the supplied assessment. Calendar-only dates keep their named day across time zones; timestamped activity uses the viewer’s local calendar day.

Verification: production build and all 61 current tests pass, including calendar-day timezone coverage. Browser checks pass at desktop and 390 px phone width: graph/metric selection, date and month mapping, upcoming appointments, session counts, empty dates, comment-form access, search reset and legacy Activity links. The page has no horizontal overflow; the mobile graph scrolls within its own panel. The existing Three.js chunk-size warning remains.


## Shared progress and voice-note analysis UI — 2026-09-12

Voice-note reviews now render through the same `AgentDeepDive` component as the authored progress/session reviews. Both use the same header, expand/collapse control, three summary cards, interactive anatomy panel, numbered observations, reasoning, uncertainty, review questions and evidence drawer. The saved-note modal uses the same component and expands to accommodate it. Existing saved analyses gain this view immediately, without another API request.

The anatomy panel indexes explicit locations in the current transcript and displays the exact source wording beside numbered pins. Selecting a pin or observation focuses the relevant region; Front, Back, Oblique and Reset work in both review types. Amber reference muscles and a location ring show the named area, not injury severity or a clinical finding. Source text retains negation and plans. Unknown sides, corrections and unsupported locations remain unplaced with their wording visible; no location is borrowed from older notes or invented by the UI.

Supported reference locations include the existing hamstrings, calves, shoulders, hips, knees, ankles, chest, core and lower back, plus sided wrists/elbows and neck. Geometry associations and anchors come from the packaged atlas. Voice summary cards show counts of located areas, earlier notes and review questions; they do not invent strength or pain measurements. Sample and generated provenance remain distinct. Supporting-note excerpts are available under each generated comparison and in the evidence drawer.

Verification: all 61 current tests pass, including four new anatomy/context tests covering explicit sides, ambiguous/corrected wording, all supported atlas locations, source preservation and no invented clinical metrics. Browser checks cover the shared layout, a real saved note, selected hamstring/calf/wrist locations, camera changes, source wording, and neutral anatomy for an unclear side. The production build passes with the existing Three.js chunk-size warning.

## Every note on the tracker graph — correction, 12 September 2026

Progress and Activity stay merged. The previous five-example graph list has been replaced with every entry in the current record: user/physio notes, sessions, voice transcripts (including processing/failed states), agent updates and saved comments. Comments use their own timestamp and link back to their parent activity, which is also available on that comment date in the calendar. New records extend the graph’s date range; they never create or extrapolate a score. Sources remain sample, local or WhatsApp as recorded. Notes at the same or nearby dates get separate labelled positions, with no truncation of the record list. The graph has its own horizontal scroll area on mobile. Calendar/feed filters do not remove graph annotations.

Verification: production build and all 66 current tests pass. Browser review confirms 23 graph labels for all 23 feed entries, including 7 voice notes, with no overlapping labels. Selecting a voice label selects its calendar date, opens its saved-note dialog, and focuses the exact feed entry through View full activity. Automated coverage also checks pending notes/analyses, comments on later dates, records beyond the score range, duplicate imports and 30 coincident voice records.
