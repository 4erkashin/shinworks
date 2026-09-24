import { defineConfig } from "vitest/config";

/**
 * CI and `pnpm test:unit` use this file only.
 * The default vitest.config.ts also loads the Storybook project,
 * which needs Playwright browsers and Storybook addons.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    name: "unit",
  },
});
