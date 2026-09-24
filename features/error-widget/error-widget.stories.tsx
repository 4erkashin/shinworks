import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { fn } from "storybook/test";

import { EXAMPLE_ERROR_DIGEST } from "./consts";
import { ErrorWidget } from "./error-widget";

const meta = {
  args: {
    action: {
      kind: "button",
      label: "Try again",
      onPress: fn(),
    },
    description: "The page failed before it could render.",
    digest: EXAMPLE_ERROR_DIGEST,
    title: "Could not be loaded",
  },
  component: ErrorWidget,
  parameters: {
    layout: "fullscreen",
  },
  title: "Features/Error widget",
} satisfies Meta<typeof ErrorWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDigest: Story = {
  args: {
    digest: undefined,
  },
};
