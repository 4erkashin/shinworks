import { expect, test } from "vitest";

import { wcag2ContrastCaption, wcag2ContrastRatio } from "./wcag-contrast";

const black = "oklch(0 0 0)";
const white = "oklch(1 0 0)";

test("black on white is 21:1", () => {
  expect(wcag2ContrastRatio(black, white)).toBeCloseTo(21, 5);
  expect(wcag2ContrastCaption(21)).toBe("21:1 · AA · AAA");
});
