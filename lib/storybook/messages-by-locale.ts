import en from "../../i18n/catalogs/en";
import ptBR from "../../i18n/catalogs/pt-BR";
import ru from "../../i18n/catalogs/ru";
import uk from "../../i18n/catalogs/uk";

/**
 * Every catalog, keyed by routing locale.
 * The app loads one locale per request in `i18n/load-messages.ts`.
 * Storybook has no request, so every language stays in memory.
 */
export const messagesByLocale = {
  en,
  "pt-BR": ptBR,
  ru,
  uk,
};
