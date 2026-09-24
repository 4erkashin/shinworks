import { expect, test } from "vitest";

import { apcaContrast, apcaContrastCaption } from "./apca-contrast";

const black = "oklch(0 0 0)";
const white = "oklch(1 0 0)";

test("APCA preserves contrast direction", () => {
  expect(apcaContrast(black, white)).toBeCloseTo(106, 0);
  expect(apcaContrast(white, black)).toBeCloseTo(-108, 0);
  expect(apcaContrastCaption(apcaContrast(black, white))).toBe("Lc +106");
  expect(apcaContrastCaption(apcaContrast(white, black))).toBe("Lc -108");
});
