# Dimensions count from a rem module

Every length that should track type is a multiple of `grid.module` (`0.25rem`). Space and type multiply that length (`xs` is one module; `lg` is `{grid.module} * 8`). Product StyleX can use the module as a round step or a clamp term without attaching a unit at the call site. The 1px hairline stays `space.px` so borders do not go fractional when root type is not 16px.

## Considered options

**Unitless `4`.** Every caller had to attach rem or px. Mixing `× 1px` and `× N rem` drifted the used size.

**Pixel module (`4px`) or `{grid.module} * Npx`.** Gaps would stay put while type scaled, and a counted length such as `lg` would freeze in pixels.

**DTCG-only aliases.** The spec has references, not multiply. Tokens Studio math (`{grid.module} * 8`) is what this pipeline already evaluates.
