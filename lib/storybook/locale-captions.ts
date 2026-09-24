import { hasLocale } from "next-intl";

import { localeLabels } from "@/i18n/locale-labels";
import { routing } from "@/i18n/routing";

/**
 * Short labels for Storybook chrome (toolbar and tile captions).
 * Same map as the locale switcher. A missing id falls back to
 * the locale code.
 */
export function captionForLocale(locale: string): string {
  if (!hasLocale(routing.locales, locale)) {
    return locale;
  }

  return localeLabels[locale];
}
