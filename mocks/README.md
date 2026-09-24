# MSW (browser)

Mocks are **on** so you can stub endpoints that do not exist yet. Unhandled `fetch` hits the real network.

- Kill switch: `NEXT_PUBLIC_MSW=0` (see `.env.example`).
- Unhandled requests **bypass** (no warning). MSW logs when a handler matches.
- Put handlers in `handlers.ts` (starts empty).

## Remove MSW

Query stays (`lib/query/`). Sweep:

1. Delete `mocks/` and `public/mockServiceWorker.js`.
2. Remove `MswGate` from `app/providers.tsx` (keep `QueryProvider`).
3. `pnpm remove msw`, drop the `msw` key in `package.json`, and drop `msw` from `allowBuilds` in `pnpm-workspace.yaml`.

## Node / RSC later

The worker only intercepts **browser** `fetch`. Server Components, Route Handlers, and Server Actions do not hit it.

To intercept Node `fetch` later: `setupServer(...handlers)` from `msw/node`, start it from `instrumentation.ts` when `NEXT_RUNTIME === 'nodejs'`, and treat Next's fetch cache as part of the wiring. That path bitrots across Next upgrades; add it when an app actually prefetches on the server.
