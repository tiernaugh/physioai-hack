# Combined implementation status

Date: 2026-09-12
Scope: merge the existing prototype work with the recorded-session handoff.

UI update, 2026-09-12: the Vite prototype now has four screens (Today, Your progress, Activity, Voice notes), a goals hero, dated muscle snapshots, calendar/appointment notes and a browser-local attributed activity log. These are the only visible pages; the previous assessment and voice inbox code is retained behind a disabled flag, without visible entry points. Thirty-three automated tests pass, including activity persistence and source-linked voice annotation checks. The fourth screen uses real local Whisper transcription and conservative client-side region indexing; a synthetic audio upload has been verified end to end. See [workspace UI](../concept/09-workspace-ui.md).

The repository combines Kingsley's application work with Tiernan's accepted consultation brief. Existing app features are preserved. The brief describes the target workflow; merging its documents does not implement it or change the runtime framework.

| Area | Current repository | Relationship to the consultation brief |
|---|---|---|
| Application | Vite, React, TypeScript and Three.js | Vite is now the accepted base under ADR-006; no framework migration |
| Body exploration | Packaged muscle atlas and fictional hamstring recovery visualization | Reuse assets/design; broad-region selection and agent focus require the integration spike |
| Assessment story | Navigable four-week story with report measurements and labelled examples | Reuse evidence presentation without treating example exercises as report prescriptions |
| Golf story | Mockup component and three images, not mounted in navigation | Preserve exploratory source; no live motion-analysis capability is implemented |
| Routine and history | Fictional exercise logging with browser persistence | Existing prototype functionality retained; outside consultation P0 acceptance |
| WhatsApp | Separate optional Node backend and voice-inbox UI | Existing integration retained; it does not implement in-app coach recording/review |
| Consultation | Isolated Body record UI in src/body-record, mounted in existing navigation | Two-region viewer, expanded camera controls, simulated capture/review/confirmation, in-memory client observations implemented; live extraction and persistence pending |
| Agent | Scripted prototype companion | Real CopilotKit actions and OpenAI session extraction remain unverified |

## Integration boundaries

- Preserve the prototype while carrying its green/cream visual design and report presentation into the consultation flow.
- P0 exclusions in the PRD limit new consultation delivery; they are not instructions to delete existing recovery, routine, golf or WhatsApp work.
- The current workout session action and future consultation recording action have different meanings. They must be labelled distinctly when implemented together.
- Keep the new consultation storage namespace separate from existing workout records and the WhatsApp backend store, as specified in the technical contracts.
- Keep report values, fictional history and illustrative imagery distinguishable. The golf component is a mockup, and its tracking percentages do not represent measured analysis.

## Verification at merge

The existing 20 automated tests and TypeScript/production build pass. These cover the current data, anatomy asset and voice-backend behavior; they do not prove consultation acceptance criteria or the unmounted golf UI. Browser interaction checks for the new assessment story remain separate from these automated results.

## Next implementation gate

Review the T-005 UI with Tiernan/Kingsley, then follow T-006 through T-012 for the real recording-to-reviewed-annotation flow, agent viewer action and persistence/replay behavior. The UI uses shoulder/elbow atlas landmarks; this is not proof of model-driven selection or live capture.

## UI verification — 2026-09-12

Production build and all 20 existing tests pass. A local headless Chrome walkthrough passed region selection, camera buttons, expansion/exit, simulated recording through expansion, processing failure/retry, unresolved-location confirmation blocking, editing and publishing, exact observation text/edit/delete, nested Escape, reset and narrow-screen overflow checks. Desktop and mobile screenshots inspected. Human UI agreement and real-device performance remain pending; the walkthrough is not evidence of a live agent.
