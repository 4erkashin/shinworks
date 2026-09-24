"use client";

import { Button } from "@base-ui/react/button";
import * as stylex from "@stylexjs/stylex";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { colors, fonts, grid, spacing } from "@/tokens/generated/tokens.stylex";
import { pageGridStyles } from "@/ui/page-grid";

export type ErrorWidgetProps = {
  action: ErrorWidgetAction;
  description: string;
  digest?: string;
  title: string;
};

type ErrorWidgetAction =
  | {
      href: string;
      kind: "link";
      label: string;
    }
  | {
      kind: "button";
      label: string;
      onPress: () => void;
    };

/**
 * Measured share of sheet width. The title still fits on the
 * smallest and largest viewports we compose for.
 */
const titleVw = 11.25;

/**
 * Description is the title divided by the golden ratio and 2.5.
 * The action label uses that length, slightly smaller.
 */
const descriptionVw = `${titleVw}vw / (${grid.goldenRatio} * 2.5)`;

const descriptionFontSize = `round(
  nearest,
  ${descriptionVw},
  ${spacing.px}
)`;

const actionFontSize = `max(
  ${grid.module} * 2,
  round(
    nearest,
    ${descriptionVw} / ${grid.goldenRatio},
    ${spacing.px}
  )
)`;

const styles = stylex.create({
  action: {
    display: "inline-flex",
    alignItems: "center",
    alignSelf: "flex-start",
    justifyContent: "center",
    minHeight: `calc(${grid.module} * 11)`,
    paddingBlock: "0.5em",
    paddingInline: `max(${spacing.md}, 1em)`,
    fontFamily: fonts.mono,
    fontSize: actionFontSize,
    fontWeight: 500,
    lineHeight: 1,
    color: colors.background,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    cursor: "pointer",
    outlineWidth: spacing.px,
    outlineStyle: "solid",
    outlineColor: {
      default: "transparent",
      ":focus-visible": colors.foreground,
    },
    outlineOffset: spacing.xxs,
    backgroundColor: colors.foreground,
    borderWidth: 0,
    transform: {
      default: "none",
      ":active": `translate(${spacing.px}, ${spacing.px})`,
    },
  },
  copy: {
    display: "flex",
    flexDirection: "column",
    gridRowStart: "1",
    gridColumnStart: "2",
    gridColumnEnd: "-3",
    gap: descriptionFontSize,
    placeSelf: "center",
    fontSize: `round(nearest, ${titleVw}vw, ${spacing.px})`,
    fontWeight: 800,
    lineHeight: 1.1,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    textWrap: "balance",
  },
  description: {
    fontSize: descriptionFontSize,
    fontWeight: 500,
  },
  /**
   * Last column, bottom-right corner of the sheet.
   */
  digest: {
    gridRowStart: "1",
    gridColumnStart: "-2",
    gridColumnEnd: "-1",
    placeSelf: "end end",
    width: "max-content",
    margin: 0,
    fontFamily: fonts.mono,
    fontSize: actionFontSize,
    fontWeight: 500,
    lineHeight: 1,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
});

function ErrorAction({ action }: { action: ErrorWidgetAction }) {
  if (action.kind === "link") {
    return (
      <Link href={action.href} {...stylex.props(styles.action)}>
        {action.label}
      </Link>
    );
  }

  return (
    <Button
      nativeButton
      onClick={action.onPress}
      type="button"
      {...stylex.props(styles.action)}
    >
      {action.label}
    </Button>
  );
}

export function ErrorWidget({
  action,
  description,
  digest,
  title,
}: ErrorWidgetProps) {
  const t = useTranslations("ErrorWidget");

  return (
    <main {...stylex.props(pageGridStyles.root)}>
      <div {...stylex.props(styles.copy)}>
        <h1>{title}</h1>
        <p {...stylex.props(styles.description)}>{description}</p>
        <ErrorAction action={action} />
      </div>

      {digest ? (
        <p {...stylex.props(styles.digest)}>{t("reference", { digest })}</p>
      ) : null}
    </main>
  );
}
