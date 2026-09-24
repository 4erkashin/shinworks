import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { routing } from "@/i18n/routing";

/**
 * Satori paints hex. These are the night, frost, and coral
 * primitives from `tokens/tokens.json`.
 */
const night = "#07161d";
const frost = "#e9f0f3";
const coral = "#f36358";

/**
 * Onest ExtraBold, 1000 units to an em. Numbers are that file's
 * advances and the hyphen's box. The bar below is drawn from
 * them so it stays the hyphen for this face.
 */
const unitsPerEm = 1000;
const shinAdvanceUnits = 662 + 748 + 304 + 775;
const worksInkRightUnits = 1011 + 777 + 700 + 688 + 620;
const hyphenLeftSidebearing = 58;
const hyphenThickness = 142;

/** Holds the card without running into the right edge. */
const fontSize = 220;
const tracking = 4;
const lineHeight = 1;

const scale = fontSize / unitsPerEm;
const shinAdvance = shinAdvanceUnits * scale + tracking * 3;
const worksInkRight = worksInkRightUnits * scale + tracking * 4;
const hyphenInset = hyphenLeftSidebearing * scale;

/**
 * Satori keeps one trailing letter-spacing on the text box,
 * and the painted edge of S sits a few pixels inside its box.
 * Those two are the `tracking` term and the last 3 pixels.
 */
const hyphenBarWidth =
  Math.round(worksInkRight - shinAdvance - tracking - hyphenInset) - 3;
const hyphenBarHeight = Math.round(hyphenThickness * scale);
const hyphenBarDrop = Math.round(fontSize * 0.04);

export const alt = "Shinworks";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

/**
 * ImageResponse accepts TTF, OTF, or WOFF, and its default face
 * is Latin only. This is a static Onest cut — the same family as
 * `theme/fonts.ts` — with Latin and Cyrillic, at the home page's
 * 800 weight. License: `theme/fonts/OFL.txt`.
 */
const onestExtraBold = await readFile(
  join(process.cwd(), "theme/fonts/Onest-ExtraBold.ttf"),
);

function fontBytes(file: Buffer): ArrayBuffer {
  const copy = new Uint8Array(file.byteLength);
  copy.set(file);

  return copy.buffer;
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return new ImageResponse(
    <div
      style={{
        backgroundColor: night,
        color: frost,
        display: "flex",
        fontFamily: "Onest",
        height: "100%",
        padding: 72,
        width: "100%",
      }}
    >
      <div
        style={{
          backgroundColor: coral,
          display: "flex",
          marginRight: 40,
          width: 10,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          fontWeight: 800,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            fontSize,
            lineHeight,
          }}
        >
          <div style={{ display: "flex", letterSpacing: tracking }}>SHIN</div>
          <div
            style={{
              backgroundColor: frost,
              display: "flex",
              height: hyphenBarHeight,
              marginLeft: Math.round(hyphenInset),
              transform: `translateY(${hyphenBarDrop}px)`,
              width: hyphenBarWidth,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            fontSize,
            letterSpacing: tracking,
            lineHeight,
          }}
        >
          WORKS
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          data: fontBytes(onestExtraBold),
          name: "Onest",
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
