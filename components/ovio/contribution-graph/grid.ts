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
