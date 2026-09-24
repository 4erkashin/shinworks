import { cookies } from "next/headers";

import { isThemeName, THEME_COOKIE, type ThemeName } from "./cookie";

export async function getTheme(): Promise<ThemeName> {
  const jar = await cookies();
  const value = jar.get(THEME_COOKIE)?.value;
  return isThemeName(value) ? value : "system";
}
