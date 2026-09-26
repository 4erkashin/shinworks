import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HomeTiles } from "./home-tiles";

const meta = {
  component: HomeTiles,
  parameters: {
    docs: {
      description: {
        component: `
Home tiles are GitHub, Storybook, and email.

A taller sheet stacks them.
A wider sheet lays them in a row.
A square sheet counts as taller, so they stack.
        `,
      },
    },
  },
  title: "Features/Home tiles",
} satisfies Meta<typeof HomeTiles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Portrait: Story = {
  globals: {
    viewport: { isRotated: false, value: "phone" },
  },
};

export const Landscape: Story = {
  globals: {
    viewport: { isRotated: true, value: "phone" },
  },
};
