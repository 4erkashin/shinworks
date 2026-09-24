import * as stylex from "@stylexjs/stylex";
import { type ReactNode } from "react";

import { queries } from "../../tokens/generated/queries.stylex";
import {
  colors,
  fonts,
  motion,
  spacing,
} from "../../tokens/generated/tokens.stylex";

const pulse = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0.5 },
});

const styles = stylex.create({
  box: {
    padding: spacing.md,
    margin: 0,
    fontFamily: fonts.sans,
    fontSize: "1rem",
    color: colors.foreground,
    backgroundColor: colors.background,
    borderColor: colors.foreground,
    borderStyle: "solid",
    borderWidth: spacing.px,
  },
  hover: {
    color: {
      default: colors.foreground,
      ":hover": colors.background,
    },
    backgroundColor: {
      default: colors.background,
      ":hover": colors.foreground,
    },
  },
  before: {
    "::before": {
      color: colors.foreground,
      content: '"→ "',
    },
  },
  pulseOnHover: {
    animationName: {
      default: "none",
      ":hover": pulse,
      [queries.reducedMotion]: "none",
    },
    animationDuration: motion.duration_move,
    animationTimingFunction: motion.easing_standard,
    animationIterationCount: "infinite",
  },
  supportsGrid: {
    display: {
      default: "block",
      "@supports (display: grid)": "grid",
    },
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.sm,
  },
});

function Demo({
  children,
  extra,
}: Readonly<{
  children: ReactNode;
  extra?: stylex.StyleXStyles;
}>) {
  return <div {...stylex.props(styles.box, extra)}>{children}</div>;
}

export function Before() {
  return <Demo extra={styles.before}>Generated marker.</Demo>;
}

export function Hover() {
  return <Demo extra={styles.hover}>Inverts under the pointer.</Demo>;
}

export function Keyframes() {
  return <Demo extra={styles.pulseOnHover}>Fades while hovered.</Demo>;
}

export function ReducedMotion() {
  return (
    <Demo extra={styles.pulseOnHover}>
      Same pulse. OS reduce-motion turns it off.
    </Demo>
  );
}

export function Supports() {
  return (
    <Demo extra={styles.supportsGrid}>
      <span>A</span>
      <span>B</span>
    </Demo>
  );
}
