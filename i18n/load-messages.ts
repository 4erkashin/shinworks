import type messages from "./catalogs/en";
import type { routing } from "./routing";

/**
 * One loader per locale. Each `import()` path is a static string,
 * so the bundler can see every catalog and still ship only the
 * locale this request asked for.
 *
 * Storybook does not use this map. It imports every locale up front
 * in `lib/storybook/messages-by-locale.ts`.
 */
export const messageLoaders = {
  en: () => import("./catalogs/en"),
  "pt-BR": () => import("./catalogs/pt-BR"),
  ru: () => import("./catalogs/ru"),
  uk: () => import("./catalogs/uk"),
} satisfies Record<
  (typeof routing.locales)[number],
  () => Promise<{ default: object }>
>;

export async function loadMessages(
  locale: (typeof routing.locales)[number],
): Promise<typeof messages> {
  const catalog = await messageLoaders[locale]();

  // English types every locale: same keys, ICU arguments from English.
  return catalog.default as typeof messages;
}
