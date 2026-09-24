import type { StorybookConfig } from "@storybook/nextjs-vite";

import stylex from "@stylexjs/unplugin";
import autoprefixer from "autoprefixer";
import path from "node:path";
import { themes } from "storybook/theming";

// Relative path: Node loads this file, so @/ aliases do not work.
import { stylexOptions } from "../babel.config.js";
import { stylexConstsPreloadPlugin } from "./stylex-consts-preload.ts";

/**
 * Paint manager <html> from Storybook's light/dark appBg before
 * manager.ts runs, so the shell is not white while JS loads.
 * Follows the OS only. manager.ts then applies the same OS theme
 * to the shell and the desk around the iframe.
 *
 * Dark is Storybook's gray, not the app's dark page, so the shell
 * and the story do not blend into one block of color.
 */
function appendShellFirstPaint(head: undefined | string = ""): string {
  const css = `html {
  background-color: ${themes.light.appBg};
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  html {
    background-color: ${themes.dark.appBg};
    color-scheme: dark;
  }
}`;

  return `${head}<style>${css}</style>`;
}

const config: StorybookConfig = {
  // Package names, not file paths. Storybook loads them from node_modules.
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
    "@storybook/addon-themes",
    "msw-storybook-addon",
    "storybook-next-intl",
  ],
  framework: "@storybook/nextjs-vite",
  managerHead: appendShellFirstPaint,
  staticDirs: ["../public"],
  stories: [
    "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../features/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../ui/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  /**
   * Storybook's last chance to change the Vite config before the bundler starts.
   *
   * Storybook already builds a Vite config from the rest of this file
   * (`framework`, `addons`, `stories`, and so on). Then it calls this hook
   * and passes that config in as `viteConfig`.
   *
   * `async` lets us load Vite only when Storybook calls this hook,
   * instead of importing it at the top of the file.
   *
   * We add PostCSS with Autoprefixer.
   * We add a preload plugin that compiles generated StyleX consts
   * before `/virtual:stylex.css`.
   * We add the StyleX Vite plugin (same options as `babel.config.js`, plus CSS layers).
   * The preload plugin must stay first.
   *
   * Without this hook, Storybook still starts,
   * but StyleX styles and Autoprefixer do not run.
   */
  async viteFinal(viteConfig) {
    const { loadEnv, mergeConfig } = await import("vite");
    const repoRoot = path.join(import.meta.dirname, "..");
    /**
     * Storybook's Vite bundle needs the same public URLs during local
     * development and static production builds.
     */
    const mode =
      process.env.NODE_ENV === "production" ? "production" : "development";
    const fileEnv = loadEnv(mode, repoRoot, "");
    const storybookUrl =
      process.env.STORYBOOK_URL || fileEnv.STORYBOOK_URL || "";
    const storybookOgBaseUrl =
      process.env.STORYBOOK_OG_BASE_URL ||
      fileEnv.STORYBOOK_OG_BASE_URL ||
      "http://localhost:3000";

    return mergeConfig(viteConfig, {
      css: {
        postcss: {
          plugins: [autoprefixer()],
        },
      },
      define: {
        "process.env.STORYBOOK_OG_BASE_URL": JSON.stringify(storybookOgBaseUrl),
        "process.env.STORYBOOK_URL": JSON.stringify(storybookUrl),
      },
      plugins: [
        stylexConstsPreloadPlugin(),
        stylex.vite({
          ...stylexOptions,
          useCSSLayers: true,
        }),
      ],
    });
  },
};
export default config;
