import type { CSSProperties } from "react";
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

export function dayIndexOf(target: EventTarget): number | null {
  const el = (target as HTMLElement).closest?.("[data-index]");
  return el ? Number(el.getAttribute("data-index")) : null;
}

/** One equal, shrinkable column per week, so the grid always fits its container. */
export const weekColumns = (weeks: number) => ({
  gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
});

/** Below 1024px, the narrowest a week column gets before the grid scrolls instead of shrinking. */
const MIN_WEEK = 16;

/**
 * The scroller around a grid. On phones and tablets the year scrolls rather than shrinking to unreadable
 * cells, and it opens on the latest weeks; desktops fit the whole year. The padding
 * keeps lifted and glowing cells from being clipped; the negative margins cancel it out.
 */
export const weekScroller = {
  className:
    "-mx-1 -mt-3 -mb-2 overflow-x-auto overflow-y-hidden px-1 pt-3 pb-2 [scrollbar-width:thin]",
  ref: (el: HTMLDivElement | null) => {
    if (el) el.scrollLeft = el.scrollWidth;
  },
};

/** Props for the grid's wrapper inside the scroller: a minimum width, applied below 1024px. */
export const weeksMinWidth = (weeks: number) => ({
  className: "max-lg:min-w-(--ovio-weeks-min)",
  style: { "--ovio-weeks-min": `${weeks * MIN_WEEK}px` } as CSSProperties,
});

/** A Motion cubic-bezier easing as a CSS easing string. */
export const cssEase = ([x1, y1, x2, y2]: readonly [number, number, number, number]) =>
  `cubic-bezier(${x1},${y1},${x2},${y2})`;
