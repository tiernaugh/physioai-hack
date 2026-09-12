# Scope and Requirements
Status: Draft — selected direction; build lock pending validation

## P0 golden path
One client opens an existing body record, receives a region-linked coach update, explores its evidence and saves an observation in the same place.

- [ ] Body is the primary navigation, with working rotation/selection on the demo device.
- [ ] Prepared report and transcript generate two or three supported region annotations.
- [ ] A labelled incoming-note fixture triggers real source-to-region mapping against the existing assessment.
- [ ] A validated update appears at the relevant region with author, source and an unread indicator.
- [ ] “Show update” focuses that region and opens its evidence; opening marks it read.
- [ ] Earlier readings remain unchanged and replaying the same event does not duplicate the update.
- [ ] Selecting an annotation shows relevant evidence and source provenance.
- [ ] Guided walkthrough focuses the corresponding regions and can be stopped.
- [ ] Unknown or unmeasured regions do not imply normality or injury.
- [ ] Measurements, coach words, generated explanation and client notes are distinguishable.
- [ ] Client can preview, confirm, edit and delete a region-bound text observation.
- [ ] Saved note survives reload and retains exact wording, location and date.
- [ ] Reprocessing does not duplicate the assessment.
- [ ] Reset returns the demo to a known starting state.
- [ ] Model/viewer errors show an honest recoverable state.

## Fixture
Fictional client; de-identified supplied report; short explicitly fictional consultation excerpt consistent with it. Candidate regions: elbow measurement, hip measurement and ankle coach narrative. Do not invent an ankle force result or side. Confirm mappings before finalizing the demo.

Incoming fixture example: “Following up on the elbow-flexion comparison: let's track it at the next assessment.” Mark this as fictional coach text. After opening it, the client adds “This felt uncomfortable during training today.” Neither update implies a diagnosis or a new force measurement.

## Non-goals
Coach review dashboard, deliberate contradiction scenario, live audio or hardware, symptom diagnosis, exercise prescriptions, all anatomy structures, trend analytics, multiple accounts and automated sharing.

## Stretch
Voice note capture or a second assessment only after P0 is reliable.
