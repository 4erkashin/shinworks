# Product design system

The vocabulary for the product's visual decisions. The look is editorial: typography and composition lead, while controls stay quiet until interaction.

## Tokens

**Primitive token**:
A named raw material such as a paint, spacing step, duration, or curve.
_Avoid_: foundation token, core token, palette (as a layer name)

**Module**:
The repeating length from which space, layout, and type dimensions are counted.
_Avoid_: unit, grid unit (as a product token), xs (for the step itself)

**Golden ratio**:
The unitless pairing factor between two sizes that should feel related rather than arbitrary.
_Avoid_: PHI, phi, φ (as the product name)

**Space**:
A named gap, padding, margin, or inset step from xxs through lg, plus the hairline step.
_Avoid_: module (as a space step)

**Viewport**:
A named exact width and height used to inspect composition. Phone SM and Phone MD are both viewports.
_Avoid_: rung, review size, layout breakpoint, device (as the object), story (as the object)

**Semantic token**:
A purpose name with a value in every theme. Today these are background, foreground, and primary.
_Avoid_: alias token, decision token (except in prose about token systems)

**Theme**:
A complete assignment of semantic colors: light or dark. System selects a theme from the user's preference; it is not a third theme.
_Avoid_: mode, color scheme (when referring to a named theme), token set (when referring to the assignment)

## Visual language

**Editorial look**:
A Swiss-influenced poster composition with brutalist restraint. Typography, grid, whitespace, scale contrast, and hard geometry carry the visual identity.
_Avoid_: dashboard, interface chrome, fake HUD, cyberpunk

**Typography**:
The primary source of hierarchy and visual character. Type may act as content, structure, or a large compositional form.
_Avoid_: treating every text element as ordinary UI copy

**Composition**:
The relationships created by alignment, scale, whitespace, cropping, and the page grid.
_Avoid_: component stack, filling space because it exists

**Quiet control**:
A control with low visual weight at rest and clear semantics, hit area, focus, and interaction feedback.
_Avoid_: invisible control, rounded SaaS control, generic segmented control

**Hit area**:
The pointer and touch target of a control. It can be larger than the visible glyph.
_Avoid_: hitbox, tap target (as the product name)

**Hairline**:
A one-pixel structural line used for separation, alignment, or a compact state cue.
_Avoid_: border as default decoration

**Cut**:
A simple hard-edged silhouette such as rect, slash, or tab. A cut is a deliberate compositional shape, not default control decoration.
_Avoid_: radius, rounded, chamfer (as the product name), polygon (as the product name)

**Invert**:
A foreground and background swap for the current option and for strong interaction feedback.
_Avoid_: highlight, tint, hover color

**Signal**:
A brief visual event that calls attention to a meaningful change. A signal is not ambient decoration.
_Avoid_: idle effect, visual noise

**Glitch**:
A short hard break in the image that then stops. It is a signal, not a resting state.
_Avoid_: noise, distortion (as the product name)

**Color split**:
Two accent colors offset from the source for a short signal, often paired with a glitch.
_Avoid_: chromatic aberration, RGB split, fringing

**Glitch color**:
The first accent channel of a color split.
_Avoid_: red channel

**Glitch pair**:
The second accent channel of a color split, offset in the opposite direction.
_Avoid_: blue channel
