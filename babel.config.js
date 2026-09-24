import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** Shared by Next Babel, PostCSS, and Storybook unplugin. */
export const stylexOptions = /** @type {const} */ ({
  aliases: {
    "@/*": [path.join(root, "*")],
  },
  dev: process.env.NODE_ENV !== "production",
  enableInlinedConditionalMerge: true,
  runtimeInjection: false,
  treeshakeCompensation: true,
  unstable_moduleResolution: {
    rootDir: root,
    type: "commonJS",
  },
});

export const stylexPlugin = ["@stylexjs/babel-plugin", stylexOptions];

/**
 * Unplugin calls Babel with `babelrc: false` but still loads this file.
 * `next/babel` then emits `@babel/runtime/helpers/esm/*`, which Vite 8 +
 * Babel 8 cannot resolve. Skip the preset when the caller is unplugin.
 */
export default function babelConfig(api) {
  const callerName = api.caller((caller) => caller?.name);
  api.cache.using(
    () => `${callerName ?? "unknown"}:${process.env.NODE_ENV ?? ""}`,
  );

  if (callerName === "@stylexjs/unplugin") {
    return { plugins: [], presets: [] };
  }

  return {
    plugins: [stylexPlugin],
    presets: ["next/babel"],
  };
}
