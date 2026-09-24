import { parseOklch } from "../parse-oklch";

/**
 * WCAG 2 contrast for OKLCH paints (SC 1.4.3, normal text).
 * Convert to linear sRGB the CSS Color 4 way, then the 2.x ratio.
 */

const AA_NORMAL = 4.5;
const AAA_NORMAL = 7;

export function wcag2ContrastRatio(first: string, second: string): number {
  const firstLum = relativeLuminance(first);
  const secondLum = relativeLuminance(second);
  const lighter = Math.max(firstLum, secondLum);
  const darker = Math.min(firstLum, secondLum);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Ratio plus the normal-text grades that pass. Fail both and you only
 * see the number.
 */
export function wcag2ContrastCaption(ratio: number): string {
  const rounded = Math.round(ratio * 10) / 10;
  const ratioText = `${Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)}:1`;
  if (ratio >= AAA_NORMAL) {
    return `${ratioText} · AA · AAA`;
  }
  if (ratio >= AA_NORMAL) {
    return `${ratioText} · AA`;
  }
  return ratioText;
}

function relativeLuminance(oklch: string): number {
  const [red, green, blue] = oklchToLinearSrgb(oklch);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function oklchToLinearSrgb(value: string): [number, number, number] {
  const { chroma, hue, lightness } = parseOklch(value);
  const hueRadians = hue === null ? 0 : (hue * Math.PI) / 180;
  const a = chroma === 0 || hue === null ? 0 : chroma * Math.cos(hueRadians);
  const b = chroma === 0 || hue === null ? 0 : chroma * Math.sin(hueRadians);

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    clamp01(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp01(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp01(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

function clamp01(channel: number): number {
  return Math.min(1, Math.max(0, channel));
}
