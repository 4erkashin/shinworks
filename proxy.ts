import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Explicit `/` so as-needed English still runs locale detection.
    "/",
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
  ],
};
