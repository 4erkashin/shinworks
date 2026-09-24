"use client";

import type { ReactNode } from "react";

import { MotionConfig } from "motion/react";

export function MotionProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Library default is "never" (ignore the OS). "user" honors prefers-reduced-motion.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
