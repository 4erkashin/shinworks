import * as stylex from "@stylexjs/stylex";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/features/locale-switcher";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { grid, spacing } from "@/tokens/generated/tokens.stylex";
import { pageGridStyles } from "@/ui/page-grid";

import { HomeTitle } from "./home-title";

/**
 * Measured share of sheet width. The title still fits on the
 * smallest and largest viewports we compose for.
 */
const titleVw = 7;

/**
 * Switcher labels sit under the title: that width divided by the
 * golden ratio and 2.5, then by the golden ratio again.
 */
const switcherFontSize = `max(
  ${grid.module} * 2,
  round(
    nearest,
    ${titleVw}vw / (${grid.goldenRatio} * 2.5) / ${grid.goldenRatio},
    ${spacing.px}
  )
)`;

const styles = stylex.create({
  copy: {
    display: "flex",
    flexDirection: "column",
    gridRowStart: "1",
    gridColumnStart: "2",
    gridColumnEnd: "-3",
    placeSelf: "center start",
    fontSize: `round(nearest, ${titleVw}vw, ${spacing.px})`,
    fontWeight: 800,
    lineHeight: 1.1,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    textWrap: "balance",
  },
  localeSwitcher: {
    gridRowStart: "1",
    gridColumnStart: "-2",
    gridColumnEnd: "-1",
    placeSelf: "start end",
    width: "max-content",
    fontSize: switcherFontSize,
    writingMode: "vertical-rl",
    textOrientation: "sideways",
  },
  themeSwitcher: {
    gridRowStart: "1",
    gridColumnStart: "-2",
    gridColumnEnd: "-1",
    placeSelf: "end end",
    width: "max-content",
    fontSize: switcherFontSize,
  },
});

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main {...stylex.props(pageGridStyles.root)}>
      <div {...stylex.props(styles.copy)}>
        <h1>
          <HomeTitle>{t("title")}</HomeTitle>
        </h1>
      </div>

      <LocaleSwitcher style={styles.localeSwitcher} />
      <ThemeSwitcher style={styles.themeSwitcher} />
    </main>
  );
}
