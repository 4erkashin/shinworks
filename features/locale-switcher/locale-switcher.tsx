"use client";

import * as stylex from "@stylexjs/stylex";
import { useLocale } from "next-intl";

import { localeLabels } from "@/i18n/locale-labels";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { colors, fonts, grid, spacing } from "@/tokens/generated/tokens.stylex";

const styles = stylex.create({
  root: {
    display: "flex",
    fontFamily: fonts.mono,
    fontSize: `max(${grid.module} * 2, round(nearest, 2.5vw, ${spacing.px}))`,
    textTransform: "uppercase",
  },
  item: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: `calc(${grid.module} * 11)`,
    minHeight: `calc(${grid.module} * 11)`,
    paddingBlock: "0.5em",
    paddingInline: "0.5em",
    lineHeight: 1,
    color: colors.foreground,
    backgroundColor: "transparent",
  },
  current: {
    color: colors.background,
    backgroundColor: colors.foreground,
  },
  rest: {
    color: {
      default: colors.foreground,
      ":hover": colors.background,
    },
    backgroundColor: {
      default: "transparent",
      ":hover": colors.foreground,
    },
  },
});

export function LocaleSwitcher({ style }: { style?: stylex.StyleXStyles }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav {...stylex.props(styles.root, style)}>
      {routing.locales.map((item) => {
        const current = item === locale;

        return (
          <Link
            aria-current={current && "page"}
            href={pathname}
            hrefLang={item}
            key={item}
            locale={item}
            {...stylex.props(
              styles.item,
              current ? styles.current : styles.rest,
            )}
          >
            {localeLabels[item]}
          </Link>
        );
      })}
    </nav>
  );
}
