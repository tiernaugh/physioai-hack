# Locked Scope and Requirements
Status: Decided — 2026-09-12
Technical verification remains pending

## Golden path
Stephen records a short explanation in a client's body record, finishes, reviews agent-proposed regional updates and confirms them. The client explores the updated body and saves an observation in the same place.

## P0 acceptance criteria
- [ ] Next.js serves one body-first application with coach session and client exploration modes.
- [ ] At least two validated body regions can be selected/focused.
- [ ] Start/stop/discard recording controls and capture agreement are visible.
- [ ] A real short recording is transcribed after Finish.
- [ ] Timestamped selection context is preserved; unavailable alignment is not invented.
- [ ] Real structured extraction proposes source-backed regional updates.
- [ ] Ambiguous region/side or unsupported claims remain review-needed.
- [ ] Stephen can correct/remove proposals and confirm the current revision.
- [ ] Confirmed updates appear with source, author, date and unread state.
- [ ] Show update focuses the region and opens the relevant evidence.
- [ ] Client observation can be previewed, saved, edited and deleted.
- [ ] Records survive reload; repeat events are deduplicated without blocking later sessions.
- [ ] Existing measurements remain intact and distinguishable from spoken observations.
- [ ] Reset, microphone failure, model failure and storage failure have usable handling.

## Demo fixture
Fictional identity. Seed the de-identified assessment and a clearly fictional previous event. Record a short fictional coach explanation live: “Today we discussed tightness around the right shoulder. We also reviewed the elbow-flexion comparison in the report. We'll revisit both at the next session.”

The statement is a demo script, not medical advice or a claim from the supplied report. Use explicit anatomy in the script so success does not depend on resolving “here.” Optional pointing enriches the context. Client adds “This felt uncomfortable during training today.”

## Time and scope
These requirements replace the earlier upload-only scope. Live capture is P0; real-time streaming transcription is not. Limit the recorded demonstration to 20–30 seconds. Re-estimate against actual time remaining before scheduling; the historical 14:30 target must not imply time remains.

## Non-goals
Exercise plans, workout tracking, golf swing analysis, body/recovery scores, tissue-healing predictions, full history analytics, live force-frame integration, WhatsApp, multi-user security, diagnosis and autonomous clinical recommendations.

## Optional surrounding context
One prior hamstring episode or a golf goal may appear as a labelled fictional dated entry. No separate interactive recovery or golf product is required.
