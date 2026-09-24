import { JetBrains_Mono, Onest } from "next/font/google";

import type { FontMonoVar } from "@/tokens/font-mono-var";
import type { FontSansVar } from "@/tokens/font-sans-var";

/**
 * Next preloads every name in `subsets`. That is a first-paint hint,
 * not the list of scripts we can still paint. Cyrillic and latin-ext
 * stay in the generated CSS (`unicode-range`) and the browser fetches
 * them when those glyphs appear.
 */
export const jetbrainsMono = JetBrains_Mono({
  /**
   * `--font-mono` is on <html> for tokens. Home does not paint this
   * face at first load, so a preload makes Chrome warn.
   */
  preload: false,
  subsets: ["latin"],
  variable: "--font-mono" satisfies FontMonoVar,
  weight: "variable",
});

export const onest = Onest({
  /**
   * Next would preload the latin file. Chrome still reports it unused:
   * the hint lands as a late preload, and painted type reaches Onest
   * through tokens / inheritance, not as a use of that URL. Skip the
   * hint; `@font-face` still loads the file when glyphs need it.
   */
  preload: false,
  subsets: ["latin"],
  variable: "--font-sans" satisfies FontSansVar,
  weight: "variable",
});
