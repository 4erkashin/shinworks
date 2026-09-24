import { type ReactNode, useLayoutEffect } from "react";

import { htmlPropsForTheme } from "@/app/global-styles";
import { type ThemeName } from "@/theme/cookie";
import { jetbrainsMono, onest } from "@/theme/fonts";
import { writeHtmlTheme } from "@/theme/html-theme";

/**
 * Problem: the app paints theme on document `<html>` in layout.tsx
 * (`htmlPropsForTheme`: StyleX class + inline tokens / color-scheme,
 * font CSS variables, `data-theme`). Stories do not use that layout.
 * They run in Storybook's preview iframe — a blank page. A decorator
 * `<div>` only colors its own box; the rest of the iframe stays the
 * browser default (light). Storybook's theme addon can set a class or
 * `data-theme` on `<html>`, not StyleX's class-plus-inline-style map,
 * and not the font variables.
 *
 * Solution: copy the same writes the layout does onto this iframe's
 * `<html>`. Toolbar name comes from preview.tsx; this file only
 * applies it.
 *
 * First paint (OS `color-scheme`, loading sheet) is preview-head.html.
 * The gray desk around the iframe is manager.ts — a different document.
 *
 * Switching stories unmounts this component and mounts a new one.
 * A layout-effect cleanup would strip `<html>` first; until the new
 * effect runs, the page has no color-scheme, and at night the canvas
 * is white. So we never undo on unmount. We keep the last write in
 * `lastHtmlTheme` (module scope, not React state) and the next mount
 * replaces it in one shot.
 *
 * `useLayoutEffect` runs before the browser paints, so the first
 * themed frame is not a flash of the OS first-paint layer.
 */

/**
 * Last classes and inline styles we put on the iframe `<html>`.
 * Next `ThemeHtml` reads this and replaces them; nothing clears
 * `<html>` in between.
 */
let lastHtmlTheme: null | {
  classes: string[];
  style: object;
} = null;

/**
 * StyleX returns every class in one string (`"a b c"`).
 * `classList.add` / `remove` need each name as its own argument.
 */
function splitClassNames(className: undefined | string): string[] {
  const trimmed = className?.trim();
  if (!trimmed) {
    return [];
  }

  return trimmed.split(/\s+/);
}

/**
 * StyleX put these on `<html>` with Object.assign, using JS names
 * (`colorScheme`, not `color-scheme`). Clear them the same way, with
 * an empty string. Names that start with `--` only come off with
 * `removeProperty`.
 */
function clearHtmlInlineStyles(html: HTMLElement, written: object) {
  for (const name of Object.keys(written)) {
    if (name.startsWith("--")) {
      html.style.removeProperty(name);
    } else {
      Object.assign(html.style, { [name]: "" });
    }
  }
}

function replaceHtmlClasses(
  html: HTMLElement,
  previous: string[],
  next: string[],
) {
  if (previous.length > 0) {
    html.classList.remove(...previous);
  }

  if (next.length > 0) {
    html.classList.add(...next);
  }
}

/**
 * Take the last theme off `<html>`, put this one on, remember it.
 * `data-theme` is writeHtmlTheme — same attribute the app uses.
 */
function applyThemeToHtml(theme: ThemeName) {
  const html = document.documentElement;
  const { className, style } = htmlPropsForTheme(theme);

  /**
   * StyleX theme classes, plus Next font variable classes so
   * `font-family: var(--font-…)` on `<html>` has something to read.
   */
  const classes = [
    ...splitClassNames(className),
    jetbrainsMono.variable,
    onest.variable,
  ].filter((name) => name !== "");

  const inlineStyle = style ?? {};
  const previous = lastHtmlTheme;

  replaceHtmlClasses(html, previous?.classes ?? [], classes);
  if (previous) {
    clearHtmlInlineStyles(html, previous.style);
  }

  Object.assign(html.style, inlineStyle);
  writeHtmlTheme(theme);
  lastHtmlTheme = { classes, style: inlineStyle };
}

export function ThemeHtml({
  children,
  theme,
}: Readonly<{
  children: ReactNode;
  theme: ThemeName;
}>) {
  useLayoutEffect(() => {
    applyThemeToHtml(theme);
  }, [theme]);

  return children;
}
