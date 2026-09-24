# StyleX is the authoring surface

StyleX compiles tokens and styles; it is not a component library. Product UI uses `stylex.create` / `stylex.props` on the host element — native HTML for static markup, Base UI for interactive primitives (ADR-0003). We do not ship `Box`/`Text` wrappers. Native `className` stays only for infrastructure StyleX cannot own (today: next/font’s `--font-sans` and `--font-mono` on `<html>`). A constrained component API is allowed only when a shipped component earns it.
