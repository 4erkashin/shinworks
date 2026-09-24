# One Tokens Studio file, three sets, themes as color assignments

This record was first saved as 0001, the same number as product look. It is 0006 so each ADR has one number.

The Tokens Studio Starter plan can git-sync only one JSON file. Multi-file sync is Pro, not a requirement for layers. We keep `tokens/tokens.json` as that file, with sets `primitive`, `light`, and `dark`. `$themes` lists those two combos for Figma; `tokens/build.js` is what code trusts (primitive plus exactly one of light or dark).
