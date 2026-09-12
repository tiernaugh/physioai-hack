# Architecture Decision Records
Status: Active

Accepted means chosen, not verified in a running build. ADRs record durable rationale; spike evidence belongs in tickets. Supersede an ADR explicitly when a decision changes and link its replacement.

| ADR | Decision | Status |
|---|---|---|
| [001](001-nextjs-application.md) | Next.js application with browser-only viewer | Superseded by 006 |
| [002](002-vendor-atlas-adapter.md) | Vendor anatomy behind product-region adapter | Accepted |
| [003](003-agent-evidence-and-actions.md) | Source-backed proposals and controlled UI actions | Accepted |
| [004](004-record-then-review.md) | Record, process on Finish, review before publication | Accepted |
| [005](005-local-demo-persistence.md) | Local versioned demo record and localhost delivery | Accepted |

| [006](006-build-on-vite-prototype.md) | Build on Kingsley's Vite app and Node backend | Accepted |

ADR-006 also amends the viewer replacement and mandatory CopilotKit assumptions in 002/003; their evidence and attribution requirements remain.

Each record includes context, decision, alternatives, consequences and validation still needed. New ADRs receive the next permanent number.
