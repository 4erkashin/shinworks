import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

let starting: Promise<unknown> | undefined;

export function startBrowserWorker() {
  if (!starting) {
    starting = worker.start({
      onUnhandledRequest: "bypass",
    });
  }

  return starting;
}
