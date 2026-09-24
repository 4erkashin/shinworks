import { expect, test } from "vitest";

import { routing } from "../i18n/routing";
import nextIntl from "./next-intl";

/**
 * The addon locale map and `i18n/routing.ts` must be the same set.
 * Namespace parity for the feature-local catalogs lives in
 * `i18n/catalogs.test.ts`.
 */
test("Storybook locales match i18n/routing.ts", () => {
  const expected = [...routing.locales].toSorted();

  expect(Object.keys(nextIntl.messagesByLocale).toSorted()).toEqual(expected);
});
