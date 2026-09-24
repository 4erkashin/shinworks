"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { colors, fonts } from "@/tokens/generated/tokens.stylex";

import { Glitch } from "./glitch";

const meta = {
  component: Glitch,
  title: "UI/Glitch",
} satisfies Meta<typeof Glitch>;

export default meta;

type Story = StoryObj<typeof meta>;

function HoverGlitch({ colorSplit = false }: { colorSplit?: boolean }) {
  const [active, setActive] = useState(false);

  return (
    <span
      onMouseEnter={() => {
        setActive(true);
      }}
      onMouseLeave={() => {
        setActive(false);
      }}
      {...stylex.props(styles.solo)}
    >
      <Glitch active={active} colorSplit={colorSplit}>
        SIGNAL
      </Glitch>
    </span>
  );
}

export const Default: Story = {
  args: {
    children: "SIGNAL",
  },
  render: () => <HoverGlitch />,
};

export const ColorSplit: Story = {
  args: {
    children: "SIGNAL",
    colorSplit: true,
  },
  render: () => <HoverGlitch colorSplit />,
};

const styles = stylex.create({
  solo: {
    fontFamily: fonts.mono,
    fontSize: "2rem",
    fontWeight: 800,
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    cursor: "pointer",
  },
});
