import { parseOklch } from "../parse-oklch";

/**
 * Split primitive paints into visual groups: near-gray neutrals at the
 * end, everything else in hue clusters, light to dark inside a group.
 */

const HUE_GAP_DEGREES = 30;

/**
 * Void is 0.00855 chroma with a leftover green hue. Treat that as gray
 * so it sits with black instead of in the greens.
 */
const NEUTRAL_CHROMA_MAX = 0.02;

export type PrimitivePaint = {
  chroma: number;
  hue: null | number;
  lightness: number;
  name: string;
  value: string;
};

type ChromaticPaint = PrimitivePaint & { hue: number };

type ColorToken = {
  $value: string;
};

export function groupPrimitiveColors(
  colors: Record<string, ColorToken>,
): PrimitivePaint[][] {
  const neutrals: PrimitivePaint[] = [];
  const chromatic: ChromaticPaint[] = [];

  for (const [name, token] of Object.entries(colors)) {
    const paint = toPaint(name, token.$value);
    if (isChromatic(paint)) {
      chromatic.push(paint);
    } else {
      neutrals.push(paint);
    }
  }

  const groups = clusterByHue(chromatic);
  if (neutrals.length > 0) {
    groups.push(sortLightToDark(neutrals));
  }
  return groups;
}

function clusterByHue(paints: ChromaticPaint[]): PrimitivePaint[][] {
  if (paints.length === 0) {
    return [];
  }

  const sorted = [...paints].toSorted((left, right) => left.hue - right.hue);
  const groups: ChromaticPaint[][] = [[sorted[0]]];

  for (const paint of sorted.slice(1)) {
    const current = groups.at(-1);
    const previous = current?.at(-1);
    if (
      current === undefined ||
      previous === undefined ||
      paint.hue - previous.hue > HUE_GAP_DEGREES
    ) {
      groups.push([paint]);
    } else {
      current.push(paint);
    }
  }

  const first = groups[0];
  const last = groups.at(-1);
  if (groups.length > 1 && first && last) {
    const wrapHue = first[0].hue + 360 - last[last.length - 1].hue;
    if (wrapHue <= HUE_GAP_DEGREES) {
      groups[0] = [...last, ...first];
      groups.pop();
    }
  }

  return groups.map((group) => sortLightToDark(group));
}

function isChromatic(paint: PrimitivePaint): paint is ChromaticPaint {
  return paint.hue !== null && paint.chroma > NEUTRAL_CHROMA_MAX;
}

function sortLightToDark(paints: PrimitivePaint[]): PrimitivePaint[] {
  return [...paints].toSorted(
    (left, right) => right.lightness - left.lightness,
  );
}

function toPaint(name: string, value: string): PrimitivePaint {
  return { ...parseOklch(value), name, value };
}
