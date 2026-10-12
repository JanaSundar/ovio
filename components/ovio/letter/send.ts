import type { AnimationOptions, Transition } from "motion/react";
import type { Animate } from "./use-send";

/**
 * The send sequences' shared, React-free pieces: the fold the worlds open with, the email check,
 * and a timing switch that plays a sequence normally or settles it in one frame.
 */

/** Something an email can be: one @, a dot in the domain, no spaces. The server decides the rest. */
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** Seconds, or nothing at all: a sequence replayed on mount, or under reduced motion, lands at once. */
export type Timing = <T extends Transition | AnimationOptions>(transition: T) => T;

export const PLAY: Timing = (transition) => transition;
export const SETTLE: Timing = <T extends Transition | AnimationOptions>() => ({ duration: 0 }) as T;

/**
 * A sheet folding in thirds about its centre: scale down to `s`, then the bottom third up and the
 * top third down, which reads as the height dropping to two thirds and then one third.
 */
export function foldFrames(s: number) {
  const round = (n: number) => Math.round(n * 1e4) / 1e4;
  const w = round(s);
  return [
    "scale(1, 1)",
    `scale(${w}, ${w})`,
    `scale(${w}, ${round((s * 2) / 3)})`,
    `scale(${w}, ${round(s / 3)})`,
  ];
}

/** Fold progress: shrink first, then the two folds. */
const FOLD_TIMES = [0, 0.45, 0.72, 1];

/** The fold's writing fades out as it shrinks, so the outside of the paper shows. */
const INK_TIMES = [0, 0.4, 0.6, 1];

/**
 * Folds a sheet to `s` of its size and then into thirds, fading its writing (the sheet's children)
 * so the blank outside shows. Transform and opacity only, so both run on the compositor.
 */
export function fold(
  animate: Animate,
  sheet: HTMLElement,
  s: number,
  t: Timing,
  ease: AnimationOptions["ease"],
  duration = 0.95,
) {
  return Promise.all([
    animate(sheet, { transform: foldFrames(s) }, t({ duration, ease, times: FOLD_TIMES })),
    animate(
      Array.from(sheet.children),
      { opacity: [1, 1, 0, 0] },
      t({ duration, times: INK_TIMES }),
    ),
  ]);
}
