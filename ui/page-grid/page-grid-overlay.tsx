import * as stylex from "@stylexjs/stylex";

import { colors, fonts, spacing } from "@/tokens/generated/tokens.stylex";

import { PAGE_GRID_COLUMNS, pageGridStyles } from "./page-grid-root";

const lastLine = PAGE_GRID_COLUMNS + 1;

const tracks = Array.from({ length: PAGE_GRID_COLUMNS }, (_, index) => ({
  index: index + 1,
}));

const styles = stylex.create({
  layer: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    pointerEvents: "none",
  },
  cell: {
    position: "relative",
    minWidth: 0,
    borderInlineStartColor: `color-mix(in oklch, ${colors.flare} 40%, transparent)`,
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: spacing.px,
  },
  last: {
    borderInlineEndColor: `color-mix(in oklch, ${colors.flare} 40%, transparent)`,
    borderInlineEndStyle: "solid",
    borderInlineEndWidth: spacing.px,
  },
  fill: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  fillOdd: {
    backgroundColor: `color-mix(in oklch, ${colors.flare} 10%, transparent)`,
  },
  fillEven: {
    backgroundColor: `color-mix(in oklch, ${colors.flare} 20%, transparent)`,
  },
  chip: {
    position: "absolute",
    insetBlockStart: spacing.xs,
    zIndex: 1,
    paddingInline: spacing.xxs,
    fontFamily: fonts.mono,
    fontSize: "0.625rem",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1.2,
    color: colors.ink,
    whiteSpace: "nowrap",
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderStyle: "solid",
    borderWidth: spacing.px,
  },
  chipStart: {
    insetInlineStart: 0,
    transform: "translateX(-50%)",
  },
  chipEnd: {
    insetInlineEnd: 0,
  },
});

/**
 * Viewport ruler for the page grid. Same template as the page shell.
 * Does not receive clicks or take layout space.
 * Faint flare wash on every track; chips sit on CSS lines 1–13.
 */
export function PageGridOverlay() {
  return (
    <div aria-hidden {...stylex.props(pageGridStyles.root, styles.layer)}>
      {tracks.map((track) => {
        const isLast = track.index === PAGE_GRID_COLUMNS;

        return (
          <div
            key={track.index}
            {...stylex.props(styles.cell, isLast && styles.last)}
          >
            <span
              {...stylex.props(
                styles.fill,
                track.index % 2 === 0 ? styles.fillEven : styles.fillOdd,
              )}
            />
            <span {...stylex.props(styles.chip, styles.chipStart)}>
              {track.index}
            </span>
            {isLast ? (
              <span {...stylex.props(styles.chip, styles.chipEnd)}>
                {lastLine}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
