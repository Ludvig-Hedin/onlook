# Canvas Style Inspector

The canvas editor now exposes a right-side `Styles` tab alongside `Chat`.

## What it adds

- A selection-aware inspector for layout, size, spacing, appearance, typography, and position controls.
- Direct style editing through the existing editor style pipeline, so inspector changes stay aligned with undo/redo, overlay state, and generated code updates.
- Single-selection drag support inside the canvas for:
  - Flow/layout elements through the existing reorder drag path.
  - Absolutely positioned elements through persisted `left` and `top` updates.

## Current limits

- Dragging only starts when the user drags an element that is already selected.
- Dragging is limited to a single selected element.
- Frame-level style editing is still out of scope for the right-side inspector.
- Position offsets are only editable for `absolute` and `fixed` positioned elements.
