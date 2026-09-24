# Robots.txt and XML sitemaps in Next.js App Router

**Date:** September 24, 2026  
**Verified Next.js:** `16.3.3` (`package.json` / `next/package.json`)  
**Installed docs tree:** `node_modules/next/dist/docs/` (same major as the package)  
**Live docs compared:** https://nextjs.org/docs (fetched same day)

## Short answer for shinworks

**Add neither right now.** Specs and Google treat both as optional. A tiny personal site with one localized home page per locale does not need a sitemap for discovery if pages are linked (and Google’s own “you might not need a sitemap” bar is about ≤500 important pages). Missing `robots.txt` is not a block: crawlers that get a client-error / missing file may treat the site as fully crawlable. Next.js does **not** invent a default `robots.txt` or `sitemap.xml` when the files are absent — those routes simply are not registered.

When you do want search engines to discover the site more deliberately (new domain, few backlinks), **add both together**: `app/sitemap.ts` listing absolute locale URLs, and `app/robots.ts` that allows crawling and advertises the sitemap with an absolute `Sitemap:` URL. Prefer that over robots-only or a disallow that accidentally blocks the site.

Storybook is a separate deploy; keep it out of the Next app’s robots/sitemap.

---

## Repo context (verified)

| Fact | Evidence |
| --- | --- |
| Next `16.3.3`, React 19, next-intl `4.14.1` | `package.json` |
| App Router under `app/`, locales in `app/[locale]/` | filesystem |
| Locales `en`, `pt-BR`, `ru`, `uk`; `localePrefix: "as-needed"` | `i18n/routing.ts` |
| No `robots.ts` / `robots.txt` / `sitemap.ts` / `sitemap.xml` | confirmed absent under `app/` and `public/` |
| `metadataBase` from `SITE_URL` (fallback Vercel URL / localhost) | `app/[locale]/layout.tsx` → `generateMetadata` |
| `proxy.ts` matcher skips paths with a file extension (`.*\\..*`) | `proxy.ts` — so `/robots.txt` and `/sitemap.xml` would bypass next-intl once added |

---

## 1. `robots.txt` in Next.js App Router

### File conventions

Place in the **root of `app`**:

- Static: `app/robots.txt`
- Generated: `app/robots.ts` or `app/robots.js` exporting a default function that returns `MetadataRoute.Robots`

Sources: installed `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md`; live https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

### `MetadataRoute.Robots` shape

From installed docs and types (`node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts`, `MetadataRoute.Robots` / `RobotsFile`):

- `rules`: one object or an array of objects with `userAgent`, `allow`, `disallow`, optional `crawlDelay`, optional `other` (non-standard per-agent lines)
- `sitemap?: string | string[]`
- `host?: string`

`other` was added in **v16.3.0** (version history in the same robots.md). This install is `16.3.3`, so that field is available.

### Minimal generated shape (official example, trimmed to what matters for a public personal site)

```ts
// app/robots.ts — shape from Next.js robots docs
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

Next serializes this via `resolveRobots` in `node_modules/next/dist/build/webpack/loaders/metadata/resolve-route-data.js` (`User-Agent`, `Allow` / `Disallow`, optional `Crawl-delay`, `other` keys verbatim, then `Host`, then `Sitemap:` lines). There is an in-source TODO: “support injecting sitemap url into robots.txt” — today you must set `sitemap` yourself; Next does not auto-wire `app/sitemap.ts` into robots.

### Caching

Docs: `robots.js` / `robots.ts` is “a special Route Handler that is cached by default unless it uses a Request-time API or dynamic config option.” Same note exists for `sitemap.js`. Metadata file conventions index also says special handlers like `sitemap.ts` are cached by default, and that `proxy.ts` matchers should exclude metadata files when needed (`01-metadata/index.md`).

### What Next emits if you add nothing

**Not found in primary Next.js docs as an explicit “default robots.txt”.** Metadata routes are registered only when matching files exist (`is-metadata-route.js` recognizes `/robots.txt` and `robots.(js|ts|…)` patterns; there is no factory that invents content without a file). So absence means no Next-served robots route — typically a normal app 404 / not-found for `/robots.txt`, not a generated allow-all file.

### Spec / Google default when robots.txt is missing

- **Google** (create robots.txt): unless you specify otherwise, files are implicitly allowed; an allow-all group “could have been omitted and the result would be the same.” `Sitemap:` is optional. Sitemap URL in that directive “must be a fully-qualified URL.”  
  https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt
- **RFC 9309** (§2.3.1.3 Unavailable): if the server responds with client errors indicating the resource is unavailable (HTTP 400–499 examples), “the crawler MAY access any resources on the server.” If robots.txt is unreachable due to **server/network** errors (e.g. 5xx), crawlers **MUST assume complete disallow**.  
  https://www.rfc-editor.org/rfc/rfc9309.html
- Robots.txt is for crawl traffic management, **not** a reliable way to keep pages out of Google index (use `noindex` / auth instead).  
  https://developers.google.com/search/docs/crawling-indexing/robots/intro

Separate “the protocol allows omitting robots.txt / treats missing-as-allow” from “Next special-cases absence”: **Next does not special-case absence with a default file.**

---

## 2. Sitemap in Next.js App Router

### File conventions

- Static: `app/sitemap.xml`
- Generated: `app/sitemap.ts` / `app/sitemap.js` returning `MetadataRoute.Sitemap` (array of URL entries)
- Multiple files: nest `sitemap.(xml|js|ts)` under segments (e.g. `app/products/sitemap.xml`), and/or use `generateSitemaps`

Sources: installed `…/01-metadata/sitemap.md`; `…/04-functions/generate-sitemaps.md`; live equivalents under https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap and `/functions/generate-sitemaps`

### `MetadataRoute.Sitemap` fields

Documented return type (sitemap.md “Returns” + `SitemapFile` in `metadata-interface.d.ts`):

| Field | Role |
| --- | --- |
| `url` | Required location string (examples always absolute) |
| `lastModified` | optional `string \| Date` → `<lastmod>` |
| `changeFrequency` | optional enum → `<changefreq>` |
| `priority` | optional number → `<priority>` |
| `alternates.languages` | optional map → `xhtml:link` hreflang |
| `images` | optional string[] → image sitemap extension |
| `videos` | optional video objects → video extension |

### Multiple sitemaps / `generateSitemaps`

- Nested segment sitemaps, or `generateSitemaps()` returning `{ id }[]`.
- Generated URLs: `/.../sitemap/[id].xml` (e.g. `/product/sitemap/1.xml`).
- **v16.0.0:** `id` passed into the sitemap function is `Promise<string>` (await it). Docs note Google’s **50,000 URLs per sitemap** in the example comments.
- **v15.0.0:** `generateSitemaps` “generates consistent URLs between development and production” (earlier dev path was `/.../sitemap.xml/[id]`).

Next’s examples do **not** show auto-generating a sitemap **index** XML for nested/`generateSitemaps` outputs; they document per-id sitemap URLs. How you list those in robots / Search Console is left to you (protocol supports index files separately — see limits below).

### Localized sitemap (Next-documented)

Next documents `alternates.languages` and emits `xmlns:xhtml` plus `<xhtml:link rel="alternate" hreflang="…" href="…">` (`resolveSitemap` in `resolve-route-data.js`). Version history: localizations since **v14.2.0**.

### What Next emits if you add nothing

Same as robots: **no default sitemap**. Docs only describe behavior once a file exists. No primary source found that Next invents `/sitemap.xml` content without `app/sitemap.*`.

### Sitemap protocol limits

From https://www.sitemaps.org/protocol.html (“Using Sitemap index files”):

- Max **50,000 URLs** per sitemap file  
- Max **50MB (52,428,800 bytes)** uncompressed (gzip allowed; limit applies after decompress)  
- Index files: same size/count caps for listed sitemaps  
- `<loc>` must include protocol; length &lt; 2,048 characters  
- Strongly recommend sitemap at the **site root** so it can include all paths under that host

Google restates the 50k / 50MB limits and: use **fully-qualified absolute URLs**; relative paths like `/mypage.html` are wrong.  
https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

Google also notes it **ignores** `<changefreq>` and `<priority>`; it may use `<lastmod>` if consistently accurate.

### Do you need a sitemap? (Google)

https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview

- **Might need:** large sites; **new sites with few external links**; lots of media/News.  
- **Might not need:** “small” (~**500 pages or fewer** that should appear in results); comprehensively linked internally; little media/News need.

A sitemap helps discovery; it does **not** guarantee crawl/index.

---

## 3. `metadataBase` / `SITE_URL` vs robots & sitemap URLs

### What `metadataBase` is for

`generateMetadata` docs: `metadataBase` is a base URL for **metadata fields** that need fully qualified URLs (relative paths composed with the base). Absolute field URLs ignore `metadataBase`.  
https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase  
Installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`

shinworks sets it in `app/[locale]/layout.tsx` from `SITE_URL` (else `https://${VERCEL_URL}` else `http://localhost:3000`).

### Does it rewrite sitemap / robots URLs?

**No — not according to Next’s sitemap serializer.** Comment in `resolve-route-data.js` `resolveSitemap`:

> “Since sitemap is separated from the page rendering, there's not metadataBase accessible yet.”

It writes `item.url` and language `href`s as provided. Official sitemap/robots examples hard-code absolute origins (`https://acme.com/...`). Robots `sitemap` / `host` are likewise emitted verbatim.

**Practical rule:** build absolute URLs yourself (typically from the same env as `SITE_URL`). Do not assume `metadataBase` will fix relative sitemap entries.

---

## 4. Internationalization (next-intl + Next sitemap)

### next-intl official guidance

https://next-intl.dev/docs/environments/actions-metadata-route-handlers (Sitemap section):

- By **default**, next-intl sends a **`Link` response header** with locale alternates (hreflang). That “sufficiently links localized pages for search engines.”
- You **may** also put alternates in a sitemap via Next’s `alternates.languages`, often with `getPathname` for correct locale prefixes.
- Sitemap is suggested when you have **more specific requirements** (e.g. CMS-driven localized slugs).

https://next-intl.dev/docs/routing/configuration (`alternateLinks`):

- Middleware can emit `link:` headers including `x-default`.
- With `localePrefix: 'never'`, alternate links are disabled; docs say consider a sitemap with `alternates` instead.

shinworks uses `localePrefix: "as-needed"` and default middleware — so **HTTP Link alternates are already in play** without a sitemap.

### Next.js docs

Document `alternates.languages` on sitemap entries and show emitting xhtml hreflang links (sitemap.md). They do **not** document next-intl.

### Google hreflang-in-sitemap rules (stricter shape)

https://developers.google.com/search/docs/specialty/international/localized-versions (Sitemap method):

- One `<url>` **per language version**, and **each** entry lists **every** alternate **including itself** (full bidirectional set).
- Alternate URLs must be fully qualified.
- HTML, HTTP Link headers, and sitemap methods are equivalent from Google’s perspective; using all three adds no Search benefit.

### Where primary sources agree / stay silent

| Topic | Status |
| --- | --- |
| Sitemap can carry hreflang via xhtml links | Next + Google agree |
| `alternates.languages` is a documented Next field | Next yes |
| next-intl documents combining that field with `getPathname` | next-intl yes |
| Whether Next’s **example** shape (one `<url>` with only *other* languages in `languages`, no self-link, not one row per locale) satisfies Google’s “each URL lists all including self” pattern | **Not reconciled in one primary source** — report both shapes; do not invent a single “correct” Next+Google merge beyond citing Google’s page if you need Google-compliant XML |
| Whether shinworks *must* duplicate Link-header hreflang into the sitemap | next-intl: Link header alone is enough for engines; sitemap optional for extras |

For this site’s URLs under `as-needed`: default locale home is `/`; others are `/pt-BR`, `/ru`, `/uk` (per next-intl `localePrefix` docs). Absolute URLs need the production origin from `SITE_URL`.

---

## 5. Tiny personal site: need either file?

| Layer | Verdict |
| --- | --- |
| **Robots Exclusion Protocol / Google** | robots.txt optional; missing/4xx → crawl may proceed (RFC 9309 unavailable; Google implicit allow) |
| **Sitemap protocol / Google** | Optional; small well-linked sites often fine without; new/low-link sites may benefit |
| **Next.js** | No auto-generated robots/sitemap when files absent — not a framework default, just missing routes |
| **next-intl** | Already exposes locale alternates via `Link` headers |

So: **specs allow omitting both**; **Next does not fill the gap**. For an under-construction localized home, omitting both is coherent. Add both when you care about proactive discovery / Search Console.

---

## 6. Production gotchas (documented)

| Gotcha | Source |
| --- | --- |
| Accidental `Disallow: /` (or per-bot disallow of `/`) blocks crawling of the whole site | Next robots examples show this pattern for selected bots; Google create-robots-txt shows `Disallow: /` as “block all crawlers” for that group |
| `Sitemap:` URL must be **absolute** / fully qualified | Google create-robots-txt; sitemaps.org robots.txt submission; Next examples always absolute |
| Sitemap `<loc>` and image/video/alternate hrefs should be absolute | Google build-sitemap; Next serializer does not apply `metadataBase` |
| robots / sitemap Route Handlers **cached by default**; Request-time APIs / dynamic config opt out | robots.md, sitemap.md, metadata files index |
| With `proxy.ts` / middleware, exclude metadata paths in `matcher` if locale middleware would rewrite them | metadata `index.md`; shinworks matcher already skips `.*\\..*` |
| `generateSitemaps` `id` is now a **Promise&lt;string&gt;** (breaking vs older sync `id`) | sitemap.md / generate-sitemaps.md v16.0.0 |
| Dev vs prod URL shape for multi-sitemaps changed in v15 | generate-sitemaps.md |
| Trailing slash / basePath | Next trailingSlash docs don’t special-case robots/sitemap; next-intl documents basePath/trailingSlash for middleware/navigation (getPathname omits basePath — prefix manually). **Not found:** Next robots/sitemap docs discussing trailingSlash or basePath specifically |
| Draft/preview disallow | **Not found** in Next robots/sitemap primary docs as a built-in |
| Host directive | Present on `MetadataRoute.Robots`; Google’s documented robots rules list focuses on user-agent / allow / disallow / sitemap — treat `host` as non-universal |

---

## 7. Next.js 15 / 16 changes (primary sources only)

From installed + live version history tables (no memory claims beyond these):

| Version | Change |
| --- | --- |
| **v16.3.0** | robots `other` field for non-standard directives |
| **v16.0.0** | `generateSitemaps` / sitemap `id` is `Promise&lt;string&gt;` |
| **v15.0.0** | `generateSitemaps` consistent URLs in dev and production |
| **v14.2.0** | Sitemap localizations (`alternates`) |
| **v13.4.14** | `changeFrequency` / `priority` |
| **v13.3.x** | robots / sitemap / generateSitemaps introduced |

**Installed docs vs live docs (Sep 24, 2026):** robots, sitemap, and generate-sitemaps pages matched in substance (same APIs, same version history rows, same examples). No material disagreement found for this topic.

---

## Minimal shapes if you add them later

### `app/robots.ts`

Allow all + point at sitemap (origin from env, not relative):

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.SITE_URL!; // production canonical origin
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
```

### `app/sitemap.ts` (localized marketing home)

Next + next-intl documented pattern (one entry with `alternates.languages`). For Google’s full bidirectional sitemap method, also see Google’s localized-versions page and expand if you need that exact XML shape.

```ts
import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation"; // as in next-intl docs

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = process.env.SITE_URL!;
  return [
    {
      url: host,
      lastModified: new Date(),
      alternates: {
        languages: {
          "pt-BR": host + (await getPathname({ locale: "pt-BR", href: "/" })),
          ru: host + (await getPathname({ locale: "ru", href: "/" })),
          uk: host + (await getPathname({ locale: "uk", href: "/" })),
        },
      },
    },
  ];
}
```

(Adjust keys/`x-default` only when primary sources you target document them; Google documents `x-default` for unmatched languages.)

---

## Do not

- **`Disallow: /`** (or equivalent) on `*` unless you intend to block the whole site from respectful crawlers.
- Put a **relative** URL in robots `Sitemap:` or in sitemap `<loc>` / hreflang hrefs.
- Assume **`metadataBase` / `SITE_URL` will rewrite** sitemap entry URLs for you.
- Expect Next to **auto-create** robots or sitemap when files are missing.
- Use robots.txt as the way to **hide** pages from Google Search (Google: use `noindex` / auth).
- Rely on `<priority>` / `<changefreq>` for Google ranking/crawl (Google ignores them).
- Invent a hreflang strategy that contradicts Google’s bidirectional rules **without** reading Google’s page — Next’s short example and Google’s full matrix are not the same document.

---

## Open questions (docs silent or conflicting)

1. Exact Next.js HTTP status for `/robots.txt` when no file exists (framework 404 vs app `not-found`) — not spelled out in metadata docs; absence of a route is clear from source matching only existing files.
2. Whether Next ever auto-injects `Sitemap:` from `app/sitemap.ts` into robots — source TODO says not yet.
3. How Next’s localized sitemap **example** maps onto Google’s “N urls × N self-inclusive xhtml links” requirement — both documented separately; no joint Next+Google reconciliation in primary sources.
4. Interaction of `trailingSlash` / `basePath` with generated `/robots.txt` and `/sitemap.xml` path strings — not covered in robots/sitemap file-convention docs.
5. Built-in draft/preview disallow patterns — not found in these Next docs.

---

## Primary sources checklist

- Next installed: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/{robots,sitemap,index}.md`, `…/04-functions/generate-sitemaps.md`, `…/04-functions/generate-metadata.md`, `…/01-getting-started/14-metadata-and-og-images.md`
- Next source: `node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts` (`MetadataRoute`), `…/is-metadata-route.js`, `…/build/webpack/loaders/metadata/resolve-route-data.js`
- Live Next: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots (and sitemap, generate-sitemaps, generate-metadata)
- RFC 9309: https://www.rfc-editor.org/rfc/rfc9309.html
- Sitemaps protocol: https://www.sitemaps.org/protocol.html
- Google Search Central: robots intro / create-robots-txt; sitemaps overview / build-sitemap; localized versions
- next-intl: actions-metadata-route-handlers (Sitemap); routing configuration (`alternateLinks`, `localePrefix`)
