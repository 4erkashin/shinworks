import { type routing } from "./routing";

/**
 * Short codes on the locale switcher (and Storybook captions).
 * Keys must cover every id in `routing.locales` — TypeScript
 * fails if a locale is added or dropped there without this map.
 */
export const localeLabels = {
  en: "EN",
  "pt-BR": "PT-BR",
  ru: "RU",
  uk: "UA",
} as const satisfies Record<(typeof routing.locales)[number], string>;
