import { isThemeName, type ThemeName } from "./cookie";

export const HTML_THEME_ATTR = "data-theme";

export function readHtmlTheme(): ThemeName {
  const value =
    document.documentElement.getAttribute(HTML_THEME_ATTR) ?? undefined;
  return isThemeName(value) ? value : "system";
}

export function writeHtmlTheme(theme: ThemeName) {
  document.documentElement.setAttribute(HTML_THEME_ATTR, theme);
}

/**
 * Named and kept outside the component
 * so React sees the same function on every render.
 */
export function subscribeHtmlTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);

  observer.observe(document.documentElement, {
    attributeFilter: [HTML_THEME_ATTR],
    attributes: true,
  });

  return () => {
    observer.disconnect();
  };
}
