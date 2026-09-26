import * as stylex from "@stylexjs/stylex";

import { HomeTiles } from "@/features/home";
import { LocaleSwitcher } from "@/features/locale-switcher";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { grid, spacing } from "@/tokens/generated/tokens.stylex";
import { pageGridStyles } from "@/ui/page-grid";

const switcherFontSize = `max(
  ${grid.module} * 2,
  round(
    nearest,
    8vw / (${grid.goldenRatio} * 2.5) / ${grid.goldenRatio},
    ${spacing.px}
  )
)`;

const styles = stylex.create({
  tiles: {
    gridRowStart: "1",
    gridColumnStart: "2",
    gridColumnEnd: "-3",
    placeSelf: "center",
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
  return (
    <main {...stylex.props(pageGridStyles.root)}>
      <HomeTiles style={styles.tiles} />
      <LocaleSwitcher style={styles.localeSwitcher} />
      <ThemeSwitcher style={styles.themeSwitcher} />
    </main>
  );
}
