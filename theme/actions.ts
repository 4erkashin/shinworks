"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { isThemeName, THEME_COOKIE, type ThemeName } from "./cookie";

export async function setTheme(theme: ThemeName) {
  if (!isThemeName(theme)) {
    return;
  }

  const jar = await cookies();
  jar.set(THEME_COOKIE, theme, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
