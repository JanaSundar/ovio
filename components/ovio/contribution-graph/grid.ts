"use client";

import { useLayoutEffect, useRef } from "react";
import { unit, type ContributionCell } from "./year";
import { formatNumber } from "@/lib/format";

/**
 * The attributes every world puts on a day cell. Plain values only, so world cells can be memoised;
 * the grid handles hover, focus and arrow keys by event delegation through data-index.
 */
export function dayCellProps(cell: ContributionCell, tabbable: boolean) {
  return {
    role: "gridcell",
    "data-index": cell.index,
    tabIndex: tabbable ? 0 : -1,
    "aria-label": `${formatNumber(cell.count)} ${unit(cell.count)} on ${cell.label}`,
    style: { gridColumn: cell.week + 1, gridRow: cell.weekday + 1 },
  } as const;
}

/** The day index of the cell an event came from, through data-index. */
export function dayIndexOf(target: EventTarget): number | null {
  const el = (target as HTMLElement).closest?.("[data-index]");
  return el ? Number(el.getAttribute("data-index")) : null;
}

/** A horizontal scroller that starts at its right end, so the latest weeks show first on narrow screens. */
export function useScrollEnd<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);
  return ref;
}
