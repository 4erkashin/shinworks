import { routing } from "../i18n/routing";
import { messagesByLocale } from "../lib/storybook/messages-by-locale";

/**
 * Adapter for `storybook-next-intl`, not a second translation source.
 *
 * The app loads one locale per request in `i18n/request.ts`
 * (`loadMessages` in `i18n/load-messages.ts`).
 * Stories are not requests, so that file cannot run here.
 *
 * The addon wants `{ defaultLocale, messagesByLocale }` and wraps each story
 * in `NextIntlClientProvider`. All locales are imported up front so the toolbar
 * can switch language without a server.
 *
 * `defaultLocale` comes from `i18n/routing.ts`. Locale keys and the
 * feature-local catalogs are checked in `i18n/catalogs.test.ts`.
 */
const nextIntl = {
  defaultLocale: routing.defaultLocale,
  messagesByLocale,
};

export default nextIntl;
