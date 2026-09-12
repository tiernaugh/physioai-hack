# Submission Pack
Status: Copy agreed 2026-09-12 — fill the bracketed fields, then paste into the portal
Deadline: as shown in the hackathon portal (nominal schedule: submission 15:30–16:00)

Portal requires: title · written description · public GitHub repository · two-minute video · social post tagging event partners.

## Checklist

| Item | Status | Owner | Notes |
|---|---|---|---|
| Root README: replace stale Next.js sentence; add "What was built today" | ☐ | Tiernan | Text below. Do before flipping public |
| Repo set to **public** | ☐ Blocked on README | Tiernan | `gh repo edit --visibility public` or Settings → General |
| Root `LICENSE` file | ☐ optional | — | Not required by the portal. Vendored anatomy attribution already at `project-app/public/models/muscle-atlas/ATTRIBUTION.md` — keep it |
| Project title | ✅ | — | PhysioAI |
| Written description | ☐ pick one line | Tiernan | `[PICK ONE]` below must match what actually runs at submit time |
| Two-minute video recorded | ☐ | Kingsley / Stephen | Shot list below; script is `concept/08-demo-story.md` with the 0:30 line change noted |
| Video uploaded + link in README | ☐ | — | YouTube unlisted or Loom; add under `## Demo` in root README |
| Social post published | ☐ | Tiernan | Drafts below; replace sponsor names with real handles from the portal |
| Portal form submitted | ☐ | Tiernan | |

## Title

**PhysioAI**

Long form where a subtitle field exists: **PhysioAI — your consultation, attached to the places it describes**

Use the same name in the video title, README H1 and social post.

## Written description

Product paragraphs describe PhysioAI as designed. The `[PICK ONE]` paragraph states what runs today. Keep the disclosure — judges score integration depth and reward accurate live/seeded boundaries.

> Today a physio explains your body mechanics in the room — talking, pointing, measuring how much force you generate on each side and how far a joint moves — and you leave with a printed PDF, a few videos and a fading memory of what any of it meant.
>
> **PhysioAI** is ambient in that room. While the session is happening it takes the context already present — the measurements, the practitioner's explanation, which side, which movement — and maps it onto a 3D body at the places it describes. Each update is source-backed and tied to a broad region, with the practitioner's exact words preserved. The practitioner reviews, corrects and confirms before anything reaches the client.
>
> Over time this becomes a digital twin of your body's record: everything measured, said and felt about it, in the place it belongs. The client explores it, adds "this felt uncomfortable during training today" at the exact spot, and watches change between check-ins show up as whole-muscle colour on the same body.
>
> The agent shares the client's selected region and assessment context, so it guides the view and updates the same record — rather than answering in a chatbox the client would have to copy from.
>
> **[PICK ONE]** Transcription and extraction run against a live model with schema-validated region mapping. **/** Extraction currently runs from a labelled sample transcript; the review-and-confirm loop, viewer actions and record updates are real. Strength data is a de-identified real report, not a live feed.
>
> Built today on Vite/React/Three.js with a Node backend. Reference anatomy is BodyParts3D via the MIT-licensed Human Atlas renderer (CC BY 4.0, attributed in-repo) — a reference map, not a scan. Client identity and history are fictional. No diagnosis, no clinical claims.

**Short version (~60 words):**

> A physio explains your body in the room; you leave with PDFs. PhysioAI is ambient in that room — it takes the measurements and the conversation as they happen and maps them onto a 3D body at the places they describe. Over time it becomes a digital twin of your body's record. The practitioner confirms; the client explores and adds their own observations. Built today on Vite/React/Three.js; anatomy from BodyParts3D via Human Atlas.

## "What was built today" — root README section

> Everything in this repository was created on 12 September 2026 during the hackathon. First commit 11:59; the application, body record feature, consultation flow and all documentation followed through the day (see `git log`). Reused building blocks: the Human Atlas renderer and BodyParts3D anatomy (MIT / CC BY 4.0, see `project-app/public/models/muscle-atlas/ATTRIBUTION.md`), React, Three.js, Vite and standard libraries. The de-identified strength report is a real example supplied by a coach interviewed today.

## Root README fix

Replace:

> …the new consultation flow and Next.js/CopilotKit migration still require implementation and verification.

with:

> The consultation flow is built on the Vite app (ADR-006); no framework migration is planned. See the [handover](project-documents/handoff/next-agent-prototyping.md) for exactly what is live, simulated and pending.

Add `## Demo` with the video link once uploaded.

## Two-minute video — shot list

Script: `concept/08-demo-story.md`. Record from `localhost`, viewer preloaded, browser ≥1440×900. One take per segment then cut, or one continuous take if rehearsal is clean. Label it as a recording of the running app.

| Time | On screen | Operator action / voiceover note |
|---|---|---|
| 0:00–0:15 | Report glimpse → body record | Report open in a tab; switch to app |
| 0:15–0:30 | Existing record, markers visible | Hover a marker, don't click |
| 0:30–0:55 | Add consultation → record → Finish | **Voiceover change:** "Stephen's explaining as he normally would. PhysioAI is listening in the room." If audio isn't live, use paste input and add one clause saying so |
| 0:55–1:15 | Proposals → review → Confirm | Edit one word or move one location — show control is real |
| 1:15–1:40 | New markers; click shoulder; source words | The reveal — hold on the coloured body |
| 1:40–1:55 | Client observation → preview → save | Type it live |
| 1:55–2:00 | Updated record + promise line | Static hold |

Voiceover rules: no routines, no golf. Never "your body" or "scan" for the anatomy. Don't claim hardware is connected or improvement is measured. The hips→shoulder example from the social post is not on screen — keep it out of the voiceover.

## Social post

Sponsor names are written out; replace with the real handles from the portal. Attach the video or a 10-second clip of the body changing colour.

**LinkedIn:**

> We're at AI Tinkerers today, and the brief was to take AI agents out of the chat window and into the real world — somewhere they can gather context a chatbox never sees.
>
> Kingsley and I picked the physio room.
>
> A lot happens in an assessment. Your physio measures how much force you can generate on each side, how far a joint moves, where you compensate. And they explain it live — talking, pointing at your shoulder, showing you the movement. It's rich, spatial, specific to you. Then you leave with a printed PDF and a half-memory of what it all meant.
>
> So we built **PhysioAI**. It's ambient in the room. An agent takes what's said and what's measured while the session is happening, breaks it down, and maps it onto an open-source model of real human anatomy — at the places it actually describes. Which side, which movement, the physio's exact words, source attached. The physio reviews and confirms before the client sees anything.
>
> The client leaves with a body they can explore instead of a document. Over time it becomes a digital twin of their body's record — everything measured, said and felt, where it belongs.
>
> What that means in practice:
>
> When your physio tells you the rotation in your hips is what's showing up in your shoulder, you can *see* it — both places lit up, the explanation attached to each, the connection between them. Not a sentence you half-remember; a thing you can go back and look at.
>
> And in recovery, when progress is slow and hard to feel, you watch the body change colour between check-ins. Left shoulder: 5 out of 10 to 3. The muscle goes from amber to green. That's motivating in a way a spreadsheet of numbers never is.
>
> Between sessions you add your own observations right at the spot — "this felt tight reaching overhead today" — and it's there for your next conversation.
>
> Why an agent *here* rather than a chatbot? Because it already knows the region you're looking at and the assessment you're in. It guides the view and updates the record in place. Nothing to copy out of a box.
>
> Built in a day on Vite, React and Three.js, anatomy from BodyParts3D via the Human Atlas project. Fictional client, real de-identified report, no diagnosis.
>
> Thanks to AI Tinkerers and the sponsors who made the day possible — OpenAI, CopilotKit, Exa, Trigger.dev, Ambiguous AI, Auth0, OpenRouter, Google Cloud and Mozilla.ai. Repo: [link]

**X:**

> At AI Tinkerers today the brief was: get agents out of the chat window and into the real world.
>
> Kingsley and I picked the physio room. PhysioAI listens while the session happens and maps what's said and measured — force, mobility, the physio's words — onto real human anatomy, at the places it describes.
>
> When your physio says your hips are affecting your shoulder, you can see it. When recovery is slow, you watch the body change colour.
>
> [repo] [tags]

## Claim boundaries (carry into every field)

- "Reference anatomy" / "real human anatomy model" — never "your body" or "scan".
- "Digital twin *of your body's record*" — if asked: every measurement, explanation and observation is spatially attached; the anatomy is a reference map.
- Fictional client; de-identified report from one interviewed coach.
- Say which steps are live and which are simulated, in the description and voiceover.
- No named equipment vendors. No measured health outcome, no hardware connection, no clinical validation.
- The hips→shoulder example is illustrative of the physio's explanation made visible — the agent does not infer causation.
