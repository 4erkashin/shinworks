import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";

import { loadMessages } from "./load-messages";
import { routing } from "./routing";

/**
 * For each request, this file selects a valid locale and loads that
 * locale's merged catalog. Other locales stay out of the bundle.
 * If the locale is not valid, the file stops and shows not found.
 */
export default getRequestConfig(async ({ locale }) => {
  const resolved = locale ?? (await rootParams.locale());

  if (!hasLocale(routing.locales, resolved)) {
    notFound();
  }

  return {
    locale: resolved,
    messages: await loadMessages(resolved),
  };
});
