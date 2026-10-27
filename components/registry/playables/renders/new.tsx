"use client";

import { useState } from "react";
import {
  ContextMenu,
  type ContextMenuItem,
} from "@/components/interactions/context-menu/context-menu";
import { FluidRangeSlider } from "@/components/interactions/fluid-range-slider/fluid-range-slider";
import { PeelToReveal } from "@/components/interactions/peel-to-reveal/peel-to-reveal";
import {
  Testimonials,
  type Testimonial,
} from "@/components/interactions/testimonials/testimonials";
import { renderer, type Renders } from "./types";

const icon = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

export const MENU_ITEMS: ContextMenuItem[] = [
  { type: "label", label: "lumen / src / machine.ts" },
  { id: "open", label: "Open", shortcut: "↵", icon: icon("M5 12h14M13 6l6 6-6 6") },
  { id: "rename", label: "Rename", shortcut: "F2", icon: icon("M4 20h4L19 9l-4-4L4 16zM14 6l4 4") },
  { id: "duplicate", label: "Duplicate", shortcut: "⌘D", icon: icon("M8 8h11v11H8zM5 16V5h11") },
  {
    id: "share",
    label: "Copy link",
    shortcut: "⌘L",
    icon: icon(
      "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
    ),
  },
  { type: "separator" },
  {
    id: "history",
    label: "Show history",
    icon: icon("M12 7v5l3 2M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"),
  },
  {
    id: "archive",
    label: "Archive",
    disabled: true,
    icon: icon("M4 5h16v4H4zM5 9v10h14V9M10 13h4"),
  },
  { type: "separator" },
  {
    id: "delete",
    label: "Delete",
    shortcut: "⌫",
    destructive: true,
    icon: icon("M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"),
  },
];

export const QUOTES: Testimonial[] = [
  {
    quote:
      "We swapped our settings sliders for Ovio's in an afternoon. Support tickets about 'the jumpy control' stopped that week.",
    name: "Mei Tanaka",
    role: "Design engineer, Kestrel Cloud",
  },
  {
    quote: "The context menu passes our screen-reader audit out of the box. That never happens.",
    name: "Jonas Weber",
    role: "Accessibility lead, Northwind",
  },
  {
    quote:
      "Our launch page used the peel card for the invite code. People shared screenshots of peeling it.",
    name: "Priya Raman",
    role: "Founder, Quill",
  },
  {
    quote: "Source in our repo, not a black box. We changed the spring in two lines.",
    name: "Leo Duarte",
    role: "Staff engineer, Orbit",
  },
];

/** The code under the sticker. */
export function LaunchCode() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 text-center">
      <span className="font-mono text-[11px] tracking-[0.18em] text-[#75757f] uppercase">
        Launch code
      </span>
      <span className="font-mono text-3xl font-semibold tracking-[0.08em] text-[#ededf0]">
        LMN-7K2F
      </span>
      <span className="text-xs text-[#a9a9b3]">Good for one seat at FRAME/26</span>
    </div>
  );
}

/** The context menu's area, with the last action it ran. */
function MenuArea(props: { label?: string; longPress?: number; disabled?: boolean }) {
  const [ran, setRan] = useState<string>();
  return (
    <ContextMenu
      items={MENU_ITEMS}
      onSelect={(item) => setRan(item.label)}
      {...props}
      className="w-full max-w-sm rounded-2xl"
    >
      <div className="flex h-56 flex-col justify-between rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-white/[0.06] font-mono text-xs text-[#a9a9b3]">
            TS
          </span>
          <span className="flex flex-col">
            <span className="text-sm text-[#ededf0]">machine.ts</span>
            <span className="font-mono text-[11px] text-[#75757f]">4.2 kB · edited 2h ago</span>
          </span>
        </div>
        <span className="text-center font-mono text-[11px] tracking-wider text-[#75757f] uppercase">
          {ran ? `Ran “${ran}”` : "Right-click · long-press · Shift F10"}
        </span>
      </div>
    </ContextMenu>
  );
}

const RENDERS: Renders = {
  "fluid-range-slider": (p) => (
    <div className="w-full max-w-sm">
      <FluidRangeSlider {...p} />
    </div>
  ),
  "context-menu": (p) => <MenuArea {...p} />,
  "peel-to-reveal": (p) => (
    <div className="w-full max-w-sm">
      <PeelToReveal label="Launch code" {...p}>
        <LaunchCode />
      </PeelToReveal>
    </div>
  ),
  testimonials: (p) => <Testimonials items={QUOTES} {...p} />,
};

export default renderer(RENDERS);
