# ADR-005 — Local Demo Record
Status: Accepted
Date: 2026-09-12

## Context
One fictional client's record must survive reload and demonstrate successive updates. Production accounts and synchronization are out of scope.

## Decision
Use versioned validated localStorage for records, confirmed annotations and client notes, keyed separately from Kingsley's prototype. Demo from localhost. Deduplicate by source event and revision, not assessment ID.

## Alternatives
A database and authentication add deployment and access-control work. In-memory-only state fails the persistence demonstration. Assessment-level deduplication prevents legitimate follow-up sessions.

## Consequences
No multi-user security, cross-device synchronization or multi-tab transaction guarantee. Mode switching is demonstration navigation, not authentication. Storage failure must retain unsaved drafts. Reset only touches the demo namespace.

## Validation
Reload preserves updates and notes; replay duplicates nothing; a new session appends successfully; simulated storage failure never reports a successful save.
