import * as stylex from "@stylexjs/stylex";

import { readEnvironmentVariable } from "@/lib/environment";
import { colors, grid, spacing } from "@/tokens/generated/tokens.stylex";

import Github from "./github.svg";
import Mail from "./mail.svg";
import Storybook from "./storybook.svg";

/** Each tile is a square, one tenth of the sheet width. */
const tileSide = "25vw";

/** Icon side is the tile divided by the golden ratio, rounded to the nearest pixel. */
const iconSide = `round(nearest, 100% / ${grid.goldenRatio}, ${spacing.px})`;

const tiles = [
  {
    Icon: Github,
    href: readEnvironmentVariable("GITHUB_URL"),
    label: "GitHub",
  },
  {
    Icon: Storybook,
    href: readEnvironmentVariable("STORYBOOK_URL"),
    label: "Storybook",
  },
  {
    Icon: Mail,
    href: `mailto:${readEnvironmentVariable("CONTACT_EMAIL")}`,
    label: "Email",
  },
] as const;

const styles = stylex.create({
  icon: {
    display: "block",
    width: iconSide,
    height: iconSide,
  },
  list: {
    display: "flex",
    /**
     * A taller sheet stacks the tiles.
     * A wider sheet lays them in a row.
     * A square sheet counts as taller, so the tiles stack.
     */
    flexDirection: {
      default: "column",
      "@media (orientation: landscape)": "row",
    },
    gap: spacing.sm,
    padding: 0,
    margin: 0,
    listStyle: "none",
  },
  /**
   * Hover only where a pointer can rest.
   * A finger uses the press, so the swap does not stick after a tap.
   */
  tile: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: tileSide,
    height: tileSide,
    color: {
      default: colors.foreground,
      ":active": colors.background,
      "@media (hover: hover)": {
        ":hover": colors.background,
      },
    },
    cursor: "pointer",
    backgroundColor: {
      default: "transparent",
      ":active": colors.foreground,
      "@media (hover: hover)": {
        ":hover": colors.foreground,
      },
    },
  },
});

export function HomeTiles({ style }: { style?: stylex.StyleXStyles }) {
  return (
    <ul {...stylex.props(styles.list, style)}>
      {tiles.map(({ Icon, href, label }) => (
        <li key={label}>
          <a
            aria-label={label}
            href={href}
            rel="noreferrer"
            target="_blank"
            {...stylex.props(styles.tile)}
          >
            <Icon aria-hidden {...stylex.props(styles.icon)} />
          </a>
        </li>
      ))}
    </ul>
  );
}
