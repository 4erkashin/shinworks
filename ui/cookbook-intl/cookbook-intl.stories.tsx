import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  DateTime as DateTimeDemo,
  Plural as PluralDemo,
} from "./cookbook-intl";

function snippet(code: string) {
  return {
    docs: {
      codePanel: true,
      source: {
        code,
        language: "tsx",
        type: "code",
      },
    },
  } as const;
}

const meta = {
  parameters: {
    docs: {
      codePanel: true,
    },
  },
  title: "Cookbooks/Intl",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Plural: Story = {
  parameters: snippet(`t("itemCount", { count })
// "{count, plural, =0 {No items} one {# item} other {# items}}"`),
  render: () => <PluralDemo />,
};

export const Date: Story = {
  parameters: snippet(`format.dateTime(date, {
  dateStyle: "long",
  timeStyle: "short",
})`),
  render: () => <DateTimeDemo />,
};
