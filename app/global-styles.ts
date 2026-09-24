import * as stylex from "@stylexjs/stylex";

import { type ThemeName } from "@/theme/cookie";
import { themes } from "@/tokens/generated/themes";
import { colors, fonts } from "@/tokens/generated/tokens.stylex";

export const globalStyles = stylex.create({
  body: {
    /**
     * Lock the sheet to html. In-flow pages grow in this column.
     * The page grid overlay is position:fixed, so it is not a slot.
     */
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0,
    margin: 0,
    overflow: "hidden",
  },
  colorDark: {
    colorScheme: "dark",
  },
  colorLight: {
    colorScheme: "light",
  },
  colorSystem: {
    colorScheme: "light dark",
  },
  html: {
    /**
     * One dynamic viewport tall. Pages fill this canvas;
     * they do not each set 100dvh. Body owns the overflow lock.
     */
    height: "100dvh",
    fontFamily: fonts.sans,
    fontSize: "1rem",
    color: colors.foreground,
    backgroundColor: colors.background,
  },
});

/**
 * Class names to spread on `<html>` for one theme.
 * Sets the color tokens, page canvas (background and foreground),
 * the document font, and `color-scheme` so the browser's own widgets
 * (scrollbars, inputs) match light, dark, or the OS setting.
 */
export function htmlPropsForTheme(theme: ThemeName) {
  return stylex.props(
    themes[theme],
    globalStyles.html,
    theme === "light" && globalStyles.colorLight,
    theme === "dark" && globalStyles.colorDark,
    theme === "system" && globalStyles.colorSystem,
  );
}
