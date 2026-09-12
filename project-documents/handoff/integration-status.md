# Combined implementation status

Date: 2026-09-12
Scope: merge the existing prototype work with the recorded-session handoff.

The repository combines Kingsley's application work with Tiernan's accepted consultation brief. Existing app features are preserved. The brief describes the target workflow; merging its documents does not implement it or change the runtime framework.

| Area | Current repository | Relationship to the consultation brief |
|---|---|---|
| Application | Vite, React, TypeScript and Three.js | Next.js is the accepted target; migration remains pending |
| Body exploration | Packaged muscle atlas and fictional hamstring recovery visualization | Reuse assets/design; broad-region selection and agent focus require the integration spike |
| Assessment story | Navigable four-week story with report measurements and labelled examples | Reuse evidence presentation without treating example exercises as report prescriptions |
| Golf story | Mockup component and three images, not mounted in navigation | Preserve exploratory source; no live motion-analysis capability is implemented |
| Routine and history | Fictional exercise logging with browser persistence | Existing prototype functionality retained; outside consultation P0 acceptance |
| WhatsApp | Separate optional Node backend and voice-inbox UI | Existing integration retained; it does not implement in-app coach recording/review |
| Consultation | PRD, ADRs and proposed technical contracts | Recording → sourced extraction → revision-aware confirmation → client observation remains to be built |
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

Follow [T-003](../tickets/T-003-prove-critical-integration.md): prove a real recording-to-reviewed-annotation flow, two validated regions, a real agent viewer action and persistence/replay behavior. Keep those acceptance boxes pending until executable evidence exists.
