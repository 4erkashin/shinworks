import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ColorsPrimitive } from "./colors-primitive";

const meta = {
  component: ColorsPrimitive,
  title: "Tokens/Primitive colors",
} satisfies Meta<typeof ColorsPrimitive>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
