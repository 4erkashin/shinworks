"use client";

import { type ReactNode, useEffect, useState } from "react";

/** Browser MSW is on unless `NEXT_PUBLIC_MSW=0`. */
const isDisabled = process.env.NEXT_PUBLIC_MSW === "0";

function toError(caught: unknown) {
  return caught instanceof Error
    ? caught
    : new Error("MSW failed to start", { cause: caught });
}

/**
 * Do not start the worker from `instrumentation-client.ts`. Next does not
 * await async work there, so the first `useQuery` races `worker.start()`.
 */
export function MswGate({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [ready, setReady] = useState(isDisabled);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isDisabled) {
      return;
    }

    async function start() {
      try {
        const { startBrowserWorker } = await import("./browser");
        await startBrowserWorker();
        setReady(true);
      } catch (caught) {
        setError(toError(caught));
      }
    }

    void start();
  }, []);

  /**
   * Error boundaries miss throws in effects. Throw while rendering so
   * `global-error.tsx` can catch a layout failure.
   */
  if (error) {
    throw error;
  }

  if (!ready) {
    return null;
  }

  return children;
}
