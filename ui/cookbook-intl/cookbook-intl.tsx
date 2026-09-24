"use client";

import { Button } from "@base-ui/react/button";
import * as stylex from "@stylexjs/stylex";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import { colors, fonts, spacing } from "../../tokens/generated/tokens.stylex";

// Same instant every render. Switch the locale toolbar, not the clock.
const EXAMPLE_INSTANT = new Date("2026-09-09T16:00:00.000Z");

const styles = stylex.create({
  box: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
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
  button: {
    alignSelf: "flex-start",
    paddingBlock: spacing.xs,
    paddingInline: spacing.sm,
    font: "inherit",
    lineHeight: 1,
    color: colors.foreground,
    cursor: "pointer",
    outlineWidth: spacing.px,
    outlineStyle: "solid",
    outlineColor: {
      default: "transparent",
      ":focus-visible": colors.foreground,
    },
    outlineOffset: spacing.xxs,
    backgroundColor: "transparent",
    borderColor: colors.foreground,
    borderStyle: "solid",
    borderWidth: spacing.px,
  },
});

export function DateTime() {
  const format = useFormatter();

  return (
    <p {...stylex.props(styles.box)}>
      {format.dateTime(EXAMPLE_INSTANT, {
        dateStyle: "long",
        timeStyle: "short",
      })}
    </p>
  );
}

export function Plural() {
  const t = useTranslations("CookbookIntl");
  const [count, setCount] = useState(0);

  return (
    <div {...stylex.props(styles.box)}>
      <p>{t("itemCount", { count })}</p>
      <Button
        nativeButton
        onClick={() => setCount((value) => value + 1)}
        type="button"
        {...stylex.props(styles.button)}
      >
        {t("addItem")}
      </Button>
    </div>
  );
}
