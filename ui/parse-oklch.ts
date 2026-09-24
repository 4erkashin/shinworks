/**
 * CSS Color 4 oklch(): lightness, chroma, hue, optional slash alpha.
 * Lightness is 0-1 or 0%-100%. Chroma 100% means 0.4. Hue is a number
 * of degrees, or an angle with a unit. none is allowed on each part.
 */

const cssNumber = String.raw`[+-]?(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?`;
const cssNoneOrNumber = String.raw`none|${cssNumber}%?`;
const cssHue = String.raw`none|${cssNumber}(?:deg|grad|rad|turn)?`;

const oklchPattern = new RegExp(
  String.raw`^oklch\(\s*(${cssNoneOrNumber})\s+(${cssNoneOrNumber})\s+(${cssHue})(?:\s*/\s*(?:${cssNoneOrNumber}))?\s*\)$`,
  "i",
);

const CHROMA_AT_100_PERCENT = 0.4;

export type Oklch = {
  chroma: number;
  hue: null | number;
  lightness: number;
};

export function parseOklch(value: string): Oklch {
  const match = oklchPattern.exec(value.trim());
  if (!match) {
    throw new Error(`expected oklch(...), got ${value}`);
  }

  return {
    chroma: parseChroma(match[2]),
    hue: parseHue(match[3]),
    lightness: parseLightness(match[1]),
  };
}

function parseChroma(token: string): number {
  if (isNone(token)) {
    return 0;
  }
  const chroma = token.endsWith("%")
    ? (Number(token.slice(0, -1)) / 100) * CHROMA_AT_100_PERCENT
    : Number(token);
  return Math.max(0, chroma);
}

function parseHue(token: string): null | number {
  if (isNone(token)) {
    return null;
  }
  const matched = new RegExp(`^(${cssNumber})(deg|grad|rad|turn)?$`, "i").exec(
    token,
  );
  if (!matched) {
    throw new Error(`expected oklch hue, got ${token}`);
  }
  const amount = Number(matched[1]);
  const unit = matched[2]?.toLowerCase() ?? "deg";
  if (unit === "grad") {
    return amount * 0.9;
  }
  if (unit === "rad") {
    return (amount * 180) / Math.PI;
  }
  if (unit === "turn") {
    return amount * 360;
  }
  return amount;
}

function parseLightness(token: string): number {
  if (isNone(token)) {
    return 0;
  }
  const lightness = token.endsWith("%")
    ? Number(token.slice(0, -1)) / 100
    : Number(token);
  return Math.min(1, Math.max(0, lightness));
}

function isNone(token: string): boolean {
  return token.toLowerCase() === "none";
}
