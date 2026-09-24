import type { CSSProperties } from "react";

import * as stylex from "@stylexjs/stylex";

import { colors, fonts, spacing } from "../../tokens/generated/tokens.stylex";
import tokens from "../../tokens/tokens.json";
import { groupPrimitiveColors } from "./primitive-color-groups";

const groups = groupPrimitiveColors(tokens.primitive.color);

export function ColorsPrimitive() {
  return (
    <div {...stylex.props(styles.swatches)}>
      {groups.map((group) => (
        <ul key={group[0].name} {...stylex.props(styles.group)}>
          {group.map((paint) => (
            <li key={paint.name} {...stylex.props(styles.chip)}>
              {/**
               * Chip size is 280px to match the caption line. stylex.props
               * cannot share an element with `style`, so the paint and
               * size stay on the host.
               */}
              <div
                style={
                  {
                    "--primitive-paint": paint.value,
                    height: 280,
                    width: 280,
                  } as CSSProperties
                }
              >
                <div {...stylex.props(styles.swatch)} />
              </div>
              <div {...stylex.props(styles.caption)}>
                <span>{paint.name}</span>
                <span {...stylex.props(styles.code)}>{paint.value}</span>
              </div>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

const styles = stylex.create({
  swatches: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
    fontFamily: fonts.sans,
    fontSize: "1rem",
  },
  group: {
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.sm,
    padding: 0,
    margin: 0,
    listStyleType: "none",
  },
  chip: {
    display: "flex",
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "column",
    gap: spacing.sm,
  },
  swatch: {
    inlineSize: "100%",
    blockSize: "100%",
    backgroundColor: "var(--primitive-paint)",
    borderColor: colors.foreground,
    borderStyle: "solid",
    borderWidth: spacing.px,
  },
  caption: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    color: colors.foreground,
  },
  code: {
    fontFamily: fonts.mono,
    color: colors.foreground,
    whiteSpace: "nowrap",
  },
});
