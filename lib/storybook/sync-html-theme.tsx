import * as stylex from "@stylexjs/stylex";
import { type MouseEvent, type ReactNode } from "react";

import { htmlPropsForTheme } from "@/app/global-styles";
import { THEME_NAMES, type ThemeName } from "@/theme/cookie";
import { writeHtmlTheme } from "@/theme/html-theme";

const styles = stylex.create({
  /**
   * Click host only. A block box here is the flex child of
   * #storybook-root and sizes to the title, so main's flex-grow
   * never fills the sheet and place-self:center has no height.
   */
  sync: {
    display: "contents",
  },
});

function classesFrom(className: undefined | string): string[] {
  return className?.split(/\s+/).filter(Boolean) ?? [];
}

/**
 * Storybook has no layout re-render after the cookie write.
 * Paint the iframe html so the shipped switcher can show the
 * theme it just asked for.
 */
function paintStoryTheme(theme: ThemeName) {
  const html = document.documentElement;

  for (const name of THEME_NAMES) {
    const { className } = htmlPropsForTheme(name);
    const classes = classesFrom(className);

    if (classes.length > 0) {
      html.classList.remove(...classes);
    }
  }

  const { className, style } = htmlPropsForTheme(theme);
  const next = classesFrom(className);

  if (next.length > 0) {
    html.classList.add(...next);
  }

  if (style) {
    Object.assign(html.style, style);
  }

  writeHtmlTheme(theme);
}

export function SyncHtmlTheme({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div
      {...stylex.props(styles.sync)}
      onClickCapture={(event: MouseEvent<HTMLDivElement>) => {
        const host = event.currentTarget;
        const button = (event.target as HTMLElement).closest("button");

        if (!button || !host.contains(button)) {
          return;
        }

        const index = [...host.querySelectorAll("button")].indexOf(button);
        const name = THEME_NAMES[index];

        if (name) {
          paintStoryTheme(name);
        }
      }}
    >
      {children}
    </div>
  );
}
