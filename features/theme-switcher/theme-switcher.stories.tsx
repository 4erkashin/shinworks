import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SyncHtmlTheme } from "@/lib/storybook/sync-html-theme";

import { ThemeSwitcher } from "./theme-switcher";

const meta = {
  component: ThemeSwitcher,
  decorators: [
    (Story) => (
      <SyncHtmlTheme>
        <Story />
      </SyncHtmlTheme>
    ),
  ],
  title: "Features/Theme switcher",
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
