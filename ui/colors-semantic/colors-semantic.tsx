import * as stylex from "@stylexjs/stylex";

import { dark, light } from "../../tokens/generated/themes";
import { colors, fonts, spacing } from "../../tokens/generated/tokens.stylex";
import tokens from "../../tokens/tokens.json";
import { apcaContrast, apcaContrastCaption } from "./apca-contrast";
import { wcag2ContrastRatio } from "./wcag-contrast";

const lightForeground = semanticPaint("light", "foreground");
const lightBackground = semanticPaint("light", "background");
const lightPrimary = semanticPaint("light", "primary");
const darkForeground = semanticPaint("dark", "foreground");
const darkBackground = semanticPaint("dark", "background");
const darkPrimary = semanticPaint("dark", "primary");
const foregroundContrast = {
  dark: contrastInfo(darkForeground, darkBackground, "frost", "night"),
  light: contrastInfo(lightForeground, lightBackground, "ink", "frost"),
};
const primaryContrast = {
  dark: contrastInfo(darkPrimary, darkBackground, "coral", "night"),
  light: contrastInfo(lightPrimary, lightBackground, "ink", "frost"),
};

type ContrastInfo = { apca: string; pair: string; wcag: string };

export function ColorsSemantic() {
  return (
    <main {...stylex.props(styles.specimen)}>
      <section {...stylex.props(styles.section)}>
        <header {...stylex.props(styles.header)}>
          <p {...stylex.props(styles.kicker)}>Semantic color / 01</p>
          <h1 {...stylex.props(styles.title)}>What is background?</h1>
          <p {...stylex.props(styles.purpose)}>Use this color for the page.</p>
        </header>
        <div
          aria-label="Background colors by theme"
          {...stylex.props(styles.swatches)}
        >
          <BackgroundColumn primitive="frost" theme={light} themeName="light" />
          <BackgroundColumn primitive="night" theme={dark} themeName="dark" />
        </div>
      </section>
      <section {...stylex.props(styles.section)}>
        <header {...stylex.props(styles.header)}>
          <p {...stylex.props(styles.kicker)}>Semantic color / 02</p>
          <h2 {...stylex.props(styles.title)}>What is foreground?</h2>
          <p {...stylex.props(styles.purpose)}>
            Use this color for text and lines on the page.
          </p>
        </header>
        <div
          aria-label="Foreground colors and contrast by theme"
          {...stylex.props(styles.swatches)}
        >
          <ForegroundColumn
            contrast={foregroundContrast.light}
            primitive="ink"
            theme={light}
            themeName="light"
          />
          <ForegroundColumn
            contrast={foregroundContrast.dark}
            primitive="frost"
            theme={dark}
            themeName="dark"
          />
        </div>
      </section>
      <section {...stylex.props(styles.section)}>
        <header {...stylex.props(styles.header)}>
          <p {...stylex.props(styles.kicker)}>Semantic color / 03</p>
          <h2 {...stylex.props(styles.title)}>What is primary?</h2>
          <p {...stylex.props(styles.purpose)}>
            Use this color to attract the attention, to fill a button and etc.
          </p>
        </header>
        <div
          aria-label="Primary colors and contrast by theme"
          {...stylex.props(styles.swatches)}
        >
          <PrimaryColumn
            contrast={primaryContrast.light}
            primitive="ink"
            theme={light}
            themeName="light"
          />
          <PrimaryColumn
            contrast={primaryContrast.dark}
            primitive="coral"
            theme={dark}
            themeName="dark"
          />
        </div>
      </section>
    </main>
  );
}

function BackgroundColumn({
  primitive,
  theme,
  themeName,
}: {
  primitive: string;
  theme: typeof dark | typeof light;
  themeName: string;
}) {
  return (
    <figure {...stylex.props(styles.swatch)}>
      <div
        aria-label={`${themeName} theme background`}
        role="img"
        {...stylex.props(theme, styles.paint)}
      />
      <figcaption {...stylex.props(styles.label)}>
        <span>Theme / {themeName}</span>
        <span>Primitive / {primitive}</span>
      </figcaption>
    </figure>
  );
}

function ForegroundColumn({
  contrast,
  primitive,
  theme,
  themeName,
}: {
  contrast: ContrastInfo;
  primitive: string;
  theme: typeof dark | typeof light;
  themeName: string;
}) {
  return (
    <figure {...stylex.props(styles.swatch)}>
      <div {...stylex.props(theme, styles.paint, styles.foregroundPaint)} />
      <figcaption {...stylex.props(styles.label)}>
        <span>Theme / {themeName}</span>
        <span>Primitive / {primitive}</span>
      </figcaption>
      <div {...stylex.props(styles.contrastSpecimen)}>
        <div {...stylex.props(theme, styles.paint, styles.contrastPaint)}>
          <span {...stylex.props(styles.sampleText)}>Aa</span>
        </div>
        <div {...stylex.props(styles.contrastReadout)}>
          <span>{contrast.pair}</span>
          <span>WCAG 2 / {contrast.wcag}</span>
          <span>APCA / {contrast.apca}</span>
        </div>
      </div>
    </figure>
  );
}

function PrimaryColumn({
  contrast,
  primitive,
  theme,
  themeName,
}: {
  contrast: ContrastInfo;
  primitive: string;
  theme: typeof dark | typeof light;
  themeName: string;
}) {
  return (
    <figure {...stylex.props(styles.swatch)}>
      <div {...stylex.props(theme, styles.paint, styles.primaryPaint)} />
      <figcaption {...stylex.props(styles.label)}>
        <span>Theme / {themeName}</span>
        <span>Primitive / {primitive}</span>
      </figcaption>
      <div {...stylex.props(styles.contrastSpecimen)}>
        <div {...stylex.props(theme, styles.paint, styles.surfaceContrast)}>
          <div
            {...stylex.props(styles.primaryPaint, styles.surfaceOnSurface)}
          />
        </div>
        <div {...stylex.props(styles.contrastReadout)}>
          <span>{contrast.pair}</span>
          <span>WCAG 2 / {contrast.wcag}</span>
          <span>APCA / {contrast.apca}</span>
        </div>
      </div>
    </figure>
  );
}

function contrastInfo(
  foreground: string,
  background: string,
  foregroundName: string,
  backgroundName: string,
): ContrastInfo {
  const wcag = Math.round(wcag2ContrastRatio(foreground, background) * 10) / 10;

  return {
    apca: apcaContrastCaption(apcaContrast(foreground, background)),
    pair: `${foregroundName} on ${backgroundName}`,
    wcag: `${Number.isInteger(wcag) ? wcag : wcag.toFixed(1)}:1`,
  };
}

function semanticPaint(
  theme: "dark" | "light",
  name: "background" | "foreground" | "primary",
): string {
  const value = tokens[theme].color[name].$value;
  const matched = /^\{color\.([^}]+)\}$/.exec(value);
  if (!matched) return value;

  const primitive =
    tokens.primitive.color[matched[1] as keyof typeof tokens.primitive.color];
  if (!primitive) throw new Error(`missing primitive color ${matched[1]}`);
  return primitive.$value;
}

const styles = stylex.create({
  specimen: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
    maxInlineSize: "64rem",
    paddingBlock: "clamp(1.5rem,5vh,3rem)",
    paddingInline: "clamp(1.5rem,5vw,4rem)",
    marginInline: "auto",
    fontFamily: fonts.sans,
    color: colors.foreground,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
  },
  header: {
    paddingBlockEnd: spacing.md,
    borderBlockEndColor: colors.foreground,
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: spacing.px,
  },
  kicker: {
    margin: 0,
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    marginBlockStart: spacing.md,
    marginBlockEnd: 0,
    marginInline: 0,
    fontSize: "clamp(2rem, 5vw, 3.25rem)",
    lineHeight: 0.86,
    letterSpacing: "-0.075em",
  },
  purpose: {
    maxInlineSize: "36rem",
    margin: 0,
    marginBlockStart: spacing.md,
    fontFamily: fonts.sans,
    fontSize: "1rem",
    lineHeight: 1.4,
    color: colors.foreground,
  },
  swatches: {
    display: "flex",
    gap: spacing.lg,
  },
  swatch: {
    display: "flex",
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "column",
    gap: spacing.sm,
    inlineSize: "max-content",
    margin: 0,
  },
  paint: {
    inlineSize: "32vh",
    blockSize: "32vh",
    aspectRatio: "1 / 1",
    backgroundColor: colors.background,
    boxShadow: "0 0 0 1px oklch(0.12 0 0), 0 0 0 2px oklch(0.92 0 0)",
  },
  foregroundPaint: {
    backgroundColor: colors.foreground,
  },
  primaryPaint: {
    backgroundColor: colors.primary,
  },
  surfaceContrast: {
    boxSizing: "border-box",
    display: "flex",
    padding: spacing.lg,
  },
  surfaceOnSurface: {
    flexGrow: 1,
  },
  contrastSpecimen: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    marginBlockStart: spacing.lg,
  },
  contrastPaint: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    padding: spacing.md,
  },
  sampleText: {
    fontSize: "clamp(4rem, 20vh, 12rem)",
    fontWeight: 700,
    lineHeight: 1,
    color: colors.foreground,
    letterSpacing: "-0.1em",
  },
  contrastReadout: {
    display: "flex",
    flexDirection: "column",
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    lineHeight: 1.5,
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    lineHeight: 1.5,
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
});
