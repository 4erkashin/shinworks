# Shinworks

Personal site of Iurii Cherkashin. The public home page is a glitch title, locale routing, and a theme switcher.

- App Router, TypeScript
- `app` / `ui` / `features` / `domain` / `lib` layers
- StyleX (Babel + PostCSS)
- Tokens Studio JSON → StyleX vars
- Storybook
- Motion (`motion/react`) for layout and drag
- next-intl (`en` / `ru` / `uk` / `pt-BR`)
- TanStack Query
- browser MSW
- pnpm
- ESLint / Prettier
- SVGR (Turbopack)

## Run locally

Node **24** (`engines.node` in `package.json`). [fnm](https://github.com/Schniz/fnm) is one way to get it:

```bash
fnm install 24
fnm use 24
```

Install [pnpm](https://pnpm.io/installation) with the standalone script or `npm install -g pnpm`. The lockfile pin is `packageManager` in `package.json`.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm storybook  # http://localhost:6006
```

No `.env*` file is required for local development. `pnpm storybook` starts Storybook and reuses a Next.js server already responding on port 3000, or starts one if needed. The `App/Home` entry includes an `OG images` story with the generated image for every locale.

`dev`, `storybook`, `typecheck`, and `build` run `tokens:build` first. While `dev` or Storybook is running, edits to `tokens/tokens.json` rebuild generated files. Do not edit `tokens/generated/`.

## Environment variables

Names and comments live in `.env.example`. Every value there is commented. `.env*` stays gitignored except that example, and none of these variables is a secret.

| Variable                | Where it is read                                  | Unset                                                                                                    | Set when                                                               |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_MSW`       | App (`mocks/msw-gate.tsx`)                        | The browser worker stays on in `pnpm dev`.                                                               | `0` turns that worker off.                                             |
| `SITE_URL`              | App (`app/[locale]/layout.tsx`)                   | `metadataBase` is `http://localhost:3000`, or `https://${VERCEL_URL}` when that host is set.             | App project: the canonical app origin, once the domain exists.         |
| `STORYBOOK_OG_BASE_URL` | Storybook build (`app/[locale]/page.stories.tsx`) | OG image URLs use `http://localhost:3000`.                                                               | Storybook project: the same canonical app origin as `SITE_URL`.        |
| `STORYBOOK_URL`         | App (`lib/environment.ts`)                        | `readEnvironmentVariable` returns nothing. No caller uses it, and the home page does not link Storybook. | App project: the Storybook production origin, once that domain exists. |

The app and Storybook are separate Vercel projects. Those production origins are not assigned yet, so the example file keeps `https://example.com` and `http://localhost:6006` as commented samples only.

## Releases

Pull requests run CI and do not create Vercel deployments. Git pushes do not deploy either project. To release several merged pull requests together, tag the chosen `main` commit with a `v.*` tag (for example, `v.0.0.1`) and push the tag.

`.github/workflows/release.yml` checks that the tagged commit is an ancestor of `main`, then deploys Storybook, waits for that deploy, then deploys the app. After both succeed, it creates a GitHub Release for the tag with generated notes. Both deployments are recorded on the GitHub `production` environment. A failed check or deployment stops the later steps.

The workflow uses the GitHub Actions secret `VERCEL_TOKEN`, with access to both Vercel projects. Rotate it before it expires. The workflow's Vercel project ids and app URL stay on the previous template projects until the Shinworks Vercel projects exist; the production URLs are filled in then.

CI (`.github/workflows/ci.yml`) runs on pull requests and manual dispatch: format, typecheck, lint, unit tests, `pnpm build`, and `pnpm build-storybook`.

## Internationalization (next-intl)

Locales live in `i18n/routing.ts`: English is unprefixed (`/`), the others are `/ru`, `/uk`, `/pt-BR`. Copy sits in `messages/{locale}.json` beside the page, feature, or UI component that owns it. `i18n/catalogs/` merges those files with explicit imports. The app loads only the requested locale; Storybook loads every locale. TypeScript keys and ICU arguments are typed from the aggregated English catalog.

- Import `Link` / `useRouter` / `usePathname` / `redirect` / `permanentRedirect` from `@/i18n/navigation`, not `next/link` or `next/navigation`. `notFound`, `useParams`, and `useSearchParams` stay on `next/navigation`.
- First visit negotiates `Accept-Language` (then a cookie). Unknown languages fall back to `en`.
- Storybook has a locale toolbar (`storybook-next-intl`).

## StyleX and tokens

`tokens/tokens.json` → gitignored `tokens/generated/`. Do not edit generated files. `dev`, `typecheck`, `storybook`, and `build` generate first. `dev` and `storybook` then watch the token sources and rebuild.

- Themes: `light` / `dark` / `system` from `@/tokens/generated/themes`.
- Motion tweens: `tokens/generated/motion.ts`. Reduced motion is `MotionConfig`.
- `stylex.create`; nest conditions on the property.
- CSS motion: generated `motion` vars + `queries.reducedMotion`. Cookbook: `ui/cookbook-stylex/`.
- `motion/react`: layout / drag / sequence, not hover color. Cookbook: `ui/cookbook-motion/`.
- Next: Babel + PostCSS. Storybook: `@stylexjs/unplugin` + addon-themes (toolbar ≠ cookie).
- Reset: `modern-normalize`, then a `preflight` layer: UA block margins off; headings inherit size and weight; links inherit color and decoration.

## Typography

Sans is Onest in `theme/fonts.ts`, a **variable face**: CSS var `--font-sans`, token `fonts.sans`. It is the document default (`<html>`). Mono is JetBrains Mono the same way (`--font-mono`, `fonts.mono`). Where the code already sets `fonts.mono`, it stays mono. `fontWeight` on those variable faces are real cuts, not fakes.

## Client data (Query + MSW)

`pnpm dev` starts a **browser** Mock Service Worker. Add handlers for endpoints that do not exist yet; everything else hits the real network. Handlers live in `mocks/handlers.ts` (empty until you add some).

- Kill switch: `NEXT_PUBLIC_MSW=0` (see `.env.example`).
- Remove MSW: delete `mocks/`, drop `MswGate` from `app/providers.tsx`. Full sweep: [`mocks/README.md`](mocks/README.md).
- Query (`lib/query/`) stays when MSW goes.

## Dependency updates

Direct deps are exact versions (no `^`, no `latest`). `packageManager` pins pnpm. Renovate opens grouped PRs weekly; nothing auto-merges. The GitHub App is already installed on the account. Config is `renovate.json`.

## Git hooks

`commit-msg`, `pre-commit`, and `pre-push` run through lefthook. Do not pass `--no-verify` to dodge them.

### Commit messages

Every commit is `type: subject`. The first line is a **type** (what kind of change), a colon and space, then a short **subject** (what changed). Allowed types are listed in `conventional-commits.json`; the `commit-msg` hook rejects anything else.

```
feat: add password reset
```

**Scope** is optional. Put the area of the code in parentheses between the type and the colon when that helps — a package, route, or layer, not a ticket number.

```
fix(api): handle empty payload
```

**`!`** is optional. Put it immediately before the colon when the change is **breaking** (callers or users must change how they use this). That is what would become a major version if this repo ever published a package.

```
feat!: drop v1 routes
feat(api)!: require auth on /export
```

`feat` is a new capability, `fix` is a bug fix, `!` is breaking. Other types (`docs`, `chore`, `refactor`, …) are for humans and tools; they do not imply a version bump.

Prefixes listed as `exceptions` in that file skip the type check.

### pre-commit

Prettier formats staged files and may restage them. ESLint then autofixes staged JS/TS and restages those fixes. The commit is refused when an ESLint error remains after that autofix, when a staged file contains git conflict markers, or when you stage `.env` / `.env.*` (`.env.example` is allowed). If you stage token JSON or `tokens/build.js`, `pnpm tokens:build` runs.

### pre-push

`pnpm typecheck` runs when the push includes TypeScript, `tsconfig*.json`, `package.json`, `pnpm-lock.yaml`, `next.config.*`, token sources, `babel.config.js`, or `postcss.config.*`. Docs-only pushes skip it.

## Bundle analysis

This app builds with Turbopack. When a client import looks heavy, inspect the production graph (Next 16.1+):

```bash
pnpm next experimental-analyze
```

`--output` writes `.next/diagnostics/analyze` for before/after diffs. The command is experimental; there is no `analyze` script, so the CLI name stays the one Next ships. Storybook is Vite — this UI does not cover it.

## Not shipping

Decisions to leave these tools out of the repo and out of CI.

### Knip

[Knip](https://knip.dev/) finds unused files, unused exports, and leftover `package.json` dependencies. ESLint only sees unused locals inside a file.

It auto-detects Next `app/**/page` and Storybook `*.stories.*`. It does not understand `tokens/build.js`, gitignored StyleX under `tokens/generated/`, the MSW worker in `public/`, or empty `features/` / `domain/` placeholders. Keeping that ignore/entry list honest would be ongoing contract for this repo.

Unused locals stay an ESLint warning. Unused packages stay a Renovate/review problem. Run `npx knip` ad hoc if you want a one-shot report; do not add the dependency.

### Cycle detection

File cycles (`a.ts` → `b.ts` → `a.ts`) can yield `undefined` at module init. CI does not fail on them.

`import/no-cycle` skips type-only imports (this repo uses those on purpose) and gets expensive as the tree grows. madge / dependency-cruiser need the same ignore/entry list as Knip: generated tokens, Storybook, scripts, mixed `@/` and relative StyleX paths.

Layer _direction_ is already ESLint: `ui/` must not import `features/` or `domain/`. Barrels (`index.ts` as a public API) are allowed; do not add a scanner to police them.

Run `npx madge --circular --extensions ts,tsx --ts-config tsconfig.json app ui lib theme i18n mocks features domain` ad hoc if you want a one-shot report. Do not add the dependency.

### `@next/bundle-analyzer`

The Webpack plugin (`ANALYZE=true next build`). Extra dependency, wraps `next.config`, and does not replace the Turbopack analyzer above. Do not add it.

### Bundle-size budget

No kilobyte cap in CI. CI runs `pnpm build` and `pnpm build-storybook`. An absolute first-load cap goes stale the day a feature lands; a percent-vs-`main` check needs a stored baseline and a production build on every pull request. Use **Bundle analysis** when something feels wrong. Do not add `size-limit`, bundlesize, or a first-load JS gate.
