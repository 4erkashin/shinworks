import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { hasLocale } from "next-intl";
import { type MouseEvent, type ReactNode } from "react";
import { useGlobals } from "storybook/preview-api";

import { routing } from "@/i18n/routing";

import { LocaleSwitcher } from "./locale-switcher";

type AppLocale = (typeof routing.locales)[number];

/**
 * Clicks on a code would otherwise follow the Next link out of
 * this story. Write the addon locale instead so the toolbar and
 * the matching invert stay one value.
 */
function SyncStorybookLocale({
  children,
  onLocale,
}: Readonly<{
  children: ReactNode;
  onLocale: (locale: AppLocale) => void;
}>) {
  return (
    <div
      onClickCapture={(event: MouseEvent<HTMLDivElement>) => {
        const target = event.target;

        if (!(target instanceof Element)) {
          return;
        }

        const host = event.currentTarget;
        const link = target.closest("a[hreflang]");

        if (!link || !host.contains(link)) {
          return;
        }

        const nextLocale = link.getAttribute("hreflang");

        if (!hasLocale(routing.locales, nextLocale)) {
          return;
        }

        event.preventDefault();
        onLocale(nextLocale);
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  component: LocaleSwitcher,
  decorators: [
    (Story) => {
      const [, updateGlobals] = useGlobals();

      return (
        <SyncStorybookLocale
          onLocale={(locale) => {
            updateGlobals({ locale });
          }}
        >
          <Story />
        </SyncStorybookLocale>
      );
    },
  ],
  title: "Features/Locale switcher",
} satisfies Meta<typeof LocaleSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
