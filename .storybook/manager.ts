import { addons } from "storybook/manager-api";
import { getPreferredColorScheme, themes } from "storybook/theming";

/**
 * Paint the sidebar, toolbar, panels, and the area around the story
 * to match the operating system's light/dark setting. The story itself
 * lives in a separate page; preview.tsx colors that from the toolbar.
 *
 * Storybook does not always update when the operating system switches
 * light/dark, and the area around the story stays white by default.
 * This file sets those colors and listens for the switch.
 *
 * Dark is Storybook's gray, not the app's dark page, so the shell
 * and the story do not blend into one block of color.
 */
function applyShell() {
  const mode = getPreferredColorScheme();
  const base = mode === "dark" ? themes.dark : themes.light;
  /**
   * appPreviewBg is the area around the iframe, not the story.
   * Match appBg so that surround matches the rest of the shell.
   */
  const theme = { ...base, appPreviewBg: base.appBg };
  const html = document.documentElement;

  /**
   * main.ts already set <html> background from the OS (inline CSS,
   * before this file ran). Keep the inline color in lockstep when
   * the OS flips without a reload.
   */
  html.style.backgroundColor = theme.appBg;
  html.style.colorScheme = mode;

  addons.setConfig({ theme });
}

applyShell();

const osDark = window.matchMedia("(prefers-color-scheme: dark)");
osDark.addEventListener("change", applyShell);
