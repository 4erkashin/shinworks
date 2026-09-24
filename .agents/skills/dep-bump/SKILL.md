---
name: dep-bump
description: >-
  Answers whether to take a Renovate dependency PR: what changed in plain
  English, should I update, and whether a version bump is enough or a dedicated
  CLI is required. Use when reviewing a Renovate or mend[bot] PR, a lockfile
  maintenance PR, a [SECURITY] dep PR, or when the user asks if they should
  update a dependency.
---

Review a dependency bump against **this** repo. Do not restate the version table Renovate already printed.

## Done when

The reply has three explicit answers:

1. **What changed** — one short paragraph in plain English, mapped to files or behavior in this tree when that is knowable.
2. **Should I** — merge / hold / close, with one reason.
3. **Bump vs CLI** — which row of the table below applies, and the exact command if a CLI is required.

## Steps

1. Confirm the PR is Renovate (`renovate[bot]` / `mend[bot]`, `dependencies` label, lockfile-maintenance title, or `[SECURITY]` suffix). If it is Dependabot version-updates, say so: this repo’s version bot is Renovate; Dependabot should only be alerts.
2. Read the PR body (changelog / release notes / commits) and the diff (`package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` overrides).
3. Classify every direct package in the PR against the table. Families move together; a mixed PR that glues a Next major to Prettier is a hold.
4. Answer the three questions. If a CLI is required, the bot did not run it — say the command to run **on the PR branch**.
5. Stop. Do not merge, do not run the CLI, unless the user asked for that next.

## Dedicated CLI vs bump

| When the PR touches | Path | Command on the PR branch |
| --- | --- | --- |
| `next` / `eslint-config-next` (and React if it moved with them) | **CLI**, especially majors | `npx @next/codemod upgrade` |
| `storybook` / `@storybook/*` / `eslint-plugin-storybook` | **CLI**, especially majors | `npx storybook@latest upgrade` |
| `eslint` **major** | **CLI** | official ESLint codemod for that major (see ESLint migrate docs) |
| `msw-storybook-addon` 2→3 (already on 3: further majors, read their MIGRATION) | **CLI** if they publish one | `npx msw-storybook-migrate` for 2→3 |
| `playwright` | bump, then reinstall browsers | `pnpm exec playwright install` |
| `prettier` | bump, then rewrite the tree | `pnpm format` |
| `typescript` **major** | bump is not enough; sequential 5→6→7 | no CLI — read the TypeScript blog for that major, then `tsconfig` |
| lockfile maintenance (no `package.json` change) | review the lockfile delta | none |
| everything else in this `package.json` | version bump + that package’s changelog | none |

Hold Next / Storybook / TypeScript / ESLint **majors** until someone runs the CLI (or reads the TS major notes). Close a PR that only exists because two bots opened the same bump.

Background and first-party links: `docs/research/dep-upgrade-loop.md`.
