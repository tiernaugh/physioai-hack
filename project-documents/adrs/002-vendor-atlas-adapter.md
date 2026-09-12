# ADR-002 — Vendor Atlas Behind a Region Adapter
Status: Accepted
Date: 2026-09-12

## Context
We need selectable anatomy without rebuilding a renderer. The current prototype directly selects the left hamstring only. Product evidence concerns broad regions and movements.

## Decision
Vendor a pinned Human Atlas renderer, helpers and necessary assets with upstream notices. Map stable product regions and explicit laterality to atlas IDs through a deterministic adapter. Keep upstream files separate from product logic.

## Alternatives
A whole-repository fork inherits unnecessary interface/tooling. Rebuilding selection wastes time. Extending the current hamstring-specialized mesh grouping may be more work than using upstream general selection.

## Consequences
Keep MIT code and CC BY 4.0 anatomy attribution. The model selects an allowed product region, never an arbitrary mesh. Reference anatomy is not a personal scan. Broad region support must be checked rather than inferred from an atlas name.

## Validation
Resolve and focus at least two required regions. Measure load, decoding and GPU performance on the presentation laptop. Same-device localhost assets do not traverse venue Wi-Fi.

Source: https://github.com/ashemag/human-atlas
