# Technical Architecture and Stack
Status: Draft — spike required

## Components
Client-facing body viewer, structured assessment store, model endpoint and validated UI actions. Reuse an anatomy viewer if practical rather than building one from scratch.

| Need | Proposed approach | Spike question |
|---|---|---|
| Body exploration | Human Atlas-inspired or adapted 3D viewer | Can we load, select and focus needed regions reliably? |
| Assessment input | Prepared de-identified report and transcript | Can supported findings map to allowed region IDs? |
| Agent | Structured extraction and explanation | Does every output retain a valid source? |
| Shared state | Selection, assessment and annotation state | Can model actions update the actual viewer? |
| Notes | Text entry, preview and persistent save | Does the saved note retain region and exact wording? |
| Hosting | Undecided | Does the viewer load on the demo device? |

Reference reviewed: https://github.com/ashemag/human-atlas
README describes React/Three.js, selectable reference anatomy, MIT application code and separately licensed CC BY 4.0 anatomy data. Preserve attribution if reused. Code integration and device performance have not been tested.

## Boundaries
Seeded source material and fictional identity; real mapping, navigation and note persistence are intended. No force-frame API, WhatsApp, microphone or diagnosis dependency.

Add one explicit incoming-note event boundary with event ID, assessment ID, author, timestamp and source text. Derive its region through validated agent mapping. Append to the existing record, persist read/unread state and reject duplicate event IDs. The operator simulates delivery; interpretation and application updates must be real.

Use a small region allowlist. Keep measurements and derived calculations outside generated prose where possible. API credentials stay server-side.

## Team split
Product/design: body-first flow, visual evidence hierarchy, fixture story and pitch.
Engineering: viewer integration, region mapping, shared state and persistence.
Agree region IDs and annotation shape first.
