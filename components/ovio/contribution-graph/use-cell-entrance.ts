import { useEffect, type RefObject } from "react";

/**
 * A world's entrance: every day cell animates in once, on mount, as one batch of native
 * animations. A year is 371 cells; a Motion component per cell made switching worlds lag.
 * `delay` is in seconds, from the cell's week and weekday. Pass module-level constants for
 * `keyframes` and `timing`, so the entrance runs once per mount and not on every render.
 */
export function useCellEntrance(
  grid: RefObject<HTMLElement | null>,
  enter: boolean,
  keyframes: Keyframe[],
  timing: { duration: number; easing: string; delay: (week: number, weekday: number) => number },
) {
  useEffect(() => {
    const el = grid.current;
    if (!enter || !el) return;
    const animations = [...el.querySelectorAll<HTMLElement>("[data-index]")].map((cell) => {
      const i = Number(cell.dataset.index);
      return cell.animate(keyframes, {
        duration: timing.duration * 1000,
        delay: timing.delay(Math.floor(i / 7), i % 7) * 1000,
        easing: timing.easing,
        fill: "backwards",
      });
    });
    return () => animations.forEach((a) => a.cancel());
  }, [grid, enter, keyframes, timing]);
}
