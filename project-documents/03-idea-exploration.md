# Idea Exploration

Status: Draft

Use this document for combinations, candidate concepts, and criticism before a concept is selected. Move only the chosen concept into `concept/`.

## Initial direction from the team conversation

The first substantial direction concerns physical assessment, strength training, physiotherapy, and the way measurements, observations, and explanations move between a practitioner and client.

Early ingredients include:

- force or strength measurements that reveal left/right imbalance;
- practitioner observations about posture, hips, shoulders, mobility, or compensation;
- a spoken consultation in the physical place where assessment happens;
- an agent that listens with permission and turns the exchange into a useful shared artifact;
- a visual body map or progress record that helps the client understand how observations relate;
- continuity between the practitioner, client, gym, physio, and later training sessions;
- voice notes or messaging as a possible familiar interface.

## Evidence from the gym-owner interview

The gym owner described a current workflow in which a strength-testing system records measurements and provides normative comparisons, but the useful client explanation is assembled manually. He copies measurement outputs into Claude, uses it for basic percentage or weakness calculations, adds personal interpretation, and sends a report through WhatsApp or email.

The interview strengthens several parts of the direction:

- Data storage and practical use of collected data are larger problems than capturing a measurement.
- Clients want an understandable picture of “where the body is” and where the largest improvement can be made.
- A muscle or body map could help show which areas are weak and how those weaknesses may affect performance.
- The coach wants the result in the application clients already use; WhatsApp and email are current delivery workarounds.
- Programming is the action layer: the assessment should influence what the client does next, then later measurements should show whether it worked.

It also changes the likely centre of gravity. The strongest trigger may be a newly completed assessment in the measurement or client-management workflow, rather than an ambient microphone or a generic WhatsApp conversation. Messaging may be the delivery channel while the assessment workflow supplies the decisive context.

## Why it may fit the theme

The valuable context may exist in the live assessment rather than in a later prompt: who is speaking, what movement is being tested, what result was observed, what the practitioner explained, and how this relates to previous sessions. Capturing this in place could remove the need for either person to reconstruct the consultation afterward.

The current idea is not yet proven to require WhatsApp, Telegram, CopilotKit, or any other specific interface. The decisive question is which environment supplies context or an action that a standalone chat cannot.

## Concerns to pressure-test

- A voice transcript summarizer with a body diagram could still be a generic chatbot workflow.
- Medical or biomechanical claims can become unsafe or misleading if the model invents causality.
- Reliable skeletal or posture analysis from a single image may be too ambitious for the build window.
- WhatsApp integration may consume disproportionate setup time.
- The user and payer are not yet clearly separated: client, trainer, gym owner, or physiotherapist.
- The memorable interaction must be more than attractive visualization.
- A direct integration with the existing measurement or client app may be unavailable during the hackathon.
- The system must separate deterministic calculations, coach observations, and model-generated interpretation.
- Any rehabilitation or biomechanical recommendation requires coach review and clear uncertainty.

## Questions for the next concept round

- What exact moment triggers the agent?
- Which environmental signals exist without someone manually restating them?
- Is the agent recording, interpreting, coordinating, coaching, or representing someone?
- Which single output changes the next action for the practitioner or client?
- What must the human review before it becomes part of the record or plan?
- Can the golden path use realistic sample data while remaining technically honest?
- Does the workflow still have clear value if posture estimation is removed?
- Can a file upload or seeded assessment event honestly stand in for an unavailable vendor API?
- Is the native home the testing workflow, the client app, or the coach-client message thread?

## Scope pressure-test from the second team discussion

The team initially described at least four surfaces or product areas:

1. voice-chat ingestion;
2. a client interface;
3. a practitioner interface containing structured information and voice notes;
4. a performance log with generated suggestions.

Additional possibilities included WhatsApp media ingestion, filmed sessions, live transcription, vendor integration, computer use, and a full body visualization.

This is too large for the build window and weakens the thematic story. It reads as a new platform with many inputs and views, while the challenge rewards an agent whose value depends on one existing environment.

### Candidate A — Full assessment ecosystem

The system connects force-frame data, filmed or recorded consultations, practitioner tools, client tools, longitudinal logs, suggestions, messaging, and visualisation.

- **Strength:** expresses the long-term product vision.
- **Weakness:** too many interfaces, identities, integrations, data types, and agent behaviours.
- **Verdict for today:** reject as the build scope; retain as future vision.

### Candidate B — Ambient assessment-room agent

The agent inhabits one live assessment surface used by a coach and client together. A test event and a short spoken observation become structured evidence. The agent calculates the noteworthy asymmetry, updates a simple body map, detects missing or conflicting information, and asks the coach to approve the client-facing explanation.

- **Environment:** the physical assessment session, represented by one shared tablet or browser surface.
- **Natural trigger:** a measurement arrives or the coach completes a test.
- **Context advantage:** the agent receives the measurement event, knows which test is active, hears the related observation, and can clarify uncertainty before the session moves on.
- **Human control:** the coach confirms or edits the interpretation before it becomes part of the client record.
- **Verdict for today:** strongest theme fit and recommended direction.

### Candidate C — Post-assessment message agent

The coach sends a report image and voice note through an existing message thread. The agent extracts measurements, drafts a visual explanation, asks for coach approval, and returns the approved artifact to the client.

- **Strength:** easiest integration fallback and close to current behaviour.
- **Weakness:** messaging is primarily a delivery channel and risks looking like a chatbot with file upload.
- **Verdict for today:** credible fallback if live assessment capture proves unreliable.

## Recommended scope boundary

Build one shared responsive interface with two states, not four products:

```text
Live assessment state
→ coach and client see the active test, incoming readings, and captured observation

Reviewed result state
→ the same interface shows the evidence, body-region highlight, draft explanation,
  and coach approval before switching to a simplified client view
```

The smallest memorable loop is:

```text
1. Start a prepared elbow-flexion assessment.
2. Receive right and left force readings as an environmental event.
3. Capture one short spoken coach observation.
4. Calculate 20.8% asymmetry deterministically and flag it for monitoring.
5. Have the agent reconcile the reading with the observation and surface one clarification if needed.
6. Render a simple body-map highlight and evidence-backed explanation.
7. Let the coach edit or approve it.
8. Switch the same screen into the approved client view.
```

### Explicitly defer

- Direct VALD or force-frame API integration; use a transparent seeded event or CSV fixture.
- WhatsApp integration.
- Separate practitioner and client applications.
- Login and multi-user account infrastructure.
- Continuous longitudinal performance tracking.
- Exercise-video ingestion or generation.
- Camera-based posture or movement diagnosis.
- A full interactive 3D musculoskeletal model.
- Automatic rehabilitation programme changes.
- Multiple body regions in the live demo.

These can appear as future extensions after the demonstrated loop, but should not be partially implemented.

## Why this remains an embedded agent

The interface alone is not the environment claim. The claim is that the agent participates in the assessment event while its context is fresh: it knows the active test, receives bilateral readings, hears the practitioner observation, notices inconsistencies or missing information, and obtains professional approval before creating the shared record. Reproducing this in standalone chat would require the coach to reconstruct and transfer each piece after the session.

## Candidate concept template

For every candidate, answer:

- Who is it for?
- Where does the agent live?
- What naturally triggers it?
- What context does that environment give it?
- What does the agent actually do?
- What actions or tools can it use?
- What does the human control?
- Why is this better here than in ChatGPT?
- What is the memorable demo moment?
- What is the smallest version that can genuinely be built today?
- Which judging criteria does it score particularly strongly on?
- What are the main implementation risks?
