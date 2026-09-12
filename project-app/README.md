# AI Physio — version zero

**Native WhatsApp voice notes are now included, without CopilotKit or paid AI APIs.** Run `npm run build` then `npm run voice`, open http://127.0.0.1:3001 and select **WhatsApp notes**. The default local mode transcribes uploaded voice files with Whisper and parses text reports without API keys. See [WhatsApp setup](WHATSAPP-SETUP.md) for the live connection, storage and test boundaries. The original body/routine prototype described below remains fictional and browser-local; WhatsApp notes use a separate backend store.

A working React + TypeScript + Three.js prototype based on the project plan. The overview preserves the original six-month fictional hamstring recovery story using a locally packaged BodyParts3D muscular atlas. A separate Assessment story presents the de-identified Studio 22 report as a four-week narrative, including the measured strength table, ankle-related musculature and clearly labelled exercise examples. No backend, account, API key, or runtime anatomy download is required.

This is the existing Vite prototype in the combined repository. Build on Vite under ADR-006; no Next.js migration is planned. The Body record walkthrough implements the consultation UI with simulated processing. Real recording/extraction and agent actions remain pending. See the [combined implementation status](../project-documents/handoff/integration-status.md) and [selected concept](../project-documents/concept/README.md).

## Body record UI walkthrough

**Progress:** switch from Notes to Progress, use the dated scrubber or Play/Replay to move from the neutral 31 August baseline to 7 September. Muscle colours reflect the authored symptom comparison; values snap to recorded dates. Select shoulder/elbow to update the floating callout and evidence panel. This does not add force or percentile data to Alex's record. Latest timeline changes are build-checked; interactive review is with the user.

The client record now starts with four dated shoulder/elbow consultation notes, two client observations and a 21 September follow-up agenda. This authored demo scenario is separate from the supplied Studio 22 report and contains no invented force measurements. Product-facing copy uses consultation language; the prototype banner identifies demo data. **Add consultation** opens coach mode within the client workspace. Processing remains simulated and the two-region limit is unchanged.

Run `npm run dev` and select **Body record** in the sidebar. No backend or API key is needed for this view.

1. Select the shoulder or elbow marker, or the matching region in the report panel.
2. Expand the body and use the cube view icons for Front/Back/Left/Right and the two three-quarter views. Hover or keyboard-focus controls for labels. Switch between Rotate and Pan for dragging; right-drag or two-finger touch also pans. Framing and zoom use icon buttons. Escape exits expanded mode; an open observation dialog closes first.
3. Select **Record coach note**, agree to the sample capture, then Start simulated recording → Finish. This does not access the microphone.
4. Preview sample processing → Show sample proposals. The failure preview retains the transcript for retry. Supplied text is not analysed; all proposals explicitly use the fictional sample source.
5. Edit, remove or relocate proposals, then confirm. Unplaced or empty notes cannot be confirmed.
6. Add an observation at a region; edit/delete it. Text is preserved exactly. Changes are in memory only and clear when you leave this screen or refresh.
7. Reset demo restores the baseline fixture and fits the body. It does not touch existing workout or voice-inbox storage.

Feature-owned code is in `src/body-record/`. Its viewer reuses the packaged anatomy and adapts the existing renderer without changing the recovery viewer. Broad-region markers are anchored to atlas landmarks, not claims of injured muscles. The fixture contains no measured strength values. Historical navigation, real providers and persistence are follow-up work.

## Run locally

Use Node.js 22.13 or newer. Run the following commands from `project-app/` (`cd project-app` first if you are at the repository root).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The development server binds to `127.0.0.1`.

```sh
npm test       # Data validation, corruption handling, and Markdown export
npm run build # TypeScript check and production assets in dist/
npm run preview
```

## Try it

1. Drag the muscle atlas to rotate it and move the month slider from injury to recovery. The left hamstring changes from high-intensity red through amber to green, while each month shows an illustrative exercise pair. Left/right always refer to the model's own side.
2. Open **Assessment story** and move from the baseline through week four. Review the report-backed ankle plan, associated musculature, illustrative exercise examples and complete strength table.
3. Open a routine exercise to inspect its sample dose, equipment, and associated region.
4. Start a session and mark individual sets. Add an optional discomfort score and note, then save. Unmarked sets remain uncompleted; an omitted score remains unrecorded.
5. Visit Session history, reload, and check the saved record.
6. Export the mock profile and session history to Markdown.
7. Open the companion and try “show my left hamstring”, “open my routine”, or “recap my progress”. The voice button plays through a simulated transcript; it never requests microphone access.

## Structure

- `src/App.tsx` — workspace, routine, profile, history, session dialog, and scripted companion.
- `src/BodyViewer.tsx` — BodyParts3D muscle rendering, left-hamstring isolation, recovery colour interpolation, month controls, raycasting, orbit controls, and WebGL fallback.
- `src/AssessmentStory.tsx` — separate report-backed four-week story, strength measurements, anatomy associations and labelled exercise examples.
- `src/GolfSwing.tsx` and `public/images/golf-swing/` — retained illustrative golf mockup and images; not currently mounted in the app.
- `scripts/extract-muscle-atlas.mjs` — reproducibly extracts and repacks the muscular layer from a pinned Human Atlas checkout.
- `public/models/muscle-atlas/` — compressed browser geometry, catalogue, and required source attribution.
- `src/data.ts` — typed mock fixtures, stable region IDs, validation, browser storage, and Markdown serialization.
- `src/styles.css` — desktop and mobile layouts.
- `tests/data.test.mjs` — five data-integrity tests using Node's test runner.

## Version zero boundaries

The model uses the adult male BodyParts3D 4.0 reference anatomy, adapted through the MIT-licensed [Human Atlas](https://github.com/ashemag/human-atlas) project. BodyParts3D is CC BY 4.0; the required attribution and adaptation notes are in `public/models/muscle-atlas/ATTRIBUTION.md`. It does not represent every body or anatomical variation and is not a personal scan. Recovery colours, percentages, dates, exercises, doses, and progression are illustrative—not a diagnosis, biological measurement, treatment plan, or claim that tissue healing follows this schedule. Restrictions are explicitly unknown.

Session entries persist only in this browser under `ai-physio:v0:sessions`; there is no sync or patient-record service. The Markdown download is an export, not a canonical writable record. Existing stored data is validated before loading and before appending; a storage failure leaves the unsaved session open. Simultaneous saves across tabs are not transactionally coordinated.

The companion is a deterministic local demonstration. Live AI, voice capture, MCP, clinical reasoning, and real patient data are not connected. Google Fonts is used for typography with local system-font fallbacks. No profile or session contents are sent to a service.

## Verification

The automated data and voice-pipeline tests and production build pass. Browser checks cover the atlas load, red and green recovery endpoints, month-specific exercise changes, front/back controls, region selection, exercise details, independent set logging, omitted discomfort, persistence after reload, and mobile layout without horizontal overflow.
