import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, expectTypeOf, test } from "vitest";

import { messagesByLocale } from "../lib/storybook/messages-by-locale";
import en from "./catalogs/en";
import { loadMessages, messageLoaders } from "./load-messages";
import { routing } from "./routing";

const repoRoot = path.join(import.meta.dirname, "..");

const skippedDirs = new Set([
  ".git",
  ".next",
  "build",
  "coverage",
  "node_modules",
  "out",
  "storybook-static",
]);

/**
 * Every `messages` folder under the repo, except build output.
 * Each one is the catalog for the page, feature, or component beside it.
 */
function catalogDirs(dir: string): string[] {
  const found: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || skippedDirs.has(entry.name)) {
      continue;
    }

    if (!entry.isDirectory()) {
      continue;
    }

    const full = path.join(dir, entry.name);

    if (entry.name === "messages") {
      found.push(full);
      continue;
    }

    found.push(...catalogDirs(full));
  }

  return found;
}

function localesIn(dir: string) {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.replace(/\.json$/, ""));
}

function readCatalog(file: string): Record<string, unknown> {
  return JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
}

// Dotted key paths, sorted, so locale files can be compared without values.
function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }

  const entries = Object.entries(value);

  if (entries.length === 0) {
    return [prefix];
  }

  return entries.flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

test("feature-local catalogs match locales, namespaces, and loaders", async () => {
  const expectedLocales = [...routing.locales].toSorted();
  const dirs = catalogDirs(repoRoot).toSorted();
  const namespaceOwners = new Map<string, string>();

  expect(dirs.length).toBeGreaterThan(0);
  expect(Object.keys(messageLoaders).toSorted()).toEqual(expectedLocales);
  expect(Object.keys(messagesByLocale).toSorted()).toEqual(expectedLocales);

  for (const dir of dirs) {
    const relativeDir = path.relative(repoRoot, dir);

    expect(localesIn(dir).toSorted(), relativeDir).toEqual(expectedLocales);

    const english = readCatalog(path.join(dir, "en.json"));
    const englishKeys = keyPaths(english).toSorted();

    for (const namespace of Object.keys(english)) {
      const previous = namespaceOwners.get(namespace);

      expect(
        previous,
        `${namespace} is in both ${previous} and ${relativeDir}`,
      ).toBeUndefined();
      namespaceOwners.set(namespace, relativeDir);
    }

    for (const locale of expectedLocales) {
      const catalog = readCatalog(path.join(dir, `${locale}.json`));

      expect(keyPaths(catalog).toSorted(), `${relativeDir} ${locale}`).toEqual(
        englishKeys,
      );
    }
  }

  for (const locale of routing.locales) {
    const merged: Record<string, unknown> = {};

    for (const dir of dirs) {
      Object.assign(merged, readCatalog(path.join(dir, `${locale}.json`)));
    }

    expect(await loadMessages(locale)).toEqual(merged);
    expect(messagesByLocale[locale]).toEqual(merged);
  }
});

expectTypeOf(en.CookbookIntl.itemCount).not.toEqualTypeOf<string>();
