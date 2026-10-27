/** Value math for the Fluid Range Slider: no React, so it can be tested and reused. */

export type RangeValue = number | [number, number];

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Rounds to the nearest step from `min`, trimming float noise like 0.30000000000000004. */
export function snap(v: number, min: number, max: number, step: number): number {
  if (!(step > 0)) return clamp(v, min, max);
  const decimals = (String(step).split(".")[1] ?? "").length;
  const snapped = min + Math.round((v - min) / step) * step;
  return clamp(Number(snapped.toFixed(decimals)), min, max);
}

/** Where a value sits on the track, 0–100. A zero-width range sits at the start. */
export const percentOf = (v: number, min: number, max: number) =>
  max > min ? ((clamp(v, min, max) - min) / (max - min)) * 100 : 0;

/** The thumbs' values, low to high, whatever shape the value came in. */
export function toThumbs(value: RangeValue, min: number, max: number): number[] {
  if (!Array.isArray(value)) return [clamp(value, min, max)];
  const [a, b] = value.map((v) => clamp(v, min, max));
  return a <= b ? [a, b] : [b, a];
}

/** The value back in the shape it came in. */
export const fromThumbs = (thumbs: number[], range: boolean): RangeValue =>
  range ? [thumbs[0], thumbs[1]] : thumbs[0];

/** The thumb a press at `v` should move: the nearest, or the one on the pressed side of a tie. */
export function nearestThumb(thumbs: number[], v: number): number {
  if (thumbs.length < 2) return 0;
  const [a, b] = thumbs;
  if (a === b) return v > a ? 1 : 0;
  return Math.abs(v - a) <= Math.abs(v - b) ? 0 : 1;
}

/** Sets one thumb, keeping a range's thumbs from crossing. */
export function moveThumb(thumbs: number[], index: number, v: number): number[] {
  const next = [...thumbs];
  const lo = index === 1 ? thumbs[0] : -Infinity;
  const hi = index === 0 && thumbs.length > 1 ? thumbs[1] : Infinity;
  next[index] = clamp(v, lo, hi);
  return next;
}

/** The value a key press moves a thumb to, or null for keys the slider ignores. */
export function keyValue(
  key: string,
  v: number,
  { min, max, step, shift }: { min: number; max: number; step: number; shift?: boolean },
): number | null {
  const big = Math.max(step, (max - min) / 10);
  const by = shift ? big : step;
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return snap(v + by, min, max, step);
    case "ArrowLeft":
    case "ArrowDown":
      return snap(v - by, min, max, step);
    case "PageUp":
      return snap(v + big, min, max, step);
    case "PageDown":
      return snap(v - big, min, max, step);
    case "Home":
      return min;
    case "End":
      return max;
    default:
      return null;
  }
}
