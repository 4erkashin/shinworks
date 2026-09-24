import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Before as BeforeDemo,
  Hover as HoverDemo,
  Keyframes as KeyframesDemo,
  ReducedMotion as ReducedMotionDemo,
  Supports as SupportsDemo,
} from "./cookbook-stylex";

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
  title: "Cookbooks/StyleX",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Hover: Story = {
  parameters: snippet(`color: {
  default: colors.foreground,
  ":hover": colors.background,
}
backgroundColor: {
  default: colors.background,
  ":hover": colors.foreground,
}`),
  render: () => <HoverDemo />,
};

export const Before: Story = {
  parameters: snippet(`"::before": {
  color: colors.foreground,
  content: '"→ "',
}`),
  render: () => <BeforeDemo />,
};

export const Keyframes: Story = {
  parameters: snippet(`const pulse = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0.5 },
});

animationName: {
  default: "none",
  ":hover": pulse,
  [queries.reducedMotion]: "none",
},
animationIterationCount: "infinite",`),
  render: () => <KeyframesDemo />,
};

export const Supports: Story = {
  parameters: snippet(`display: {
  default: "block",
  "@supports (display: grid)": "grid",
},
gridTemplateColumns: "1fr 1fr",`),
  render: () => <SupportsDemo />,
};

export const ReducedMotion: Story = {
  parameters: snippet(`[queries.reducedMotion]: "none"`),
  render: () => <ReducedMotionDemo />,
};
