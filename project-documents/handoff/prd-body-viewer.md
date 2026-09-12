# PRD — Expanded Body and Camera Controls
Version: 1.0
Status: Accepted scope; not implemented
Date: 2026-09-12

## Job
Let me inspect the body from a useful angle without wrestling with the camera.

Progress rendering follows [Muscle progress view](prd-progress-view.md): colour complete mapped muscle meshes with anatomical boundaries, not soft regional patches. Muscle isolation remains deferred.

## BV-01 — Expand body
Provide Expand body in the embedded viewer. P0 expansion fills the application viewport, hiding surrounding navigation. Native browser fullscreen is optional, not required.

Maintain the same viewer instance where practical. Preserve selected region, camera position/target, annotations and active session on expand/exit. Resize rendering and picking coordinates to the actual canvas. Exit full screen remains visible; Escape closes a nested modal first, otherwise exits expanded mode. Restore keyboard focus to the expand control.

## BV-02 — Orientation presets
Visual cube buttons: Front, Back, Left, Right and two front three-quarter views. Accessible labels and hover/focus tooltips identify each orientation; avoid written “Iso left/right” buttons. User refinement accepted 2026-09-12.

Left/right always mean the body's anatomical sides. Camera conventions must be checked against labelled anatomy, not screen coordinates. Presets orient around the current focus target at the current useful framing distance. They do not change the selected region.

## BV-03 — Framing
Fit whole body frames the complete model at the current orientation and clears camera focus, not the selected annotation. Focus selected frames the validated selected region; disable it with an explanation when no supported selection exists. Zoom in/out remains available.

Agent Show update uses the same focus adapter. Ordinary presets, rotation, zoom and expand never invoke a model.

## BV-04 — Motion
Provide explicit Rotate/Pan modes for primary dragging. Right-drag and two-finger touch also pan. Panning changes the camera target and position together; switching modes must preserve pose and selected region.

Use a short smooth transition; respect reduced-motion preference. User drag or a new preset cancels the previous transition. No camera oscillation caused by simultaneous animations or agent actions.

## BV-05 — Expanded details
Selecting a marker opens a compact evidence drawer over one side. It can be closed without deselecting the region. Ensure focused anatomy remains visible beside/above the drawer. On small screens use a bottom sheet with reachable close/exit controls.

## Acceptance
- [ ] Embedded → expanded → embedded preserves selection and pose.
- [ ] Canvas resize keeps body proportions and hit testing correct.
- [ ] Front/back/left/right match anatomical orientation.
- [ ] Both isometric choices produce repeatable three-quarter views.
- [ ] Fit whole body and Focus selected produce distinct useful framing.
- [ ] Presets do not select a different region or alter records.
- [ ] Drag cancels movement; reduced motion avoids animated transitions.
- [ ] Escape/exit, focus restoration and detail-drawer close work.
- [ ] Expanding during recording preserves the recording and visible capture controls.
- [ ] Model calls are unnecessary for every manual camera control.

## P1/P2
Clickable orientation cube, top/bottom presets and native browser fullscreen are deferred. Labelled buttons deliver the required navigation first.
