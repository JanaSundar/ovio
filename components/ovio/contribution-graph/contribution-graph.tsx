"use client";

import {
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { useReducedMotionSafe } from "@/lib/motion";
import { dayIndexOf } from "./grid";
import {
  buildContributionYear,
  type ContributionCell,
  type ContributionDay,
  type ContributionYear,
} from "./year";
import { MinimalContributionGraph } from "./worlds/minimal";
import { CraftContributionGraph } from "./worlds/craft";
import { RetroContributionGraph } from "./worlds/retro";
import { ToyContributionGraph } from "./worlds/toy";
import { formatNumber } from "@/lib/format";

export { buildContributionYear };
export type { ContributionCell, ContributionDay, ContributionYear };

export type ContributionAnimation = "none" | "enter-exit" | "always";

export type ContributionGraphProps = {
  /** Daily counts; gaps become zero. Dates are "YYYY-MM-DD". */
  data: ContributionDay[];
  variant?: World;
  /** Entrances, plus ambient loops with "always". Forced to "none" under reduced motion. */
  animation?: ContributionAnimation;
  /** Last day shown, "YYYY-MM-DD". Defaults to the latest date in `data`. */
  endDate?: string;
  /**
   * Months to show on screens under 1024px wide, so the cells stay large. Left out, the full year
   * scrolls sideways there instead. Toy's drum always shows the full year.
   */
  compactMonths?: number;
  /** Fires with the day under the pointer or keyboard focus, and null when it leaves. */
  onDayHover?: (day: ContributionCell | null) => void;
  className?: string;
};

/** Event handlers and attributes for the element with role="grid". */
type ContributionGridProps = {
  role: "grid";
  "aria-label": string;
  onPointerOver: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

/** Everything a world needs to draw the graph. Worlds only render; state lives here. */
export type ContributionGraphWorldProps = {
  year: ContributionYear;
  /** The day under the pointer or focus. */
  active: ContributionCell | null;
  /** The single tab stop of the grid (roving tabindex). */
  focusIndex: number;
  /** Resolved animation: "none" under reduced motion. */
  animation: ContributionAnimation;
  grid: ContributionGridProps;
  className?: string;
};

const NARROW = "(max-width: 1023.98px)";

/** Whether the screen is under 1024px wide; false on the server and the first render. */
function useNarrow() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(NARROW);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

export function ContributionGraph({
  data,
  variant,
  animation = "enter-exit",
  endDate,
  compactMonths,
  onDayHover,
  className,
}: ContributionGraphProps) {
  const world = useWorld(variant);
  const reduced = useReducedMotionSafe();
  const narrow = useNarrow();
  const weeks =
    compactMonths && narrow && world !== "toy"
      ? Math.min(53, Math.ceil((compactMonths * 365) / 12 / 7) + 1)
      : 53;
  const year = useMemo(
    () => buildContributionYear(data, { end: endDate, weeks }),
    [data, endDate, weeks],
  );
  const lastIndex = year.days.length - 1;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [focusState, setFocusState] = useState<number | null>(null);
  const focusIndex = Math.min(lastIndex, focusState ?? lastIndex);
  const focusWithin = useRef(false);

  const activate = (index: number | null) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    onDayHover?.(index === null ? null : year.days[index]);
  };

  const grid: ContributionGridProps = {
    role: "grid",
    "aria-label": `${formatNumber(year.total)} contributions from ${year.days[0].label} to ${year.days[lastIndex].label}`,
    onPointerOver: (e) => {
      const i = dayIndexOf(e.target);
      if (i !== null) activate(i);
    },
    onPointerLeave: () => activate(focusWithin.current ? focusIndex : null),
    onFocus: (e) => {
      const i = dayIndexOf(e.target);
      if (i === null) return;
      focusWithin.current = true;
      setFocusState(i);
      activate(i);
    },
    onBlur: (e) => {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      focusWithin.current = false;
      activate(null);
    },
    onKeyDown: (e) => {
      const step: Record<string, number> = {
        ArrowUp: -1,
        ArrowDown: 1,
        ArrowLeft: -7,
        ArrowRight: 7,
      };
      const next =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? lastIndex
            : e.key in step
              ? focusIndex + step[e.key]
              : null;
      if (next === null) return;
      e.preventDefault();
      if (next < 0 || next > lastIndex) return;
      e.currentTarget.querySelector<HTMLElement>(`[data-index="${next}"]`)?.focus();
    },
  };

  const props: ContributionGraphWorldProps = {
    year,
    active: activeIndex === null ? null : (year.days[activeIndex] ?? null),
    focusIndex,
    animation: reduced ? "none" : animation,
    grid,
    className,
  };

  switch (world) {
    case "craft":
      return <CraftContributionGraph {...props} />;
    case "retro":
      return <RetroContributionGraph {...props} />;
    case "toy":
      return <ToyContributionGraph {...props} />;
    default:
      return <MinimalContributionGraph {...props} />;
  }
}
