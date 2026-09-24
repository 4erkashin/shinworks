import { readCookie } from "../lib/cookie";

export const THEME_COOKIE = "theme";

export const THEME_NAMES = ["light", "dark", "system"] as const;

export type ThemeName = (typeof THEME_NAMES)[number];

export function isThemeName(value: undefined | string): value is ThemeName {
  return THEME_NAMES.some((name) => name === value);
}

export function themeFromCookie(source: string): ThemeName {
  const value = readCookie(source, THEME_COOKIE);
  return isThemeName(value) ? value : "system";
}
