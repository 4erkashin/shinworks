import type { Preview } from "@storybook/nextjs-vite";

import { DecoratorHelpers } from "@storybook/addon-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { mswLoader } from "msw-storybook-addon/csf3";
import { type ReactNode, useState } from "react";

import { MotionProvider } from "@/lib/motion/provider";
import { makeQueryClient } from "@/lib/query/query-client";
import { captionForLocale } from "@/lib/storybook/locale-captions";
import { THEME_NAMES, type ThemeName } from "@/theme/cookie";
import { viewports } from "@/tokens/generated/viewports";
import { PageGridOverlay } from "@/ui/page-grid";

import { mswHandlers } from "./msw-handlers";
import nextIntl from "./next-intl";
import { ThemeHtml } from "./theme-iframe";

import "@/app/globals.css";

/**
 * App QueryProvider uses a browser singleton — cache would leak across stories.
 * useState keeps one client for this mount; key={context.id} on this component
 * (not on QueryClientProvider) so the owner remounts per story.
 */
function StoryQueryRoot({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const { initializeThemeState, pluckThemeFromContext } = DecoratorHelpers;

// Puts light / dark / system in the toolbar. Default is "system".
initializeThemeState([...THEME_NAMES], "system");

// Every available locale id mapped to its toolbar caption (id itself when uncaptioned).
const localeToolbarCaptions = Object.fromEntries(
  Object.keys(nextIntl.messagesByLocale).map((locale) => [
    locale,
    captionForLocale(locale),
  ]),
);

const preview: Preview = {
  async beforeEach({ msw }) {
    msw.use(...mswHandlers);
  },
  decorators: [
    /**
     * Toolbar already stored the picked name. A story can override it.
     * Pass that name to ThemeHtml — same theme as the app, on the iframe <html>.
     * Empty (toolbar not ready yet) → "system".
     */
    (Story, context) => {
      const theme = (context.parameters.themes?.themeOverride ||
        pluckThemeFromContext(context) ||
        "system") as ThemeName;
      const pageGridOn = context.globals.pageGrid === "on";

      return (
        <ThemeHtml theme={theme}>
          <StoryQueryRoot key={context.id}>
            <MotionProvider>
              {pageGridOn ? <PageGridOverlay /> : null}
              <Story />
            </MotionProvider>
          </StoryQueryRoot>
        </ThemeHtml>
      );
    },
  ],
  globalTypes: {
    pageGrid: {
      description: "Page grid overlay",
      toolbar: {
        dynamicTitle: true,
        items: [
          { title: "Grid off", value: "off" },
          { title: "Grid on", value: "on" },
        ],
        title: "Grid",
      },
    },
  },
  initialGlobals: {
    locale: nextIntl.defaultLocale,
    locales: localeToolbarCaptions,
    pageGrid: "off",
  },
  loaders: [mswLoader()],
  parameters: {
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    /**
     * Built-in light/dark swatches paint .sb-show-main and would override
     * the iframe <html> page color. Theme toolbar is the only picker.
     */
    backgrounds: {
      disable: true,
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    /**
     * Canvas Code tab is off. A cookbook file sets docs.codePanel: true.
     * One story can set it false again if that example should not show source.
     */
    docs: {
      codePanel: false,
    },

    nextIntl,
    nextjs: {
      appDirectory: true,
    },

    /**
     * Sidebar order. Titles live on each story file so the path
     * (`[locale]`, kebab-case filenames) does not leak into the tree.
     */
    options: {
      storySort: {
        order: [
          "App",
          ["Home", "Global error"],
          "Features",
          "UI",
          "Tokens",
          ["Primitive colors", "Semantic colors"],
          "Cookbooks",
          ["StyleX", "Motion", "Intl"],
        ],
      },
    },

    /**
     * Product viewports from tokens. Replaces Storybook's built-in
     * viewport list.
     */
    viewport: {
      options: Object.fromEntries(
        viewports.map((viewport) => [
          viewport.id,
          {
            name: `${viewport.name} · ${viewport.width} × ${viewport.height}`,
            styles: {
              height: `${viewport.height}px`,
              width: `${viewport.width}px`,
            },
          },
        ]),
      ),
    },
  },
};

export default preview;
