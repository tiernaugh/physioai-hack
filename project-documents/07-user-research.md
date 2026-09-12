# User Research

Status: Draft
Last updated: 2026-09-12

## Research source

One short interview with a gym owner and coach who conducts strength and mobility assessments using a force-frame system. The participant also supplied an example client assessment report.

Sources:

- [`transcripts/2026-09-12-gym-owner-interview.md`](transcripts/2026-09-12-gym-owner-interview.md)
- [`source-material/2026-09-12-strength-assessment-report.md`](source-material/2026-09-12-strength-assessment-report.md)

This is directional evidence from one practitioner. It should shape a hackathon hypothesis, not be presented as broad market validation.

## Current workflow

Based on the interview and report:

```text
Coach conducts isometric strength tests
→ measurement system stores readings and supplies reference comparisons
→ coach copies relevant outputs into Claude
→ Claude assists with basic calculations or wording
→ coach adds personal and clinical interpretation
→ coach assembles a report and rehabilitation plan
→ report is sent by WhatsApp or email
→ client follows the programme
→ coach retests later to judge progress
```

## Directly observed needs

These points were stated or demonstrated by the participant:

- Collecting data is insufficient; the larger issue is storing it consistently and putting it to practical use.
- Clients want an understandable view of their current physical state.
- A single overall score or “handicap” could help orient the client, provided it can be broken down to show the largest improvement opportunity.
- Visualising muscles, weaknesses, and possible performance effects would make the assessment easier to understand.
- The current report-building workflow involves manual copying, model assistance, and coach-authored personal interpretation.
- The ideal client experience would live in the application clients already use.
- WhatsApp and email are current delivery channels rather than the participant's stated ideal home.
- The assessment should lead into programming and later reassessment.

## Report anatomy

The supplied example contains:

- client, coach, date, and test-method metadata;
- a coach-authored clinical summary;
- reliability guidance that excludes readings below a stated force threshold;
- bilateral strength measurements in Newtons;
- computed side-to-side asymmetry and stronger-side labelling;
- a monitoring flag when asymmetry exceeds a stated threshold;
- a short explanation of the flagged result;
- a four-week rehabilitation plan;
- a planned reassessment.

The artifact combines measured facts, deterministic calculations, threshold rules, professional interpretation, and programme decisions. Those should remain distinguishable in any agent-generated version.

## Opportunity hypotheses

These are interpretations to test, not direct user statements:

### 1. Assessment-to-explanation agent

A completed assessment event triggers an agent to turn raw bilateral measurements, relevant reference data, and coach notes into a visual draft report. The coach reviews uncertain interpretations and approves the client-facing result.

### 2. Assessment-to-programme agent

After coach approval, the agent proposes bounded changes to the client's existing programme, showing which measurement or observation supports each change. The coach accepts, edits, or rejects each proposal.

### 3. Longitudinal progress agent

On reassessment, the agent compares the new measurement set with prior results and the intervening programme, then highlights meaningful change, unresolved asymmetry, and the next decision requiring coach input.

### 4. Shared visual consultation artifact

During or immediately after a consultation, the agent creates a body map that both coach and client can inspect. Selecting a region shows the underlying measurement, comparison, coach observation, confidence, and proposed next action.

## Contextual-advantage hypothesis

The likely environmental value is a combination of event, state, and authority:

- **Event:** the testing workflow knows an assessment has just finished.
- **State:** it already contains bilateral measurements, earlier assessments, and possibly reference comparisons.
- **Relationship:** it knows which coach and client are involved.
- **Action:** it can prepare a client artifact or propose a programme update without manual transcription.
- **Authority:** the coach can approve clinical interpretation and programme changes before release.

A standalone chat requires the coach to export, select, explain, prompt, copy, edit, and redistribute this context. The embedded version can react at the assessment boundary and return the approved result into the existing client relationship.

## Strongest narrow workflow currently visible

```text
New assessment data arrives
→ agent calculates asymmetry and applies reliability/monitoring rules
→ agent maps noteworthy results to a visual report
→ coach reviews the evidence and edits or approves the explanation
→ approved report appears in the client's familiar channel
→ reassessment reminder/state is created
```

This is still a candidate. The team must decide whether the testing surface, a coach dashboard, or the coach-client channel is the environment judges will experience.

## Human-control requirements

- Calculations should be reproducible and visible.
- Low-quality or below-threshold readings should be excluded according to an explicit rule.
- The agent should not invent causal biomechanical explanations from strength asymmetry alone.
- Coach observations should be attributed to the coach.
- Generated interpretations and programme suggestions should remain drafts until reviewed.
- The client-facing artifact should distinguish measurement, comparison, interpretation, and action.
- Any delivery or programme update should be previewable and reversible during the demo.

## Open research questions

- Which exact platform currently holds the measurements, and what export or API does it offer?
- Which client application does the gym currently use?
- How long does the current reporting workflow take?
- Which report sections are repetitive and which require genuine professional judgment?
- Does the participant want one body-wide score, or was “handicap” an analogy for communicating priorities?
- Which normative comparisons are licensed or available outside the measurement platform?
- What follow-through is currently lost between report delivery, programme adherence, and reassessment?
- Would a coach trust a programme suggestion if every recommendation cited its supporting measurement and note?
