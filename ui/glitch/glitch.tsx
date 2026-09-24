"use client";

import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { queries } from "@/tokens/generated/queries.stylex";
import { colors, motion, spacing } from "@/tokens/generated/tokens.stylex";

import { glitchPlay } from "./glitch-play.stylex";

const bandCount = 5;
const gapMin = 40;
const gapSpan = 860;

/**
 * lg is listed once so a large tear is rarer than the small ones.
 */
const throwBag = ["xs", "sm", "md", "xs", "sm", "md", "lg"] as const;

export type GlitchProps = {
  active?: boolean;
  children: ReactNode;
  /**
   * Cyan and flare copies of the text.
   * They show only while a slice is moving.
   */
  colorSplit?: boolean;
};
type Side = "left" | "right";

type Tear = {
  band: number;
  reach: Throw;
  side: Side;
};

type Throw = (typeof throwBag)[number];

function pickThrow() {
  return throwBag[Math.floor(Math.random() * throwBag.length)] ?? "xs";
}

function pickGap() {
  return gapMin + Math.random() * gapSpan;
}

/**
 * Two different bands. Bands from the last burst are skipped when
 * two others are still free.
 */
function pickTwoBands(blocked: readonly number[]) {
  const open: number[] = [];

  for (let index = 0; index < bandCount; index += 1) {
    if (!blocked.includes(index)) {
      open.push(index);
    }
  }

  const pool = open.length >= 2 ? open : [0, 1, 2, 3, 4];
  const first = pool[Math.floor(Math.random() * pool.length)] ?? 0;
  const rest = pool.filter((band) => band !== first);
  const second = rest[Math.floor(Math.random() * rest.length)] ?? 0;

  return [first, second] as const;
}

/**
 * The two slices move opposite ways in the same burst.
 */
function makeTears(blocked: readonly number[]): [Tear, Tear] {
  const [first, second] = pickTwoBands(blocked);
  const side: Side = Math.random() < 0.5 ? "left" : "right";

  return [
    { band: first, reach: pickThrow(), side },
    {
      band: second,
      reach: pickThrow(),
      side: side === "left" ? "right" : "left",
    },
  ];
}

function SplitText({
  children,
  colorSplit,
}: {
  children: ReactNode;
  colorSplit: boolean;
}) {
  if (!colorSplit) {
    return children;
  }

  return (
    <span {...stylex.props(styles.splitHost)}>
      <span aria-hidden {...stylex.props(styles.ghost, styles.splitCyan)}>
        {children}
      </span>
      <span aria-hidden {...stylex.props(styles.ghost, styles.splitFlare)}>
        {children}
      </span>
      {children}
    </span>
  );
}

export function Glitch({
  active = false,
  children,
  colorSplit = false,
}: GlitchProps) {
  const on = useRef(false);
  const wait = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blocked = useRef<number[]>([]);
  const [burst, setBurst] = useState(0);
  const [tears, setTears] = useState<null | [Tear, Tear]>(null);
  const playing = active && burst > 0;
  const lead = tears?.[0].band ?? -1;
  const clips = [
    styles.fifths0,
    styles.fifths1,
    styles.fifths2,
    styles.fifths3,
    styles.fifths4,
  ];
  const moving = new Map<number, Tear>();

  if (tears) {
    moving.set(tears[0].band, tears[0]);
    moving.set(tears[1].band, tears[1]);
  }

  function clearWait() {
    if (wait.current === null) {
      return;
    }

    clearTimeout(wait.current);
    wait.current = null;
  }

  function fire() {
    const next = makeTears(blocked.current);
    blocked.current = [next[0].band, next[1].band];
    setTears(next);
    setBurst((count) => count + 1);
  }

  function restThenFire() {
    setBurst(0);
    clearWait();
    wait.current = setTimeout(() => {
      wait.current = null;

      if (!on.current) {
        return;
      }

      fire();
    }, pickGap());
  }

  useEffect(() => {
    on.current = active;

    if (!active) {
      blocked.current = [];
      clearWait();
      const stop = window.setTimeout(() => {
        setBurst(0);
      }, 0);

      return () => {
        window.clearTimeout(stop);
      };
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const start = window.setTimeout(() => {
      fire();
    }, 0);

    return () => {
      window.clearTimeout(start);
      clearWait();
    };
  }, [active]);

  return (
    <span {...stylex.props(styles.host)}>
      <span {...stylex.props(styles.sizer)}>
        <SplitText colorSplit={colorSplit}>{children}</SplitText>
      </span>
      {clips.map((clip, index) => {
        const tear = moving.get(index);

        return (
          <span
            aria-hidden
            key={`${burst}-${index}`}
            onAnimationEnd={() => {
              if (!on.current || index !== lead) {
                return;
              }

              restThenFire();
            }}
            {...stylex.props(
              styles.layer,
              clip,
              playing && tear && glitchPlay,
              playing &&
                tear &&
                (tear.side === "right"
                  ? playRight[tear.reach]
                  : playLeft[tear.reach]),
            )}
          >
            <SplitText colorSplit={colorSplit}>{children}</SplitText>
          </span>
        );
      })}
    </span>
  );
}

/**
 * One burst jumps to a distance, then to a different distance, then back.
 * The second stop stays small unless the first stop is already lg.
 */
const sliceRightXs = stylex.keyframes({
  "0%": { transform: "translateX(0)" },
  "30%": { transform: `translateX(${spacing.xs})` },
  "62%": { transform: `translateX(${spacing.md})` },
  "100%": { transform: "translateX(0)" },
});

const sliceRightSm = stylex.keyframes({
  "0%": { transform: "translateX(0)" },
  "30%": { transform: `translateX(${spacing.sm})` },
  "62%": { transform: `translateX(${spacing.xs})` },
  "100%": { transform: "translateX(0)" },
});

const sliceRightMd = stylex.keyframes({
  "0%": { transform: "translateX(0)" },
  "30%": { transform: `translateX(${spacing.md})` },
  "62%": { transform: `translateX(${spacing.sm})` },
  "100%": { transform: "translateX(0)" },
});

const sliceRightLg = stylex.keyframes({
  "0%": { transform: "translateX(0)" },
  "30%": { transform: `translateX(${spacing.lg})` },
  "62%": { transform: `translateX(${spacing.md})` },
  "100%": { transform: "translateX(0)" },
});

const sliceLeftXs = stylex.keyframes({
  "0%": { transform: "translateX(0)" },
  "30%": { transform: `translateX(calc(-1 * ${spacing.xs}))` },
  "62%": { transform: `translateX(calc(-1 * ${spacing.md}))` },
  "100%": { transform: "translateX(0)" },
});

const sliceLeftSm = stylex.keyframes({
  "0%": { transform: "translateX(0)" },
  "30%": { transform: `translateX(calc(-1 * ${spacing.sm}))` },
  "62%": { transform: `translateX(calc(-1 * ${spacing.xs}))` },
  "100%": { transform: "translateX(0)" },
});

const sliceLeftMd = stylex.keyframes({
  "0%": { transform: "translateX(0)" },
  "30%": { transform: `translateX(calc(-1 * ${spacing.md}))` },
  "62%": { transform: `translateX(calc(-1 * ${spacing.sm}))` },
  "100%": { transform: "translateX(0)" },
});

const sliceLeftLg = stylex.keyframes({
  "0%": { transform: "translateX(0)" },
  "30%": { transform: `translateX(calc(-1 * ${spacing.lg}))` },
  "62%": { transform: `translateX(calc(-1 * ${spacing.md}))` },
  "100%": { transform: "translateX(0)" },
});

const styles = stylex.create({
  fifths0: {
    clipPath: "inset(0 0 80% 0)",
  },
  fifths1: {
    clipPath: "inset(20% 0 60% 0)",
  },
  fifths2: {
    clipPath: "inset(40% 0 40% 0)",
  },
  fifths3: {
    clipPath: "inset(60% 0 20% 0)",
  },
  fifths4: {
    clipPath: "inset(80% 0 0 0)",
  },
  ghost: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    zIndex: -1,
    display: {
      default: "block",
      [queries.reducedMotion]: "none",
    },
    pointerEvents: "none",
    opacity: {
      default: 0,
      [stylex.when.ancestor(":is(*)", glitchPlay)]: 0.8,
    },
  },
  host: {
    position: "relative",
    display: "inline-block",
    gap: "inherit",
  },
  layer: {
    position: "absolute",
    inset: 0,
    display: "inline-flex",
    gap: "inherit",
    alignItems: "center",
    pointerEvents: "none",
  },
  playLeftLg: {
    animationName: {
      default: sliceLeftLg,
      [queries.reducedMotion]: "none",
    },
    animationDuration: motion.duration_fade,
    animationTimingFunction: "step-end",
    animationIterationCount: 1,
  },
  playLeftMd: {
    animationName: {
      default: sliceLeftMd,
      [queries.reducedMotion]: "none",
    },
    animationDuration: motion.duration_fade,
    animationTimingFunction: "step-end",
    animationIterationCount: 1,
  },
  playLeftSm: {
    animationName: {
      default: sliceLeftSm,
      [queries.reducedMotion]: "none",
    },
    animationDuration: motion.duration_fade,
    animationTimingFunction: "step-end",
    animationIterationCount: 1,
  },
  playLeftXs: {
    animationName: {
      default: sliceLeftXs,
      [queries.reducedMotion]: "none",
    },
    animationDuration: motion.duration_fade,
    animationTimingFunction: "step-end",
    animationIterationCount: 1,
  },
  playRightLg: {
    animationName: {
      default: sliceRightLg,
      [queries.reducedMotion]: "none",
    },
    animationDuration: motion.duration_fade,
    animationTimingFunction: "step-end",
    animationIterationCount: 1,
  },
  playRightMd: {
    animationName: {
      default: sliceRightMd,
      [queries.reducedMotion]: "none",
    },
    animationDuration: motion.duration_fade,
    animationTimingFunction: "step-end",
    animationIterationCount: 1,
  },
  playRightSm: {
    animationName: {
      default: sliceRightSm,
      [queries.reducedMotion]: "none",
    },
    animationDuration: motion.duration_fade,
    animationTimingFunction: "step-end",
    animationIterationCount: 1,
  },
  playRightXs: {
    animationName: {
      default: sliceRightXs,
      [queries.reducedMotion]: "none",
    },
    animationDuration: motion.duration_fade,
    animationTimingFunction: "step-end",
    animationIterationCount: 1,
  },
  sizer: {
    display: "inline-flex",
    gap: "inherit",
    alignItems: "center",
    opacity: 0,
  },
  splitCyan: {
    color: colors.cyan,
    transform: {
      default: `translate(${spacing.px}, calc(-1 * ${spacing.px}))`,
      [stylex.when.ancestor(":is(*)", glitchPlay)]:
        `translate(${spacing.xs}, calc(-1 * ${spacing.xs}))`,
    },
  },
  splitFlare: {
    color: colors.flare,
    transform: {
      default: `translate(calc(-1 * ${spacing.px}), ${spacing.px})`,
      [stylex.when.ancestor(":is(*)", glitchPlay)]:
        `translate(calc(-1 * ${spacing.xs}), ${spacing.xs})`,
    },
  },
  splitHost: {
    position: "relative",
    display: "inline-block",
    maxWidth: "100%",
    isolation: "isolate",
  },
});

const playLeft = {
  lg: styles.playLeftLg,
  md: styles.playLeftMd,
  sm: styles.playLeftSm,
  xs: styles.playLeftXs,
};

const playRight = {
  lg: styles.playRightLg,
  md: styles.playRightMd,
  sm: styles.playRightSm,
  xs: styles.playRightXs,
};
