"use client";

import { ease } from "@/lib/motion";
import { GooTabs, type GooLook } from "../goo";
import type { GooeyTabsWorldProps } from "../gooey-tabs";

const look: GooLook = {
  world: "minimal",
  track: { background: "var(--ovio-track)", borderRadius: 14 },
  blob: "var(--ovio-accent)",
  blobRadius: "10px",
  on: "#f5f4f0",
  off: "#4a4944",
  tab: "py-3 text-sm font-medium tracking-[-0.01em]",
  label: "text-xs",
  statusText: "text-lg font-medium",
  trail: [
    { duration: 0.38, ease: ease.glide },
    { duration: 0.55, ease: ease.glide },
    { duration: 0.72, ease: ease.glide },
  ],
  dots: ["#c9c6bf", "#97938a", "#161614"],
  orbitEase: [0.5, 0, 0.5, 1],
  colorDelay: 0.12,
};

export function MinimalGooeyTabs(props: GooeyTabsWorldProps) {
  return <GooTabs look={look} {...props} />;
}
