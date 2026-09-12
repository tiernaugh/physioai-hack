# T-003 — Prove session capture through body annotation
- **Status:** Dropped
- **Priority:** P0
- **Owner:** Unassigned
- **Estimate:** Re-estimate against actual remaining time; viewer transplant time-box 30 minutes
- **Depends on:** T-001
- **Blocks:** T-004 completion and final implementation estimates
- **Concept links:** [Architecture](../concept/05-technical-architecture.md), [workflow](../concept/03-agent-workflow.md)

## Superseded planning gate
Superseded by T-005 through T-012 under the UI-first Vite plan. Requirements carry forward; unchecked validation is not claimed complete. Retained below for historical context.

## Outcome
Executable evidence that the locked stack can turn a short recording into a reviewed, source-backed annotation and focus the corresponding body region.

## In scope
- Preserve the Vite exploration before scaffolding the Next.js build.
- Pin/vendor the atlas renderer with attribution; resolve two broad product regions.
- Measure cold/warm localhost load on the actual demo device.
- Record and transcribe a short clip; capture selection timestamps.
- Extract and validate a regional proposal; confirm it through a minimal review control.
- Invoke a real CopilotKit frontend action to focus the region.
- Verify local persistence and event deduplication.

## Out of scope
Polished UI, exercise planning, hardware or WhatsApp integrations.

## Acceptance criteria
- [ ] Next.js viewer loads and focuses two validated regions.
- [ ] Real microphone recording becomes source text.
- [ ] Region proposal has a valid source; uncertain mappings are not fabricated.
- [ ] Coach confirmation publishes the current proposal.
- [ ] A real agent-triggered UI action visibly focuses the correct region.
- [ ] Saved update survives reload; duplicate source event does not duplicate it.
- [ ] Latency, device, package versions and failures are recorded.
- [ ] Transcript fallback is distinguished from the successful live path.

## Validation
Repeat the short end-to-end path twice and record actual evidence. Upstream callbacks do not count as proof of our integration. Venue Wi-Fi is not involved in same-laptop localhost geometry loading.

## Completion record
- **Completed:** Pending
- **Result:** Pending
- **Evidence:** Pending
- **Deviations/follow-ups:** None
