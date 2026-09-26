import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Image from "next/image";

import { routing } from "@/i18n/routing";
import { captionForLocale } from "@/lib/storybook/locale-captions";
import { SyncHtmlTheme } from "@/lib/storybook/sync-html-theme";
import {
  fullscreenViewportMatrix,
  viewportLocaleStory,
} from "@/lib/storybook/viewport-matrix";

import HomePage from "./page";

const openGraphBaseUrl = (
  process.env.STORYBOOK_OG_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");

const meta = {
  component: HomePage,
  decorators: [
    (Story) => (
      <SyncHtmlTheme>
        <Story />
      </SyncHtmlTheme>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Home page is a column of GitHub, Storybook, and email tiles,
the locale switcher, and the theme switcher on the page grid.

Each viewport story is one named size. Tiles inside it are
English on the left and one other locale on the right, then
scroll — the pane is not locked to the token pixel size.
The OG images story shows the generated image for every locale.
        `,
      },
    },
    ...fullscreenViewportMatrix,
  },
  title: "App/Home",
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Names stay literals. The indexer does not run viewportLocaleStory.
export const PhoneSM: Story = {
  ...viewportLocaleStory(HomePage, "phone-small"),
  name: "Phone SM · 320 × 568",
};

export const PhoneMD: Story = {
  ...viewportLocaleStory(HomePage, "phone"),
  name: "Phone MD · 390 × 844",
};

export const TabletPortrait: Story = {
  ...viewportLocaleStory(HomePage, "tablet-portrait"),
  name: "Tablet Portrait · 768 × 1024",
};

export const Laptop: Story = {
  ...viewportLocaleStory(HomePage, "laptop"),
  name: "Laptop · 1280 × 800",
};

export const Desktop: Story = {
  ...viewportLocaleStory(HomePage, "desktop"),
  name: "Desktop · 1920 × 1080",
};

export const TwoK: Story = {
  ...viewportLocaleStory(HomePage, "qhd"),
  name: "2K · 2560 × 1440",
};

export const FourK: Story = {
  ...viewportLocaleStory(HomePage, "four-k"),
  name: "4K · 3840 × 2160",
};

export const OpenGraphImages: Story = {
  name: "OG images",
  render: () => (
    <main
      style={{
        boxSizing: "border-box",
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gridTemplateRows: "repeat(2, minmax(0, 1fr))",
        height: "100dvh",
        padding: 12,
        width: "100%",
      }}
    >
      {routing.locales.map((locale) => (
        <figure
          key={locale}
          style={{
            display: "flex",
            flexDirection: "column",
            margin: 0,
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <figcaption
            style={{
              color: "#64748b",
              fontFamily: "sans-serif",
              fontSize: 12,
              marginBottom: 6,
            }}
          >
            {captionForLocale(locale)}
          </figcaption>
          <Image
            alt={`${captionForLocale(locale)} Open Graph image`}
            height={630}
            src={`${openGraphBaseUrl}/${locale}/opengraph-image`}
            style={{
              background: "#07161d",
              border: "1px solid #334155",
              display: "block",
              flex: "1 1 auto",
              height: "100%",
              minHeight: 0,
              objectFit: "contain",
              width: "100%",
            }}
            unoptimized
            width={1200}
          />
        </figure>
      ))}
    </main>
  ),
};
