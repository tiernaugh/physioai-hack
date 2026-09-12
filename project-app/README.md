# AI Physio — connected movement workspace

A React + TypeScript + Three.js prototype with four screens: **Today**, **Your progress**, **Activity**, and **Voice notes**. A separate **Body record** page contains the client consultation and muscle-progress prototype. The refreshed UI keeps the packaged 3D muscle atlas and exercise session storage. The older report-backed assessment and voice inbox code is retained behind the disabled `legacyViewsEnabled` flag in `src/App.tsx`.

## Body record UI walkthrough

**Progress:** switch from Notes to Progress, use the dated scrubber or Play/Replay to move from the neutral 31 August baseline to 7 September. Muscle colours reflect the authored symptom comparison; values snap to recorded dates. Select shoulder/elbow to update the floating callout and evidence panel. This does not add force or percentile data to Alex's record. Latest timeline changes are build-checked; interactive review is with the user.

The client record now starts with four dated shoulder/elbow consultation notes, two client observations and a 21 September follow-up agenda. This authored demo scenario is separate from the supplied Studio 22 report and contains no invented force measurements. Product-facing copy uses consultation language; the prototype banner identifies demo data. **Add consultation** opens coach mode within the client workspace. Processing remains simulated and the two-region limit is unchanged.

Run `npm run dev` and select **Body record** in the sidebar. No backend or API key is needed for this view.

1. Select the shoulder or elbow marker, or the matching region in the report panel.
2. Expand the body and use the cube view icons for Front/Back/Left/Right and the two three-quarter views. Hover or keyboard-focus controls for labels. Switch between Rotate and Pan for dragging; right-drag or two-finger touch also pans. Framing and zoom use icon buttons. Escape exits expanded mode; an open observation dialog closes first.
3. Select **Add consultation**, agree to the sample capture, then Start simulated recording → Finish. This does not access the microphone.
4. Preview sample processing → Show sample proposals. The failure preview retains the transcript for retry. Supplied text is not analysed; all proposals explicitly use the fictional sample source.
5. Edit, remove or relocate proposals, then confirm. Unplaced or empty notes cannot be confirmed.
6. Add an observation at a region; edit/delete it. Text is preserved exactly. Changes are in memory only and clear when you leave this screen or refresh.
7. Reset demo restores the baseline fixture and fits the body. It does not touch existing workout or voice-inbox storage.

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

For the optional voice backend, run `npm run voice` in a second terminal from `project-app/`. Vite proxies `/api/voice` to port 3001. Or run `npm run build` followed by `npm run voice` and open http://127.0.0.1:3001. Uploads and transcription are available on **Voice notes**. The default local mode uses local Whisper for audio and a basic parser for text without paid AI APIs. See [WhatsApp setup](WHATSAPP-SETUP.md).

## Workspace demo

1. **Today:** Start with the combined goals and anatomy hero: comfortable walks, confidence on stairs and a consistent routine alongside the interactive 3D body. The age-group card shows an explicitly labelled example: **Top 28% / 72nd percentile, ages 35–44**. **About this comparison** explains that Alex’s age and a population benchmark are unavailable, so this is not a real ranking or a conversion of the health score. Review the illustrative current health score and status below the hero. Drag the muscle atlas, switch front/back, zoom, toggle muscle highlighting, and choose a dated body snapshot. Historical snapshots change the body illustration and its dated callout; the summary above remains the current sample status.
2. Open any of **Today’s exercises** for its sample dose, equipment and movement illustration. **Start your session**, mark individual completed sets, optionally record discomfort and a note, then save. Today’s completed exercise count reflects recorded sets for the demo date.
3. **Your progress:** Review the illustrative health-score trend. Navigate the calendar and select a date to see its recorded activity. Appointment notes support completion and additional notes. **View appointment** selects the upcoming 17 September review.
4. **Activity:** Browse user check-ins, physio notes, scripted agent insights, saved sessions and eligible voice-note records. Filter by author, completion status or search. Choose **Agent** to see two expanded deep dives: **Your progress, beyond the discomfort score** (12 September) and **Understanding the session you cut short** (8 September). Each includes comparison metrics, an annotated 3D anatomy study, an assessment, uncertainties, review questions and expandable evidence. Select a numbered body pin or matching insight to highlight it; use **Posterior**, **Oblique** and reset to inspect the model. **Collapse analysis** condenses a review. **Add your context or a question** opens the existing attributed note form. **Add an update** creates a local check-in, appointment note or plan update, with an optional body region.
5. Switch **Viewing as** between Alex and Stephen to try the two demo perspectives. Either can mark items done, reopen them or add attributed notes. Reload to check persistence. Notes and completion on appointment entries stay consistent between Progress and Activity.
6. **Export record** downloads the existing profile/session export together with the shared activity log and notes. **About this demo** explains provenance and storage.

## Data and integration boundaries

The timeline is anchored to the hackathon demo date, **12 September 2026**. Newly saved events receive their actual timestamp. Alex’s identity, goals, health scores, appointments, recovery dates and agent insights are explicit sample data. Scores and muscle colours are illustrative, not measurements of tissue healing or a personal treatment plan. The separate supplied assessment retains its report attribution and labels its exercise examples.

The two deep dives are authored snapshots of the fictional source fixtures at their entry dates, not live analyses of edited/local logs. Their full text and anatomical insights are searchable and included in the Markdown record export. The 8 September review is timed after its source session and uses no later observations. Anatomical pins identify approximate discussion locations; amber identifies the routine’s hamstring focus. Both studies reuse the packaged atlas, share one cached download, load near the viewport, and render on interaction. If WebGL or the download fails, the written analysis remains available.

The model is the adult male BodyParts3D 4.0 reference anatomy, adapted through the MIT-licensed [Human Atlas](https://github.com/ashemag/human-atlas) project. It is not a personal scan. BodyParts3D is CC BY 4.0; source and adaptation notes remain in `public/models/muscle-atlas/ATTRIBUTION.md`. Today retains its original left-hamstring hit target. Voice notes uses 15 mapped reference regions, per-region highlighting and projected annotation pins. Ankle/knee pins locate a body region using associated reference musculature; they do not identify an injured muscle.

Session data keeps the existing `ai-physio:v0:sessions` localStorage key. Activity entries, attributed notes and completion use `ai-physio:v1:care-log`. Data is validated on load; unreadable records remain untouched, and failed writes do not claim success. Storage events refresh other open tabs, but simultaneous writes are not transactionally coordinated. Demo roles do not implement authentication, shared accounts or cross-device sync.

The optional voice integration uses its separate backend store. Activity reads voice records mapped to `demo-alex` or explicitly labelled `local-test` only, and displays inbox availability. It does not send WhatsApp messages or change backend clinical review state when an activity is marked done. Use **Voice notes** for uploads, transcription and annotation review; the previous inbox UI is retained but hidden. Other patient mappings are not merged into this fictional profile.

The previous free-form scripted chat has become contextual companion cards and attributed activity entries. The selected recorded-consultation workflow, Next.js migration and CopilotKit actions remain separate planned work; this refresh does not prove those requirements. See [implementation status](../project-documents/handoff/integration-status.md).

## Structure

- `src/App.tsx` — four-screen shell, goals hero, progress calendar, activity feed, exercise logging and dialogs.
- `src/refresh.css` — refreshed desktop/mobile layout, layered over the retained report and viewer styles.
- `src/today-hero.css` — combined goals/anatomy hero and illustrative age-comparison card; mobile places the body directly after the goals.
- `src/care-data.ts` — dated fixtures, activity contracts, validation, storage and session-to-activity mapping.
- `src/agent-analysis.ts`, `src/AgentDeepDive.tsx`, `src/agent-analysis.css` — authored case reviews, searchable/exportable analysis and responsive timeline presentation.
- `src/AnalysisAnatomy.tsx` — 3D studies with anatomy-anchored selectable insights and posterior/oblique views.
- `src/BodyViewer.tsx` — packaged muscle renderer with dated record, legacy timeline and source-linked annotation modes.
- `src/VoiceNotes.tsx`, `src/voice-annotations.ts`, `src/voice-notes.css` — audio upload, local transcription, source-backed region matching, review and 3D annotations.
- `src/AssessmentStory.tsx` — separate report-backed four-week story and measured strength table.
- `src/VoiceInbox.tsx` and `server/` — existing optional voice integration.
- `src/data.ts` — existing exercises, region IDs, session storage and Markdown export.
- `src/GolfSwing.tsx` — retained exploratory mockup, not mounted.

## Verification

All 33 automated tests and the production build pass. The new persistence tests cover both human authors, completion, corrupted data, invalid actors/regions/dates, partial-session import and blocked storage. Browser checks cover desktop/mobile layout, full 3D anatomy rendering, goals navigation, appointment selection, session completion appearing in Today and the calendar, attributed notes persisting after reload, and activity filters. The build retains the existing warning about the Three.js bundle size.


## Voice notes → musculature annotations

Open **Voice notes** in the sidebar, select or drop an audio file, optionally listen to it, then choose **Transcribe & map to body**. The existing local voice service transcribes the real file using Whisper. Explicit named regions become clickable annotations on the 3D musculature; selecting a pin or observation highlights the exact transcript excerpt. Progress states update automatically. Previously uploaded notes can be reopened after reload.

English matching uses conservative local rules rather than a hosted reasoning model. Missing sides, unsupported regions and corrections stay unplaced for review. Use the location dropdown to correct/place an observation, then **Confirm location**. This confirms the location only, not a diagnosis. The original wording, including negations, remains visible. Confirmations and corrections are saved under `ai-physio:v1:voice-annotations`, scoped to the source note. Read or write failures leave existing records intact.

Supported files include M4A, MP3, WAV, OGG/Opus, WebM, AAC and FLAC, up to 8 MiB and ten minutes. A rejected or failed upload keeps the file available; a saved failed record offers Retry. **Paste a transcript** uses the same record pipeline without audio; **Explore a sample** is an explicitly labelled transcript preview that does not claim to transcribe audio.

`npm run voice` now finds an existing model in either `project-app/models/ggml-base.en.bin` or the repository's `models/ggml-base.en.bin`. An explicit `WHISPER_MODEL_PATH` still takes precedence. If using the pre-merge voice records in the repository root, start the service from `project-app/` with:

```sh
VOICE_MODE=local VOICE_DATA_DIR=../data/voice-local npm run voice
```

The original admin/WhatsApp inbox code remains intact, with its entry points and modal disabled. The new page scopes records to the existing fictional profile and explicit local tests. It does not send external messages. Transcripts stay in the existing backend store; raw audio is discarded after successful transcription, and playback of the selected original file is available while it remains selected in the page.

Verification includes an actual synthetic spoken WAV uploaded through the UI and transcribed by local Whisper, producing three correctly sided body annotations; pin-to-excerpt selection; source-offset/decimal/negation/ambiguity tests; geometry coverage for every selectable region; and persisted manual mapping/confirmation checks.
