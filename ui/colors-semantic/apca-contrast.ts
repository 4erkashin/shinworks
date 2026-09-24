import { parseOklch } from "../parse-oklch";

/**
 * APCA 0.1.9 (SA98G): signed perceptual contrast.
 * Positive values are dark text on a light background; negative values are
 * light text on a dark background.
 */
export function apcaContrast(text: string, background: string): number {
  let textY = apcaLuminance(text);
  let backgroundY = apcaLuminance(background);

  textY = blackClamp(textY);
  backgroundY = blackClamp(backgroundY);

  if (Math.abs(backgroundY - textY) < 0.0005) return 0;

  if (backgroundY > textY) {
    const contrast = (backgroundY ** 0.56 - textY ** 0.57) * 1.14 - 0.027;
    return contrast < 0.1 ? 0 : contrast * 100;
  }

  const contrast = (backgroundY ** 0.65 - textY ** 0.62) * 1.14 + 0.027;
  return contrast > -0.1 ? 0 : contrast * 100;
}

export function apcaContrastCaption(contrast: number): string {
  const rounded = Math.round(contrast);
  return `Lc ${rounded > 0 ? "+" : ""}${rounded}`;
}

function apcaLuminance(oklch: string): number {
  const { chroma, hue, lightness } = parseOklch(oklch);
  const hueRadians = hue === null ? 0 : (hue * Math.PI) / 180;
  const a = chroma === 0 || hue === null ? 0 : chroma * Math.cos(hueRadians);
  const b = chroma === 0 || hue === null ? 0 : chroma * Math.sin(hueRadians);

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const [red, green, blue] = [
    clamp01(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp01(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp01(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ].map(toSrgb);

  return (
    0.2126729 * red ** 2.4 + 0.7151522 * green ** 2.4 + 0.072175 * blue ** 2.4
  );
}

function blackClamp(value: number): number {
  return value < 0.022 ? value + (0.022 - value) ** 1.414 : value;
}

function toSrgb(value: number): number {
  return value <= 0.0031308
    ? value * 12.92
    : 1.055 * value ** (1 / 2.4) - 0.055;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
