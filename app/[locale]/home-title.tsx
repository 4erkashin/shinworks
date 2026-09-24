"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Glitch } from "@/ui/glitch";

/**
 * Quiet time before the next color split.
 * Each wait is a new pick from 8 seconds through 32 seconds.
 */
const quietMinMs = 8_000;
const quietMaxMs = 32_000;

/**
 * How long one color split stays visible.
 * Each run is a new pick from 1 second through 3 seconds.
 */
const playMinMs = 1_000;
const playMaxMs = 3_000;

function millisecondsBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function HomeTitle({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  // Hover holds the glitch on so the timed run can be checked by hand.
  const [hovered, setHovered] = useState(false);
  const visible = playing || hovered;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let timer = 0;
    let stopped = false;

    function play() {
      if (stopped) {
        return;
      }

      setPlaying(true);
      timer = window.setTimeout(
        rest,
        millisecondsBetween(playMinMs, playMaxMs),
      );
    }

    function rest() {
      if (stopped) {
        return;
      }

      setPlaying(false);
      timer = window.setTimeout(
        play,
        millisecondsBetween(quietMinMs, quietMaxMs),
      );
    }

    timer = window.setTimeout(
      play,
      millisecondsBetween(quietMinMs, quietMaxMs),
    );

    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <span
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      <Glitch active={visible} colorSplit>
        {children}
      </Glitch>
    </span>
  );
}
