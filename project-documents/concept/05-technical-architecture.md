# Technical Architecture and Stack
Status: Proposed — 2026-09-12, pending CTO review before build lock

This document recommends the stack for the client body explorer and records what has been verified against the Human Atlas source. It is a proposal from the product lead for the CTO to challenge, amend and confirm. Open questions for review are at the end.

## Summary of the recommendation

1. **Do not fork Human Atlas and do not rebuild it.** Transplant its renderer and packaged geometry into our own app as a vendored module.
2. **Next.js App Router** as the application, with the vendored Three.js viewer as a client component.
3. **CopilotKit** for agent ↔ UI shared state and actions. This is the load-bearing sponsor integration and the basis of the "why here" claim.
4. **OpenAI structured outputs** for extracting findings into a region-constrained schema. The only required model call.
5. **`localStorage`** for note persistence. **`localhost`** for the demo.
6. Skip Auth0, Trigger.dev, Exa, Ambiguous AI and Cloud Run for P0. Each is either a non-goal or belongs to the superseded coach-first concept.

## What was verified in Human Atlas (2026-09-12)

Source: https://github.com/ashemag/human-atlas — created 2026-09-05, last push 2026-09-06, ~3.2k stars, 118 files, ~102 MB. Live demo: https://human-atlas-seven.vercel.app

| Fact | Detail | Implication |
|---|---|---|
| Stack | React 19.2, Three.js 0.159, TypeScript 5.9, Vite 8, Tailwind 4, shadcn/ui | Familiar, modern, no learning curve |
| Geometry | BodyParts3D 4.0: 2,234 selectable meshes, 3,432 named FMA concepts, ~2.29M triangles | Far more than we need; selection precision is not a risk |
| Payload | ~33 MB compressed, 14 chunks (`public/models/body-0..13.bin`, 3.8–4.3 MB each, `.gz` variants shipped) | **Cold load on venue wifi is the largest demo risk.** Run from `localhost`, preload before presenting |
| Loader | `app/model-download.ts` validates exact byte length; short reads throw "An anatomy file was incomplete" | Partial loads fail loudly rather than render wrongly. Good, but means no graceful degradation |
| State model | `SceneState = {explode, visible[], selected[], isolate, view, rotate, reset}` in `app/anatomy.ts` | Flat, serialisable — near-ideal for CopilotKit shared state |
| Renderer seam | `<AnatomyScene atlas state onSelect onProgress onError />` in `app/scene.tsx` (~18 KB) | A controlled component. Selection in, selection out |
| `scene.tsx` dependencies | `react`, `three` (+ OrbitControls, RoomEnvironment, BufferGeometryUtils), and four sibling files only | **Transplantable.** No coupling to their build or UI |
| Existing agent tools | `app/agent-tools.ts` exposes `find_anatomy` and `inspect_anatomical_structure` (select a concept in 3D + open panel) via the experimental `document.modelContext` API; wired in `page.tsx:26` | **The agent-drives-viewer integration is already proven upstream.** We rewrite it as CopilotKit actions (~20 lines) |
| Build config | `vite.config.ts` is plain `@vitejs/plugin-react` + Tailwind | The exotic entries in `package.json` (vinext beta, `@vitejs/plugin-rsc`, `react-server-dom-webpack`, Cloudflare, `@openai/sites-vite-plugin`) are unused by the config |
| UI code | `app/page.tsx` is 52 dense lines; museum-style glass aesthetic | We would rewrite it regardless |
| Licence | Application code MIT; anatomy data CC BY 4.0 (BodyParts3D, DBCLS). `public/ATTRIBUTION.md` documents adaptations | Redistribution and adaptation explicitly permitted. Ship their LICENSE and ATTRIBUTION.md with the vendored module |
| Anatomy scope | Adult male reference anatomy (TARO MRI). Not a scan of any client | Reinforces the existing "reference map, not your body" guardrail. Product gap for roadmap |
| Device testing | README states physical-device and real multitouch performance are untested | Test on the actual demo device before build lock |

## Fork vs. rebuild vs. transplant

| Option | Cost | Problem |
|---|---|---|
| Fork wholesale | 5 min to run | Inherit 102 MB repo, unused beta toolchain, and a `page.tsx` we rewrite anyway. Judges see "a fork with a modified UI file" |
| Rebuild from scratch | Days | The packaged geometry + manifest is the expensive part. Recreating it is pointless |
| **Transplant (recommended)** | ~30 min, time-boxed | Vendor six files + `public/models/` into our own app. Clean provenance; our code is visibly ours |

Vendored module layout:

```text
public/models/                    atlas.json + body-*.bin (+ .gz)      CC BY 4.0
src/atlas/scene.tsx               Three.js renderer                    MIT
src/atlas/anatomy.ts              Atlas / Part / Concept / SceneState types
src/atlas/model-download.ts
src/atlas/pointer-tap.ts
src/atlas/explosion-layout.ts
src/atlas/LICENSE                 upstream MIT notice
src/atlas/ATTRIBUTION.md          upstream data attribution, unchanged
```

Deliberately not vendored: `agent-tools.ts` (rewritten as CopilotKit actions), `globals.css` (restyle), `page.tsx` (ours). Everything outside `src/atlas/` is written by the team.

**Fallback if the transplant fights us past 30 minutes:** fork, delete unused dependencies, gut `page.tsx`. Preserves the product claim at the cost of provenance clarity.

## Proposed stack

| Layer | Choice | Behaviour it serves | Notes |
|---|---|---|---|
| Application | Next.js App Router | One process for UI + server-side model key | CopilotKit's canonical quickstart is a Next route handler. Viewer mounts as `'use client'` via `dynamic(..., {ssr:false})` |
| Body viewer | Vendored atlas renderer | Body as primary navigation; region selection and focus | See above |
| Agent ↔ UI | CopilotKit (AG-UI) | Shared spatial state; agent actions that change the view and the record | `useCopilotReadable` → `SceneState.selected` + active assessment + annotations. `useCopilotAction` → `focus_region`, `draft_observation`. The theme argument lives here |
| Reasoning | OpenAI structured outputs (strict) | Report + transcript → `annotation[]` | `regionId` is an **enum of the allowlist**, so the model cannot emit an unmapped structure. Server-side only |
| Calculations | Plain TypeScript | Asymmetry = `abs(R−L)/max(R,L)×100` | Never in generated prose. Fixture check: elbow 82.0 / 103.5 → 20.8% |
| Persistence | `localStorage`, keyed by assessment ID | Note survives reload | Nothing more is required by P0 |
| Hosting | `localhost` on the demo device | Reliability | 33 MB over venue wifi is the failure mode to design against |

### Sponsors deliberately not used in P0

| Sponsor | Reason |
|---|---|
| Auth0 | Multi-user is a stated non-goal |
| Trigger.dev | Nothing wakes without a prompt in this concept; justification left with the assessment-room pivot |
| Exa | Evidence contract forbids unsourced explanation; external search invites invented causality |
| Ambiguous AI | Coach-as-coworker belongs to the superseded concept |
| Cloud Run | Local demo is safer; Vercel config ships upstream if hosting is needed |

Two load-bearing integrations reads as discipline. Do not add a third to look thorough.

## The gating design task: movement → region allowlist

The fixture is joint-movement evidence (hip adduction, elbow flexion, ankle range). The atlas is FMA anatomical structures. The evidence contract in `03-agent-workflow.md` forbids turning a movement test into a muscle claim. Therefore the mapping is **hand-authored, not model-generated**, and it is the contract between fixture, agent schema and viewer.

Starter table. Concept IDs come from `public/models/atlas.json` (`concepts[].id` / `.name`); resolve them during the spike.

| Assessment movement | Side | Target region (broad) | Atlas concept ID | Content type in fixture |
|---|---|---|---|---|
| Elbow flexion | L / R | Elbow joint region | TBD | measurement (82.0 N R, 103.5 N L, 20.8% asym, Monitor) |
| Hip adduction / abduction / flexion / extension | L / R | Hip joint region | TBD | measurement (four bilateral pairs) |
| Shoulder internal / external rotation | L / R | Shoulder joint region | TBD | measurement |
| Ankle range limitation | unspecified | Ankle joint region | TBD | coach statement (clinical summary) — no force value, no side |

Rules: one broad region per movement; laterality stays unspecified where the source is silent; content type travels with the annotation; anything the model returns outside this enum is rejected by code, not by prompt.

## Data shape

```ts
type ContentType = 'measurement' | 'coach_statement' | 'generated_explanation' | 'client_observation';

interface Annotation {
  id: string;
  assessmentId: string;
  regionId: RegionId;            // allowlist enum
  side?: 'left' | 'right';
  contentType: ContentType;
  text: string;                  // exact wording for coach/client content
  sourceRef: string;             // e.g. 'report:strength-table:row-7', 'transcript:00:04:12'
  values?: { right?: number; left?: number; unit: 'N'; asymmetryPct?: number };
  createdAt: string;             // ISO date
}
```

The schema, not the viewer, is the durable asset.

## Boundaries: live, seeded, mocked, manual

| Element | Classification |
|---|---|
| Report and consultation transcript | Seeded — de-identified supplied report + explicitly fictional transcript |
| Finding extraction and region mapping | Live model call, code-validated against the allowlist |
| Region focus and guided walkthrough | Live — agent actions mutate real `SceneState` |
| Note draft | Live model call; exact client wording preserved by code |
| Note save | Live, `localStorage` |
| Anatomy geometry | Reference model (adult male), not the client's body — disclosed |
| Hardware / force-frame | Not connected — disclosed |

## Failure handling

| Failure | Response |
|---|---|
| Geometry chunk fails or times out | Loader throws; show honest "viewer could not load — reload" state. Demo runs from `localhost` to avoid this |
| Model returns invalid `regionId` | Rejected by schema validation; finding shown as "unplaced" with its source, never dropped silently |
| Model call fails | Retry affordance; no invented explanation; existing annotations remain |
| Reprocessing same assessment | Idempotent on `assessmentId` — no duplicate annotations |
| Note save fails | Preview remains; user told it was not saved |

## Roadmap beyond the hackathon (direction, not demo claims)

- **Data model first.** Annotations move to Postgres (Supabase is already in the team tooling) with RLS separating coach and client; auth becomes real at that point.
- **Viewer stays swappable.** 33 MB is not a consumer-app payload and clients want this in the app they already use. The valuable upstream asset for this is `scripts/convert-anatomy.py` + `optimize-anatomy.mjs` — a working BodyParts3D → packed-web pipeline. A musculoskeletal-only or curated ~20-region build should be far smaller. Keep `regionId` as the stable key so a 2D body map (mobile, messaging cards, print) reads the same annotations.
- **Reference anatomy is male-only.** Genuine product gap for a physio/gym client base. Upstream's earlier female HuBMAP assets have partial skeleton/muscle coverage. No clean answer today; do not paper over it.
- **Async arrives with real events.** Trigger.dev becomes relevant when an assessment export or transcript upload triggers processing. Not before.
- **The environment question is unfinished.** The strong long-term theme argument is the body record embedded inside the gym's client app or the coach–client thread, not a standalone viewer. Pitch it as direction.

## Open questions for CTO review

1. Next.js vs. Vite + separate Node runtime for CopilotKit — any strong preference? The recommendation is Next for one process and the canonical CopilotKit path.
2. Have you used CopilotKit shared state with a non-form UI before? Any known friction with frequently-changing state like camera/selection?
3. Comfortable with the 30-minute transplant time-box and the fork-and-gut fallback?
4. Demo device: what is it, and can we test the 33 MB cold load on it before build lock?
5. Anything in the data shape you would change before we write the allowlist and fixture against it?

## Team split

Product/design: allowlist and fixture, evidence hierarchy in the detail panel, body-first flow, pitch.
Engineering: Next scaffold, transplant, CopilotKit wiring, structured extraction endpoint, persistence.
Agree the allowlist and `Annotation` shape before either track writes code.
