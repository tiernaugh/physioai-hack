# ADR-004 — Record, Process on Finish, Review
Status: Accepted
Date: 2026-09-12

## Context
Coach speech supplies the new context naturally. Continuous streaming would add complexity and isn't needed for the demo.

## Decision
Provide Start/Finish/Discard session controls in the same app. Record with agreement, retain timed selection context and process after Finish. Coach reviews, edits/removes and confirms the current proposal revision before client publication.

## Alternatives
Prepared transcript only remains a labelled fallback. Live streaming transcription and autonomous interruption are deferred. A separate coach dashboard is unnecessary.

## Consequences
This adds microphone and transcription validation to P0. The app must not apply a final selection to the entire recording. An ambiguous statement remains review-needed. Edited drafts invalidate previous confirmation.

## Validation
A short recording becomes at least one sourced confirmed update. Fallback transcript success does not prove the microphone path. Raw audio remains temporary and is not persisted with client notes.
