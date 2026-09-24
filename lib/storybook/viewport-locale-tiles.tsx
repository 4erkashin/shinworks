import * as stylex from "@stylexjs/stylex";
import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import {
  type ComponentType,
  Fragment,
  type SyntheticEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { globalStyles } from "@/app/global-styles";
import { routing } from "@/i18n/routing";
import { captionForLocale } from "@/lib/storybook/locale-captions";
import { messagesByLocale } from "@/lib/storybook/messages-by-locale";
import { fonts, spacing } from "@/tokens/generated/tokens.stylex";
import { type viewports } from "@/tokens/generated/viewports";

const FRAME_SRC_DOC = "<!DOCTYPE html><html><head></head><body></body></html>";
const COPIED_HEAD_ATTR = "data-viewport-tile-copy";

type AppLocale = (typeof routing.locales)[number];
type Viewport = (typeof viewports)[number];

const styles = stylex.create({
  /**
   * Desk chrome, not poster. Lives in the padding/gap so a locale
   * switcher on the page is not competing with this label.
   *
   * Hex values are Storybook's light/dark appBg and textMutedColor,
   * written as literals so StyleX can compile them. Frost page paint
   * would hide the gap.
   */
  caption: {
    color: {
      "@media (prefers-color-scheme: dark)": "#95999D",
      default: "#5C6570",
    },
    flexShrink: 0,
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    letterSpacing: "0.04em",
  },
  cell: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    minWidth: 0,
  },
  /**
   * Scroll lives here, not on the grid. A grid that is also the
   * scroll box treats the pane as a definite height and squashes
   * every row to fit, which is what cropped the phones.
   */
  desk: {
    backgroundColor: {
      "@media (prefers-color-scheme: dark)": "#1B1C1D",
      default: "#F6F9FC",
    },
    boxSizing: "border-box",
    flexGrow: 1,
    height: "100%",
    minHeight: 0,
    overflowY: "auto",
    padding: spacing.md,
    width: "100%",
  },
  frame: {
    borderWidth: 0,
    display: "block",
    transformOrigin: "top left",
  },
  /**
   * Height comes from the sheets. Extra pane space stays empty
   * desk at the bottom instead of stretching rows.
   */
  grid: {
    alignItems: "start",
    display: "grid",
    gap: spacing.md,
    gridTemplateColumns: "1fr 1fr",
    width: "100%",
  },
  stage: {
    display: "grid",
    minWidth: 0,
    placeItems: "center",
    width: "100%",
  },
});

/**
 * Drop last copy, clone the preview document's sheets into the tile
 * iframe. vw / @media in the page then see this iframe, not the pane.
 */
function copyParentStyles(
  target: Document,
  copies: Map<Element, { clone: HTMLElement; content: string }>,
) {
  const selector = "style, link[rel='stylesheet']";
  const sources = [...document.head.querySelectorAll(selector)];
  const current = new Set(sources);
  for (const [source, copy] of copies) {
    if (!current.has(source)) {
      copy.clone.remove();
      copies.delete(source);
    }
  }

  const pending: Promise<void>[] = [];
  for (const node of sources) {
    const content =
      node instanceof HTMLLinkElement ? node.href : (node.textContent ?? "");
    const existing = copies.get(node);
    if (existing?.content === content) continue;
    existing?.clone.remove();
    const clone = node.cloneNode(true) as HTMLElement;
    clone.setAttribute(COPIED_HEAD_ATTR, "");

    if (clone instanceof HTMLLinkElement && node instanceof HTMLLinkElement) {
      clone.href = node.href;
      /**
       * StyleX copies /virtual:stylex.css into a style tag, then
       * disables this link so the file is not applied twice.
       * A disabled link never fires load or error. Waiting on it
       * left every tile hidden and the page never portaled in.
       */
      if (!node.disabled) {
        pending.push(
          new Promise((resolve) => {
            clone.addEventListener("load", () => resolve(), { once: true });
            clone.addEventListener("error", () => resolve(), { once: true });
          }),
        );
      }
    }

    target.head.appendChild(clone);
    copies.set(node, { clone, content });
  }

  try {
    target.adoptedStyleSheets = [...document.adoptedStyleSheets];
  } catch {
    /**
     * Sharing constructed sheets across documents is not in every
     * engine. Tag clones above still cover StyleX and globals.css.
     */
  }
  return Promise.all(pending);
}

/**
 * Match the preview <html> theme and fonts; lang is this tile's locale.
 */
function copyHtmlChrome(html: HTMLElement, locale: AppLocale) {
  const source = document.documentElement;

  html.className = source.className;
  html.style.cssText = source.style.cssText;
  html.lang = locale;

  const theme = source.getAttribute("data-theme");

  if (theme) {
    html.setAttribute("data-theme", theme);
  } else {
    html.removeAttribute("data-theme");
  }
}

/**
 * Same body lock the app layout uses, so main can flex-grow to the
 * iframe sheet.
 */
function applyBodySheet(body: HTMLElement) {
  const { className, style } = stylex.props(globalStyles.body);

  body.className = className ?? "";

  if (style) {
    Object.assign(body.style, style);
  }
}

/**
 * Room for one tile: half the desk width, and the pane height minus
 * the caption so a full-size sheet still fits on one screen.
 */
function tileBudget(desk: HTMLElement) {
  const deskStyle = getComputedStyle(desk);
  const paddingX =
    parseFloat(deskStyle.paddingLeft) + parseFloat(deskStyle.paddingRight);
  const paddingY =
    parseFloat(deskStyle.paddingTop) + parseFloat(deskStyle.paddingBottom);
  const grid = desk.firstElementChild;
  const columnGap =
    grid instanceof HTMLElement
      ? parseFloat(getComputedStyle(grid).columnGap) || 0
      : 0;
  const caption = desk.querySelector("[data-viewport-tile-caption]");
  const cell = caption?.parentElement;
  const cellGap = cell ? parseFloat(getComputedStyle(cell).gap) || 0 : 0;
  const captionHeight = caption?.getBoundingClientRect().height ?? 0;

  return {
    height: desk.clientHeight - paddingY - captionHeight - cellGap,
    width: (desk.clientWidth - paddingX - columnGap) / 2,
  };
}

/**
 * Fit the token sheet in the pane. Never scale up: a 568px phone
 * stays 568px when the desk is taller. 4K still shrinks.
 */
function useFitScale(viewport: Viewport) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    const update = () => {
      const { height, width } = tileBudget(host);
      const next = Math.min(
        1,
        width / viewport.width,
        height / viewport.height,
      );

      setScale(Number.isFinite(next) && next > 0 ? next : 0);
    };

    update();

    const observer = new ResizeObserver(update);

    observer.observe(host);

    return () => {
      observer.disconnect();
    };
  }, [viewport.height, viewport.width]);

  return [hostRef, scale] as const;
}

function LocaleViewportFrame({
  locale,
  Page,
  scale,
  viewport,
}: Readonly<{
  locale: AppLocale;
  Page: ComponentType;
  scale: number;
  viewport: Viewport;
}>) {
  const [frameDoc, setFrameDoc] = useState<Document | null>(null);
  const [stylesReady, setStylesReady] = useState(false);
  const caption = captionForLocale(locale);

  useLayoutEffect(() => {
    if (!frameDoc) {
      return;
    }

    const copies = new Map<Element, { clone: HTMLElement; content: string }>();
    void copyParentStyles(frameDoc, copies).then(async () => {
      await frameDoc.fonts.ready;
      setStylesReady(true);
    });
    copyHtmlChrome(frameDoc.documentElement, locale);
    applyBodySheet(frameDoc.body);

    const headObserver = new MutationObserver(() => {
      void copyParentStyles(frameDoc, copies);
    });
    const htmlObserver = new MutationObserver(() => {
      copyHtmlChrome(frameDoc.documentElement, locale);
    });

    headObserver.observe(document.head, {
      childList: true,
      subtree: true,
    });
    htmlObserver.observe(document.documentElement, {
      attributes: true,
    });

    return () => {
      setStylesReady(false);
      headObserver.disconnect();
      htmlObserver.disconnect();
    };
  }, [frameDoc, locale]);

  const onFrameLoad = (event: SyntheticEvent<HTMLIFrameElement>) => {
    const doc = event.currentTarget.contentDocument;

    if (!doc) {
      return;
    }

    copyHtmlChrome(doc.documentElement, locale);
    applyBodySheet(doc.body);
    setFrameDoc(doc);
  };

  const scaledWidth = viewport.width * scale;
  const scaledHeight = viewport.height * scale;
  const frameProps = stylex.props(styles.frame);

  return (
    <div {...stylex.props(styles.cell)}>
      <span data-viewport-tile-caption="" {...stylex.props(styles.caption)}>
        {caption}
      </span>
      <div {...stylex.props(styles.stage)}>
        <div
          style={{
            height: scaledHeight,
            overflow: "hidden",
            visibility: scale > 0 && stylesReady ? "visible" : "hidden",
            width: scaledWidth,
          }}
        >
          <iframe
            {...frameProps}
            height={viewport.height}
            onLoad={onFrameLoad}
            srcDoc={FRAME_SRC_DOC}
            style={{
              ...frameProps.style,
              height: viewport.height,
              transform: `scale(${scale})`,
              width: viewport.width,
            }}
            title={`${caption} · ${viewport.name}`}
            width={viewport.width}
          />
        </div>
      </div>
      {frameDoc && stylesReady
        ? createPortal(
            <NextIntlClientProvider
              locale={locale}
              messages={messagesByLocale[locale] as AbstractIntlMessages}
            >
              <Page />
            </NextIntlClientProvider>,
            frameDoc.body,
          )
        : null}
    </div>
  );
}

/**
 * Right-hand locales, top to bottom. English stays on the left of
 * every row; a locale missing from routing is skipped.
 */
const comparedLocales = (["pt-BR", "ru", "uk"] as const).filter((locale) =>
  routing.locales.includes(locale),
);

/**
 * One token viewport, English on the left of every row and one other
 * routing locale on the right. The Storybook pane is the desk; each
 * tile is the named sheet, never larger than the token size.
 */
export function ViewportLocaleTiles({
  Page,
  viewport,
}: Readonly<{
  Page: ComponentType;
  viewport: Viewport;
}>) {
  const [hostRef, scale] = useFitScale(viewport);

  return (
    <div ref={hostRef} {...stylex.props(styles.desk)}>
      <div {...stylex.props(styles.grid)}>
        {comparedLocales.map((locale) => (
          <Fragment key={locale}>
            <LocaleViewportFrame
              locale={routing.defaultLocale}
              Page={Page}
              scale={scale}
              viewport={viewport}
            />
            <LocaleViewportFrame
              locale={locale}
              Page={Page}
              scale={scale}
              viewport={viewport}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
