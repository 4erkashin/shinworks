import { notFound } from "next/navigation";

/**
 * Unmatched URLs do not render `not-found.tsx` unless `notFound()` is thrown.
 * next-intl’s App Router example uses this catch-all for that.
 */
export default function CatchAllPage() {
  notFound();
}
