import { NextIntlClientProvider } from "next-intl";
import { type ReactNode } from "react";

import { MotionProvider } from "@/lib/motion/provider";
import { QueryProvider } from "@/lib/query/query-provider";
import { MswGate } from "@/mocks/msw-gate";

/**
 * Server composition only. Each nested provider is already a client module;
 * this file stays on the server so `NextIntlClientProvider` can inherit
 * locale and messages from `getRequestConfig` without those being passed
 * in as props.
 */
export function Providers({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <NextIntlClientProvider>
      <MswGate>
        <QueryProvider>
          <MotionProvider>{children}</MotionProvider>
        </QueryProvider>
      </MswGate>
    </NextIntlClientProvider>
  );
}
