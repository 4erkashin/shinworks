# Shinworks

Personal site of Iurii Cherkashin.

Started from [nextjs-template](https://github.com/4erkashin/nextjs-template). Stack, local setup, tokens, i18n, StyleX, hooks, releases, and the rest of the toolchain are documented there.

## Run

Same as the template: Node 24, pnpm, `pnpm dev` on port 3000, `pnpm storybook` on port 6006.

## This site

Names live in `.env.example`. Home tiles read `GITHUB_URL`, `STORYBOOK_URL`, and `CONTACT_EMAIL` in `lib/environment.ts`. Unset, those are this GitHub repo, `http://localhost:6006` in development and `https://storybook.shinworks.dev/` in production, and `cherkashin.ju@gmail.com`.

## Commit messages

`type: subject`, optional `(scope)`, optional `!` before the colon. Types are in `conventional-commits.json`. [Details](https://github.com/4erkashin/nextjs-template#commit-messages).
