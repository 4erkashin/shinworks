"use client";

import { useSearchParams } from "next/navigation";
import { type ReactNode } from "react";

/**
 * Layouts do not get search params. This island reads `?grid` on navigation
 * without making the rest of the locale tree a Client Component.
 */
export function PageGridOverlayGate({
  children,
}: Readonly<{ children: ReactNode }>) {
  const searchParams = useSearchParams();

  if (!searchParams.has("grid")) {
    return null;
  }

  return children;
}
