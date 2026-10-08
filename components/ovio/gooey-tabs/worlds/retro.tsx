"use client";

import { steps } from "@/lib/motion";
import { GooTabs, type GooLook } from "../goo";
import type { GooeyTabsWorldProps } from "../gooey-tabs";

const look: GooLook = {
  world: "retro",
  track: { background: "var(--ovio-track)", border: "3px double #3fae55", borderRadius: 0 },
  blob: "var(--ovio-accent)",
  blobRadius: "0px",
  on: "#061108",
  off: "#6dff8a",
  tab: "py-2 text-2xl tracking-[0.04em] uppercase [text-shadow:var(--ovio-glow)]",
  label: "text-lg tracking-[0.04em] uppercase",
  statusText: "text-[26px] uppercase [text-shadow:var(--ovio-glow)]",
  // Old hardware: the indicator jumps in hard frames.
  trail: [
    { duration: 0.26, ease: steps(4) },
    { duration: 0.4, ease: steps(5) },
    { duration: 0.52, ease: steps(6) },
  ],
  dots: ["#1d5a2b", "#ffd34d", "#4fdc68"],
  colorDelay: 0.12,
};

export function RetroGooeyTabs(props: GooeyTabsWorldProps) {
  return <GooTabs look={look} {...props} />;
}
