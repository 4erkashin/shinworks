import stylex from "@stylexjs/eslint-plugin";
import pluginQuery from "@tanstack/eslint-plugin-query";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import perfectionist from "eslint-plugin-perfectionist";
import sonarjs from "eslint-plugin-sonarjs";
import storybook from "eslint-plugin-storybook";
import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";

/**
 * Absolute path to a top-level layer directory (`ui`, `features`, `domain`).
 * `import/no-restricted-paths` resolves relative zone paths against the cwd, so
 * `"./ui"` would silently match nothing whenever eslint runs from anywhere but
 * the repo root. Anchoring to this file keeps the zones enforced regardless.
 */
const absoluteLayerPath = (dir) => path.join(import.meta.dirname, dir);

/** Destination ownership stays out of `ui/` (callers pass typed href). */
const uiDestinationOwnershipSyntax = [
  {
    message:
      "ui/ must not hardcode in-app destinations. Accept href from the app/ or features/ caller.",
    selector:
      "JSXAttribute[name.name='href'][value.type='Literal'][value.value=/^\\//]",
  },
  {
    message:
      "ui/ must not hardcode in-app destinations. Accept href from the app/ or features/ caller.",
    selector:
      "JSXAttribute[name.name='href'] > JSXExpressionContainer > Literal[value=/^\\//]",
  },
  {
    message:
      "ui/ must not hardcode in-app destinations. Accept href from the app/ or features/ caller.",
    selector:
      "JSXAttribute[name.name='href'] > JSXExpressionContainer > TemplateLiteral[quasis.0.value.raw=/^\\//]",
  },
];

const adrRules = {
  "@typescript-eslint/consistent-type-imports": [
    "error",
    {
      /**
       * Keeps `typeof import("…")` legal
       * (e.g. naming a module in a type annotation)
       */

      disallowTypeAnnotations: false,
      fixStyle: "inline-type-imports",
    },
  ],
  /**
   * Stops anything under `ui/` importing from `features/` or `domain/`
   * `ui/` is generic look; whatever knows about the product is a feature,
   * and `app/` is where the two get composed
   * Every import is followed to the file it actually lands on,
   * so a relative `../features/...` cannot sneak past either
   */
  "import/no-restricted-paths": [
    "error",
    {
      zones: [
        {
          from: absoluteLayerPath("features"),
          message:
            "ui/ must not import features. Compose the feature at the app/ call site instead.",
          target: absoluteLayerPath("ui"),
        },
        {
          from: absoluteLayerPath("domain"),
          message:
            "ui/ must not import domain. Keep domain vocabulary out of ui/.",
          target: absoluteLayerPath("ui"),
        },
      ],
    },
  ],
};

/**
 * Sonar reader pack: how hard a function is to follow, plus copy-paste
 * control flow. Not the full SonarJS recommended set. Threshold 15 is
 * Sonar's Cognitive Complexity default. Rewrite until a reader can
 * follow the function — do not disable these to go green.
 */
const readerPackRules = {
  "sonarjs/cognitive-complexity": ["error", 15],
  "sonarjs/no-all-duplicated-branches": "error",
  "sonarjs/no-duplicated-branches": "error",
  "sonarjs/no-identical-conditions": "error",
  "sonarjs/no-identical-expressions": "error",
  "sonarjs/no-identical-functions": "error",
  "sonarjs/no-nested-assignment": "error",
  "sonarjs/no-nested-conditional": "error",
  "sonarjs/no-nested-template-literals": "error",
};

const sortingRules = {
  "perfectionist/sort-imports": [
    "error",
    {
      customGroups: [
        {
          elementNamePattern: "\\.svg$",
          groupName: "svg",
        },
      ],
      groups: [
        "type-import",
        ["value-builtin", "value-external"],
        "type-internal",
        "value-internal",
        "svg",
        ["type-parent", "type-sibling", "type-index"],
        ["value-parent", "value-sibling", "value-index"],
        "ts-equals-import",
        "unknown",
        ["side-effect-style", "side-effect"],
      ],
      order: "asc",
      type: "natural",
    },
  ],
  "perfectionist/sort-modules": [
    "error",
    {
      groups: [
        "declare-enum",
        "export-enum",
        "enum",
        ["declare-interface", "declare-type"],
        ["export-interface", "export-type"],
        ["interface", "type"],
        "declare-class",
        "class",
        "export-class",
        { group: "function", type: "unsorted" },
      ],
      order: "asc",
      type: "natural",
    },
  ],
  "perfectionist/sort-union-types": [
    "error",
    {
      groups: ["named", "nullish"],
    },
  ],
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...pluginQuery.configs["flat/recommended"],
  /**
   * eslint-plugin-react still ships `settings.react.version = "detect"`.
   * Detect uses context.getFilename(), removed in ESLint 10.
   */
  { settings: { react: { version: "19" } } },
  perfectionist.configs["recommended-natural"],
  { rules: { ...adrRules, ...sortingRules } },
  {
    files: [
      "app/**/*.{js,jsx,ts,tsx}",
      "features/**/*.{js,jsx,ts,tsx}",
      "theme/**/*.{js,jsx,ts,tsx}",
      "ui/**/*.{js,jsx,ts,tsx}",
    ],
    plugins: {
      "@stylexjs": stylex,
    },
    rules: {
      "@stylexjs/enforce-extension": "error",
      "@stylexjs/no-conflicting-props": "error",
      "@stylexjs/no-legacy-contextual-styles": "error",
      "@stylexjs/no-unused": "error",
      "@stylexjs/sort-keys": ["error", { order: "recess" }],
      "@stylexjs/valid-shorthands": ["error", { preferInline: true }],
      "@stylexjs/valid-styles": "error",
      "perfectionist/sort-objects": "off",
    },
  },
  {
    files: ["ui/**/*.{ts,tsx}"],
    ignores: ["ui/**/__tests__/**"],
    rules: {
      "no-restricted-syntax": ["error", ...uiDestinationOwnershipSyntax],
    },
  },
  {
    files: [
      "app/**/*.{ts,tsx}",
      "ui/**/*.{ts,tsx}",
      "features/**/*.{ts,tsx}",
      "domain/**/*.{ts,tsx}",
      "theme/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              message: "Import Link from @/i18n/navigation.",
              name: "next/link",
            },
            {
              importNames: [
                "permanentRedirect",
                "redirect",
                "usePathname",
                "useRouter",
              ],
              message: "Import these from @/i18n/navigation.",
              name: "next/navigation",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "app/**/*.{ts,tsx}",
      "domain/**/*.{ts,tsx}",
      "features/**/*.{ts,tsx}",
      "i18n/**/*.{ts,tsx}",
      "lib/**/*.{ts,tsx}",
      "proxy.ts",
      "theme/**/*.{ts,tsx}",
      "ui/**/*.{ts,tsx}",
    ],
    ignores: ["**/*.stories.*", "**/*.test.*", "**/*.spec.*"],
    plugins: { sonarjs },
    rules: readerPackRules,
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Storybook static build — generated assets, not app code
    "storybook-static/**",
    // Skill / agent tooling — not app code
    ".agents/**",
    // Git hook — Node script, not Next/React
    "scripts/**",
    // MSW generated worker
    "public/mockServiceWorker.js",
    // next-intl generated ICU argument types, beside each English catalog
    "**/messages/*.d.json.ts",
    "tokens/build.js",
    "tokens/generated/**",
    "babel.config.js",
    "postcss.config.js",
  ]),
  ...storybook.configs["flat/recommended"],
  eslintConfigPrettier,
]);

export default eslintConfig;
