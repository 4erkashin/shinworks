import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useTranslations } from "next-intl";
import { fn } from "storybook/test";

import { ErrorWidget } from "@/features/error-widget";
import { EXAMPLE_ERROR_DIGEST } from "@/features/error-widget/consts";
import {
  fullscreenViewportMatrix,
  viewportLocaleStory,
} from "@/lib/storybook/viewport-matrix";

const retry = fn();

/**
 * The tile already owns the iframe document. This is the screen
 * global-error paints inside that sheet, with the tile's locale.
 */
function GlobalErrorPage() {
  const t = useTranslations("Error");

  return (
    <ErrorWidget
      action={{
        kind: "button",
        label: t("tryAgain"),
        onPress: retry,
      }}
      description={t("description")}
      digest={EXAMPLE_ERROR_DIGEST}
      title={t("title")}
    />
  );
}

const meta = {
  component: GlobalErrorPage,
  parameters: {
    docs: {
      description: {
        component: `
Global error fills the sheet: title, description, try again,
and the error reference along the bottom.

Each story is one named viewport. Tiles inside it are
English on the left and one other locale on the right, then
scroll — the pane is not locked to the token pixel size.
        `,
      },
    },
    ...fullscreenViewportMatrix,
  },
  title: "App/Global error",
} satisfies Meta<typeof GlobalErrorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Names stay literals. The indexer does not run viewportLocaleStory.
export const PhoneSM: Story = {
  ...viewportLocaleStory(GlobalErrorPage, "phone-small"),
  name: "Phone SM · 320 × 568",
};

export const PhoneMD: Story = {
  ...viewportLocaleStory(GlobalErrorPage, "phone"),
  name: "Phone MD · 390 × 844",
};

export const TabletPortrait: Story = {
  ...viewportLocaleStory(GlobalErrorPage, "tablet-portrait"),
  name: "Tablet Portrait · 768 × 1024",
};

export const Laptop: Story = {
  ...viewportLocaleStory(GlobalErrorPage, "laptop"),
  name: "Laptop · 1280 × 800",
};

export const Desktop: Story = {
  ...viewportLocaleStory(GlobalErrorPage, "desktop"),
  name: "Desktop · 1920 × 1080",
};

export const TwoK: Story = {
  ...viewportLocaleStory(GlobalErrorPage, "qhd"),
  name: "2K · 2560 × 1440",
};

export const FourK: Story = {
  ...viewportLocaleStory(GlobalErrorPage, "four-k"),
  name: "4K · 3840 × 2160",
};
