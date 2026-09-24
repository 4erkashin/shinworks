import { environmentManager, QueryClient } from "@tanstack/react-query";

/** App query defaults. Storybook calls this; the app uses `getQueryClient()`. */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 60_000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Per-request client on the server (no leaked cache across users). Browser
 * singleton so React does not throw the cache away on a re-render.
 *
 * This site does not prefetch in RSC or wrap with HydrationBoundary.
 * Browser MSW would not see those server fetches.
 */
export function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
