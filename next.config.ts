import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.svg": {
        as: "*.js",
        loaders: [
          {
            // Do not set SVGR `icon: true` — it forces 1em×1em.
            loader: "@svgr/webpack",
          },
        ],
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin({
  experimental: {
    /**
     * Writes a declaration beside each English catalog so the strings
     * stay literals. `i18n/catalogs/en.ts` merges those files, and
     * `i18n/global.ts` uses the merged type for keys and ICU arguments.
     */
    createMessagesDeclaration: [
      "./app/[locale]/messages/en.json",
      "./features/theme-switcher/messages/en.json",
      "./ui/cookbook-intl/messages/en.json",
    ],
  },
});

export default withNextIntl(nextConfig);
