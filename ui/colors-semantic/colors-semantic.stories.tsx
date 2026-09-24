import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ColorsSemantic } from "./colors-semantic";

const meta = {
  component: ColorsSemantic,
  title: "Tokens/Semantic colors",
} satisfies Meta<typeof ColorsSemantic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
