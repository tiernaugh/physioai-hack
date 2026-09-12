# AI Physio — version zero

**Native WhatsApp voice notes are now included, without CopilotKit or paid AI APIs.** Run `npm run build` then `npm run voice`, open http://127.0.0.1:3001 and select **WhatsApp notes**. The default local mode transcribes uploaded voice files with Whisper and parses text reports without API keys. See [WhatsApp setup](WHATSAPP-SETUP.md) for the live connection, storage and test boundaries. The original body/routine prototype described below remains fictional and browser-local; WhatsApp notes use a separate backend store.

A working React + TypeScript + Three.js prototype based on the project plan. The overview includes a six-month hamstring recovery visualization using a locally packaged BodyParts3D muscular atlas. All profile, observation, recovery, and routine data is fictional. No backend, account, API key, or runtime anatomy download is required.

This is the implementation of the repository's selected client-facing body-record concept. Product context, requirements, architecture, risks, and the demo story remain documented in [`../project-documents/concept/`](../project-documents/concept/README.md).

## Run locally

Use Node.js 22.13 or newer.

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
2. Open a routine exercise to inspect its sample dose, equipment, and associated region.
3. Start a session and mark individual sets. Add an optional discomfort score and note, then save. Unmarked sets remain uncompleted; an omitted score remains unrecorded.
4. Visit Session history, reload, and check the saved record.
5. Export the mock profile and session history to Markdown.
6. Open the companion and try “show my left hamstring”, “open my routine”, or “recap my progress”. The voice button plays through a simulated transcript; it never requests microphone access.

## Structure

- `src/App.tsx` — workspace, routine, profile, history, session dialog, and scripted companion.
- `src/BodyViewer.tsx` — BodyParts3D muscle rendering, left-hamstring isolation, recovery colour interpolation, month controls, raycasting, orbit controls, and WebGL fallback.
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
