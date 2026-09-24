import { register } from "@tokens-studio/sd-transforms";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";

import { FONT_MONO_VAR } from "./font-mono-var.ts";
import { FONT_SANS_VAR } from "./font-sans-var.ts";

register(StyleDictionary, { excludeParentKeys: true });

const root = path.dirname(fileURLToPath(import.meta.url));
const generatedDir = path.join(root, "generated");
const tokenSets = JSON.parse(
  await readFile(path.join(root, "tokens.json"), "utf8"),
);

/**
 * @param {string[]} sets
 * @returns {Promise<Map<string, string>>}
 */
async function resolveSets(sets) {
  /** @type {Map<string, string>} */
  const values = new Map();
  const formatName = `stylex/capture/${sets.join("+")}`;

  StyleDictionary.registerFormat({
    format: ({ dictionary }) => {
      for (const token of dictionary.allTokens) {
        const value = token.$value ?? token.value;
        const type = token.$type ?? token.type;
        values.set(token.path.join("."), stringifyValue(value, type));
      }
      return "";
    },
    name: formatName,
  });

  const sd = new StyleDictionary({
    log: { verbosity: "silent" },
    platforms: {
      capture: {
        buildPath: `${generatedDir}/`,
        files: [
          {
            destination: `.capture-${sets.join("-")}.txt`,
            format: formatName,
          },
        ],
        transformGroup: "tokens-studio",
      },
    },
    preprocessors: ["tokens-studio"],
    // Select sets before removing their wrappers; metadata is not token input.
    tokens: Object.fromEntries(
      sets.map((set) => {
        if (!tokenSets[set]) {
          throw new Error(`tokens/tokens.json must define the ${set} set`);
        }
        return [set, tokenSets[set]];
      }),
    ),
  });

  await sd.buildAllPlatforms();
  return values;
}

const reducedMotionQuery = "@media (prefers-reduced-motion: reduce)";
const moveDurationKey = "motion.duration.move";
const noneDurationKey = "motion.duration.none";

/**
 * Style Dictionary has no duration/css transform. DTCG duration objects and
 * cubic-bezier arrays have to become CSS here or the capture step writes
 * "[object Object]".
 *
 * @param {unknown} value
 * @param {unknown} type
 * @returns {string}
 */
function stringifyValue(value, type) {
  if (type === "duration") {
    return formatDuration(value);
  }
  if (type === "cubicBezier") {
    return formatCubicBezier(value);
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(String).join(", ");
  }
  return String(value);
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function formatDuration(value) {
  if (typeof value === "string") {
    return value;
  }
  if (
    value !== null &&
    typeof value === "object" &&
    "value" in value &&
    "unit" in value &&
    (value.unit === "ms" || value.unit === "s") &&
    typeof value.value === "number"
  ) {
    return `${value.value}${value.unit}`;
  }
  throw new Error(`Cannot format duration token: ${JSON.stringify(value)}`);
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function formatCubicBezier(value) {
  if (typeof value === "string") {
    return value;
  }
  if (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((point) => typeof point === "number")
  ) {
    return `cubic-bezier(${value.join(", ")})`;
  }
  throw new Error(`Cannot format cubicBezier token: ${JSON.stringify(value)}`);
}

/**
 * Motion tweens want seconds, not CSS time strings.
 *
 * @param {string} cssTime
 * @returns {number}
 */
function cssTimeToSeconds(cssTime) {
  if (cssTime.endsWith("ms")) {
    return Number(cssTime.slice(0, -2)) / 1000;
  }
  if (cssTime.endsWith("s")) {
    return Number(cssTime.slice(0, -1));
  }
  throw new Error(`Cannot parse CSS time: ${cssTime}`);
}

/**
 * Motion `ease` is a four-number bezier, not the CSS cubic-bezier() string.
 *
 * @param {string} cssEasing
 * @returns {number[]}
 */
function cubicBezierPoints(cssEasing) {
  const matched = /^cubic-bezier\((.+)\)$/.exec(cssEasing);
  if (!matched) {
    throw new Error(`Cannot parse cubic-bezier: ${cssEasing}`);
  }
  const points = matched[1].split(",").map((part) => Number(part.trim()));
  if (points.length !== 4 || points.some((point) => Number.isNaN(point))) {
    throw new Error(`Cannot parse cubic-bezier: ${cssEasing}`);
  }
  return points;
}

/**
 * @param {string} value
 * @returns {string}
 */
function jsString(value) {
  return JSON.stringify(value);
}

/**
 * @param {Map<string, string>} tokens
 * @param {string} prefix
 * @returns {string[]}
 */
function keysWithPrefix(tokens, prefix) {
  return [...tokens.keys()]
    .filter((key) => key.startsWith(`${prefix}.`))
    .sort();
}

/**
 * @param {string} key
 * @param {string} prefix
 * @returns {string}
 */
function leafName(key, prefix) {
  return key.slice(prefix.length + 1).replaceAll(".", "_");
}

/**
 * @param {Map<string, string>} tokens
 * @returns {string[]}
 */
function motionVarLines(tokens) {
  const keys = keysWithPrefix(tokens, "motion");
  if (keys.length === 0) {
    throw new Error(
      "tokens/tokens.json primitive set must define motion tokens",
    );
  }
  const none = tokens.get(noneDurationKey);
  if (!none) {
    throw new Error(
      "tokens/tokens.json primitive set must define motion.duration.none",
    );
  }

  return keys.map((key) => {
    const name = leafName(key, "motion");
    const value = tokens.get(key);
    if (key === moveDurationKey) {
      return `  ${name}: {
    default: ${jsString(value)},
    ${jsString(reducedMotionQuery)}: ${jsString(none)},
  },`;
    }
    return `  ${name}: ${jsString(value)},`;
  });
}

// Read declarations before set merging so primitives remain reference-only.
function semanticColorKeys(set) {
  const keys = [];
  function visit(group, prefix) {
    for (const [name, token] of Object.entries(group)) {
      if (name.startsWith("$")) continue;
      const key = `${prefix}.${name}`;
      if ("$value" in token) {
        keys.push(key);
      } else {
        visit(token, key);
      }
    }
  }
  visit(tokenSets[set].color ?? {}, "color");
  return keys.sort();
}

function varsFile(light, colorKeys) {
  const colorLines = colorKeys.map(
    (key) => `  ${leafName(key, "color")}: ${jsString(light.get(key))},`,
  );
  const spaceLines = keysWithPrefix(light, "space").map(
    (key) => `  ${leafName(key, "space")}: ${jsString(light.get(key))},`,
  );
  const fontLines = keysWithPrefix(light, "font").map(
    (key) => `  ${leafName(key, "font")}: ${jsString(light.get(key))},`,
  );
  if (!light.get("grid.module")) {
    throw new Error("tokens/tokens.json primitive set must define grid.module");
  }
  if (!light.get("grid.goldenRatio")) {
    throw new Error(
      "tokens/tokens.json primitive set must define grid.goldenRatio",
    );
  }
  const gridLines = keysWithPrefix(light, "grid").map(
    (key) => `  ${leafName(key, "grid")}: ${jsString(light.get(key))},`,
  );
  const motionLines = motionVarLines(light);

  return `/* Generated by tokens/build.js. Do not edit. */

import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
${colorLines.join("\n")}
});

export const fonts = stylex.defineVars({
${fontLines.join("\n")}
});

export const grid = stylex.defineVars({
${gridLines.join("\n")}
});

export const motion = stylex.defineVars({
${motionLines.join("\n")}
});

export const spacing = stylex.defineVars({
${spaceLines.join("\n")}
});
`;
}

/** Reduced-motion media query. */
function queriesFile() {
  return `/* Generated by tokens/build.js. Do not edit. */

import * as stylex from "@stylexjs/stylex";

export const queries = stylex.defineConsts({
  reducedMotion: ${jsString(reducedMotionQuery)},
});
`;
}

/**
 * @param {Map<string, string>} light
 * @param {Map<string, string>} dark
 * @param {string[]} colorKeys
 */
function themesFile(light, dark, colorKeys) {
  const lightOverrides = colorKeys.map(
    (key) => `  ${leafName(key, "color")}: ${jsString(light.get(key))},`,
  );
  const darkOverrides = colorKeys.map(
    (key) => `  ${leafName(key, "color")}: ${jsString(dark.get(key))},`,
  );
  const systemOverrides = colorKeys.map((key) => {
    const name = leafName(key, "color");
    return `  ${name}: {
    default: ${jsString(light.get(key))},
    "@media (prefers-color-scheme: dark)": ${jsString(dark.get(key))},
  },`;
  });

  return `/* Generated by tokens/build.js. Do not edit. */

import * as stylex from "@stylexjs/stylex";

import { colors } from "./tokens.stylex";

export const light = stylex.createTheme(colors, {
${lightOverrides.join("\n")}
});

export const dark = stylex.createTheme(colors, {
${darkOverrides.join("\n")}
});

export const system = stylex.createTheme(colors, {
${systemOverrides.join("\n")}
});

export const themes = { dark, light, system } as const;

export type ThemeName = keyof typeof themes;
`;
}

/**
 * Read a resolved dimension that must stay a whole CSS pixel.
 *
 * @param {Map<string, string>} tokens
 * @param {string} key
 * @returns {number}
 */
function cssPx(tokens, key) {
  const value = tokens.get(key);
  if (!value?.endsWith("px")) {
    throw new Error(`${key} must resolve to a px dimension, got ${value}`);
  }
  const px = Number(value.slice(0, -2));
  if (!Number.isInteger(px) || px <= 0) {
    throw new Error(`${key} must resolve to a positive whole px, got ${value}`);
  }
  return px;
}

/**
 * Named exact canvases for Storybook. Not StyleX: product UI does not
 * request a viewport token.
 *
 * @param {Map<string, string>} tokens
 * @returns {string}
 */
function viewportsFile(tokens) {
  const group = tokenSets.primitive.viewport;
  if (!group || typeof group !== "object") {
    throw new Error(
      "tokens/tokens.json primitive set must define viewport tokens",
    );
  }

  /** @type {string[]} */
  const entries = [];
  for (const [id, node] of Object.entries(group)) {
    if (id.startsWith("$")) continue;
    if (!node || typeof node !== "object" || Array.isArray(node)) {
      throw new Error(`viewport.${id} must be a group with width and height`);
    }
    const name = node.$description;
    if (typeof name !== "string" || name.length === 0) {
      throw new Error(`viewport.${id} must have a $description name`);
    }
    const width = cssPx(tokens, `viewport.${id}.width`);
    const height = cssPx(tokens, `viewport.${id}.height`);
    entries.push(`  {
    height: ${height},
    id: ${jsString(id)},
    name: ${jsString(name)},
    width: ${width},
  },`);
  }

  if (entries.length === 0) {
    throw new Error(
      "tokens/tokens.json primitive set must define at least one viewport",
    );
  }

  return `/* Generated by tokens/build.js. Do not edit. */

export const viewports = [
${entries.join("\n")}
] as const;

export type ViewportId = (typeof viewports)[number]["id"];
`;
}

/**
 * Canonical no-preference timings for Motion tweens. Reduced motion is
 * MotionConfig's job, not this file.
 *
 * @param {Map<string, string>} tokens
 * @returns {string}
 */
function motionTimeFile(tokens) {
  const fade = tokens.get("motion.duration.fade");
  const move = tokens.get("motion.duration.move");
  const easing = tokens.get("motion.easing.standard");
  if (!fade || !move || !easing) {
    throw new Error(
      "tokens/tokens.json primitive set must define motion.duration.fade, motion.duration.move, and motion.easing.standard",
    );
  }

  return `/* Generated by tokens/build.js. Do not edit. */

export const motionTime = {
  easingStandard: [${cubicBezierPoints(easing).join(", ")}],
  fade: ${cssTimeToSeconds(fade)},
  move: ${cssTimeToSeconds(move)},
} as const;
`;
}

const themedColorKeys = semanticColorKeys("light");
if (
  JSON.stringify(themedColorKeys) !== JSON.stringify(semanticColorKeys("dark"))
) {
  throw new Error("light and dark must declare the same semantic color paths");
}

const light = await resolveSets(["primitive", "light"]);
const dark = await resolveSets(["primitive", "dark"]);
/**
 * defineVars gets every color.* path (primitives plus semantics).
 * Themes remap only the light/dark semantic paths.
 */
const colorKeys = keysWithPrefix(light, "color");

const fontMono = light.get("font.mono");
if (!fontMono?.includes(`var(${FONT_MONO_VAR}`)) {
  throw new Error(
    `tokens/tokens.json primitive font.mono must include var(${FONT_MONO_VAR})`,
  );
}

const fontSans = light.get("font.sans");
if (!fontSans?.includes(`var(${FONT_SANS_VAR}`)) {
  throw new Error(
    `tokens/tokens.json primitive font.sans must include var(${FONT_SANS_VAR})`,
  );
}

/**
 * Skip the write when the bytes are already on disk. A no-op still updates
 * mtime, and Storybook watches these files, so a same-content write looks
 * like a token change and rebuilds the preview.
 *
 * @param {string} file
 * @param {string} contents
 */
async function writeIfChanged(file, contents) {
  try {
    const current = await readFile(file, "utf8");
    if (current === contents) return;
  } catch {
    // First run, or the file was deleted: write it.
  }
  await writeFile(file, contents);
}

await mkdir(generatedDir, { recursive: true });
await writeIfChanged(
  path.join(generatedDir, "tokens.stylex.ts"),
  varsFile(light, colorKeys),
);
await writeIfChanged(
  path.join(generatedDir, "queries.stylex.ts"),
  queriesFile(),
);
await writeIfChanged(
  path.join(generatedDir, "themes.ts"),
  themesFile(light, dark, themedColorKeys),
);
await writeIfChanged(
  path.join(generatedDir, "motion.ts"),
  motionTimeFile(light),
);
await writeIfChanged(
  path.join(generatedDir, "viewports.ts"),
  viewportsFile(light),
);
