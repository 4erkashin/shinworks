"use client";

import { Button } from "@base-ui/react/button";
import * as stylex from "@stylexjs/stylex";
import { useTranslations } from "next-intl";
import { useSyncExternalStore, useTransition } from "react";

import { setTheme } from "@/theme/actions";
import { THEME_NAMES, type ThemeName } from "@/theme/cookie";
import { readHtmlTheme, subscribeHtmlTheme } from "@/theme/html-theme";
import { colors, fonts, grid, spacing } from "@/tokens/generated/tokens.stylex";

const styles = stylex.create({
  root: {
    display: "flex",
    fontFamily: fonts.mono,
    fontSize: `max(${grid.module} * 2, round(nearest, 2.5vw, ${spacing.px}))`,
  },
  item: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: `calc(${grid.module} * 11)`,
    minHeight: `calc(${grid.module} * 11)`,
    paddingBlock: "0.5em",
    paddingInline: "0.5em",
    font: "inherit",
    lineHeight: 1,
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    cursor: "pointer",
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  current: {
    color: colors.background,
    backgroundColor: colors.foreground,
  },
  rest: {
    color: {
      default: colors.foreground,
      ":hover": colors.background,
    },
    backgroundColor: {
      default: "transparent",
      ":hover": colors.foreground,
    },
  },
});

export function ThemeSwitcher({ style }: { style?: stylex.StyleXStyles }) {
  const t = useTranslations("Theme");
  const [, startTransition] = useTransition();
  const theme = useSyncExternalStore(
    subscribeHtmlTheme,
    readHtmlTheme,
    (): ThemeName => "system",
  );

  return (
    <div
      aria-label={t("label")}
      role="group"
      {...stylex.props(styles.root, style)}
    >
      {THEME_NAMES.map((item) => {
        const current = item === theme;

        return (
          <Button
            aria-current={current && "true"}
            key={item}
            nativeButton
            onClick={() => {
              startTransition(() => {
                void setTheme(item);
              });
            }}
            type="button"
            {...stylex.props(
              styles.item,
              current ? styles.current : styles.rest,
            )}
          >
            {t(item)}
          </Button>
        );
      })}
    </div>
  );
}
