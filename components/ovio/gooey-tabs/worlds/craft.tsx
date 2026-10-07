"use client";

import { GooTabs, type GooLook } from "../goo";
import type { GooeyTabsWorldProps } from "../gooey-tabs";

const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

const look: GooLook = {
  world: "craft",
  track: {
    background: "var(--ovio-track)",
    borderRadius: 18,
    boxShadow: "inset 0 2px 4px rgba(70,45,20,.15), 0 1px 0 rgba(255,255,255,.8)",
  },
  blob: "var(--ovio-accent)",
  blobRadius: "13px",
  on: "#fff6ea",
  off: "#6e5a45",
  tab: "py-[13px] text-[15px] font-bold tracking-[-0.01em]",
  label: "text-[13px]",
  statusText: "text-xl font-bold",
  // Paper settles with a springy overshoot, each blob a beat behind the last.
  trail: [
    { duration: 0.55, ease: OVERSHOOT },
    { duration: 0.7, ease: OVERSHOOT },
    { duration: 0.85, ease: OVERSHOOT },
  ],
  dots: ["#c9b9a0", "#ee9f63", "#2f9a45"],
  colorDelay: 0.12,
};

export function CraftGooeyTabs(props: GooeyTabsWorldProps) {
  return <GooTabs look={look} {...props} />;
}
