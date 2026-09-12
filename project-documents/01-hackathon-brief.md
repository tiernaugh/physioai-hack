# Hackathon Brief

Status: Decided
Event date: 2026-09-12

## Theme

**Agents are leaving the chatbox.**

Build an agent for a place where people already work, talk, or live, then make it meaningfully more useful because of that context.

The central question is:

> What becomes possible when the agent shows up where the work is already happening?

The project should not simply move a chatbot into another interface. Its environment should give the agent useful context, triggers, actions, relationships, continuity, or authority that materially affects its behaviour.

The strongest test is:

> Why is this agent meaningfully better here than it would be in a standalone ChatGPT-style chatbox?

## Judging criteria

Each category is scored from 1–5, for a total of 20.

### 1. Core Requirements & Functionality

Does the project deliver a robust, reliable, end-to-end agent workflow inside its intended environment?

### 2. Innovation & Theme Alignment

Does the environment materially improve what the agent can do? A top-scoring concept reveals an agent pattern whose central value could not be reproduced in a standalone chatbox.

### 3. Technical Execution & Integration

Judges consider code, architecture, reliability, orchestration, tool use, data handling, integration depth, and failure handling. Depth matters more than a collection of superficial APIs.

### 4. Usefulness & Agentic Experience

Does the agent create clear value through an experience native to its environment? Does it use context intelligently while preserving human visibility and control?

## Evaluation shorthand

1. Does it work?
2. Does it belong there?
3. Is it technically real?
4. Is it actually useful?

Always ask whether the concept could basically be a custom GPT. If it could, rethink the environmental relationship.

## Build constraints

Nominal event schedule:

- 10:00–10:30 — arrival and networking
- 10:30–11:00 — opening and starter kit
- 11:00–11:15 — teams and final idea
- 11:15–15:30 — build
- 15:30–16:00 — submission
- 16:00–16:45 — local show-and-tell
- 16:45–17:00 — wrap

Target feature completion by 14:30 to preserve time for testing, reliability fixes, repository cleanup, submission copy, a two-minute demo video, and a social post.

Optimize for:

- one memorable workflow;
- one strong reason the environment matters;
- one real agentic loop;
- one reliable demo.

## Team strengths and useful complementary roles

The product/design lead brings product strategy, interaction design, agent behaviour, human oversight, prototyping, storytelling, and experience designing structured AI workflows around evidence, missing information, conflict, and decision authority.

The current teammate brings a CTO and engineering background.

Choose responsibilities by capability rather than assuming particular people. Useful roles may include:

- product and interaction lead;
- integration and backend lead;
- frontend or environment integration lead;
- agent orchestration and prompt lead;
- reliability and demo operator;
- pitch and submission owner.

One person can hold several roles.

## Ideation frame

Generate combinations across loosely held decks:

- **Agent pattern or role:** observer, scout, investigator, mediator, delegate, coach, archivist, critic, coordinator, negotiator, guardian, translator, or another relationship.
- **Human or work context:** a person, group, activity, profession, relationship, or industry.
- **Environment:** browser, messaging, mobile, voice, wearable, physical room, document, IDE, calendar, vehicle, shared workspace, or another existing setting.
- **Context advantage:** what changed, who is present, what the user sees, history, location, missing responses, timing, multiple perspectives, direct action, continuous observation, or a bridge between physical and digital context.
- **Technical capability:** reasoning, multimodal perception, tool use, search, memory, asynchronous work, notifications, shared state, identity, scoped authority, approval, delegation, or generative UI.

Use descriptive prompts rather than leading solution prompts. For example, prefer “observes activity over time” to “build a monitoring agent for Slack.”

After ideas emerge, the Futures Triangle can interrogate them through:

- pull of the future;
- push of the present;
- weight of the past.

Use it as a reflective lens, not an idea-generation formula.

## Agent relationship and interaction model

Possible relationships include tool, assistant, delegate, coworker, representative, mediator, participant, and observer.

A classic chatbot waits for a human prompt. The target pattern is closer to:

```text
Environment changes
→ agent perceives
→ agent reasons
→ agent acts or surfaces something
→ human steers or approves when appropriate
→ environment changes again
```

Autonomy is valuable only when it improves the experience and remains understandable and controllable.
