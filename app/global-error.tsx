/**
 * `"use client"` is required because Next.js runs this file in the browser.
 * It wraps the failed page, catches the throw, remembers that it happened,
 * and shows this screen instead.
 * A server-only file cannot do that.
 *
 * This is the last screen we can show when the root layout itself throws.
 * It replaces `layout.tsx`, so it must render `<html>` and `<body>`.
 * A nested `error.tsx` cannot catch layout errors.
 * `retry()` tries to render the app again.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error
 */
"use client";

import * as stylex from "@stylexjs/stylex";
import { clsx } from "clsx";
import { NextIntlClientProvider } from "next-intl";
import { useSyncExternalStore } from "react";

import en from "@/app/[locale]/messages/en.json";
import ptBR from "@/app/[locale]/messages/pt-BR.json";
import ru from "@/app/[locale]/messages/ru.json";
import uk from "@/app/[locale]/messages/uk.json";
import { globalStyles, htmlPropsForTheme } from "@/app/global-styles";
import { ErrorWidget } from "@/features/error-widget";
import enWidget from "@/features/error-widget/messages/en.json";
import ptBRWidget from "@/features/error-widget/messages/pt-BR.json";
import ruWidget from "@/features/error-widget/messages/ru.json";
import ukWidget from "@/features/error-widget/messages/uk.json";
import { routing } from "@/i18n/routing";
import { readCookie } from "@/lib/cookie";
import { themeFromCookie } from "@/theme/cookie";
import { jetbrainsMono, onest } from "@/theme/fonts";

import "./globals.css";

type AppLocale = (typeof routing.locales)[number];

/**
 * next-intl's default locale cookie.
 * Named here so the crashed tree does not import the middleware just to read a string.
 *
 * @see https://next-intl.dev/docs/routing/configuration#locale-cookie
 */
const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * next-intl is gone with the layout.
 * These are the Error strings from the locale-segment catalogs
 * so this page can still speak the user's language.
 */
const stringsByLocale = {
  en: en.Error,
  "pt-BR": ptBR.Error,
  ru: ru.Error,
  uk: uk.Error,
};

/**
 * The reference line lives in the widget's catalogs.
 * This screen replaces the layout, so next-intl is not already wrapped.
 */
const widgetMessagesByLocale = {
  en: enWidget,
  "pt-BR": ptBRWidget,
  ru: ruWidget,
  uk: ukWidget,
};

/**
 * Named and kept outside the component
 * so React sees the same function on every render.
 * Written inside, it would be a new function each time,
 * and React would stop listening and start listening again.
 *
 * @see https://react.dev/reference/react/useSyncExternalStore#my-subscribe-function-gets-called-after-every-re-render
 */
function ignoreStoreUpdates() {
  return () => {};
}

/**
 * A cookie or navigator.languages entry is a plain string.
 * TypeScript will not treat that string as exact locale key until something proves it.
 */
function isAppLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value);
}

/**
 * Turn a browser language tag into one of this app's locales.
 * Tries an exact match (`pt-BR`), then the language only (`en-US` → `en`),
 * then the same language with a different region (`pt-PT` → `pt-BR`).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages
 */
function matchAppLocale(languageTag: string): AppLocale | undefined {
  if (isAppLocale(languageTag)) {
    return languageTag;
  }

  const language = languageTag.split("-")[0];

  if (language && isAppLocale(language)) {
    return language;
  }

  if (!language) {
    return undefined;
  }

  return routing.locales.find((locale) => locale.startsWith(`${language}-`));
}

function readDocumentLocale() {
  const cookieLocale = readCookie(document.cookie, LOCALE_COOKIE);

  if (cookieLocale && isAppLocale(cookieLocale)) {
    return cookieLocale;
  }

  for (const languageTag of navigator.languages) {
    const matched = matchAppLocale(languageTag);

    if (matched) {
      return matched;
    }
  }

  return routing.defaultLocale;
}

export default function GlobalError({
  error,
  localeOverride,
  retry,
}: {
  error: Error & { digest?: string };
  // Storybook toolbar locale. Next.js never passes this.
  localeOverride?: AppLocale;
  retry: () => void;
}) {
  /**
   * Layout is gone, so we read the cookie and the browser language list here.
   * `useSyncExternalStore` splits server paint from the real browser read.
   * Subscribe is empty: we do not listen for cookie changes.
   */
  const theme = useSyncExternalStore(
    ignoreStoreUpdates,
    () => themeFromCookie(document.cookie),
    () => "system" as const,
  );

  // Cookie, then the browser language list. Server uses the default locale.
  const localeFromBrowser = useSyncExternalStore(
    ignoreStoreUpdates,
    readDocumentLocale,
    () => routing.defaultLocale,
  );

  const locale = localeOverride ?? localeFromBrowser;
  const strings = stringsByLocale[locale];

  const htmlProps = htmlPropsForTheme(theme);

  return (
    <html
      {...htmlProps}
      className={clsx(
        jetbrainsMono.variable,
        onest.variable,
        htmlProps.className,
      )}
      data-theme={theme}
      lang={locale}
    >
      <body {...stylex.props(globalStyles.body)}>
        <title>{strings.title}</title>

        <NextIntlClientProvider
          locale={locale}
          messages={widgetMessagesByLocale[locale]}
        >
          <ErrorWidget
            action={{
              kind: "button",
              label: strings.tryAgain,
              onPress: retry,
            }}
            description={strings.description}
            digest={error.digest}
            title={strings.title}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
