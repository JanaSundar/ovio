/** A point on the pad, in CSS px from its top left. */
export type Point = { x: number; y: number };

/** The pad split into cells, to measure how much of the coating is gone. */
export type Grid = { cols: number; rows: number };

/** A grid of cells about `cell` px square over a w×h pad. */
export function gridFor(w: number, h: number, cell: number): Grid {
  return { cols: Math.max(1, Math.round(w / cell)), rows: Math.max(1, Math.round(h / cell)) };
}

/** How far p lies from the segment a–b. */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = dx * dx + dy * dy;
  const t = length ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length)) : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** The cells whose centres lie within `radius` of the stroke a–b, as row-major indices. */
export function cellsUnder(
  a: Point,
  b: Point,
  radius: number,
  grid: Grid,
  w: number,
  h: number,
): number[] {
  const cw = w / grid.cols;
  const ch = h / grid.rows;
  const span = (lo: number, hi: number, size: number, count: number) =>
    [
      Math.max(0, Math.floor((lo - radius) / size)),
      Math.min(count - 1, Math.floor((hi + radius) / size)),
    ] as const;
  const [c0, c1] = span(Math.min(a.x, b.x), Math.max(a.x, b.x), cw, grid.cols);
  const [r0, r1] = span(Math.min(a.y, b.y), Math.max(a.y, b.y), ch, grid.rows);
  const cells: number[] = [];
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++)
      if (distanceToSegment({ x: (c + 0.5) * cw, y: (r + 0.5) * ch }, a, b) <= radius)
        cells.push(r * grid.cols + c);
  return cells;
}

/** A cell's box on a w×h pad, widened to whole px so neighbours meet without seams. */
export function cellBox(index: number, grid: Grid, w: number, h: number) {
  const c = index % grid.cols;
  const r = Math.floor(index / grid.cols);
  const x = Math.floor((c * w) / grid.cols);
  const y = Math.floor((r * h) / grid.rows);
  return {
    x,
    y,
    w: Math.ceil(((c + 1) * w) / grid.cols) - x,
    h: Math.ceil(((r + 1) * h) / grid.rows) - y,
  };
}

/** The share of the grid scratched away, 0–1. */
export function clearedShare(cleared: number, grid: Grid): number {
  return Math.min(1, cleared / (grid.cols * grid.rows));
}

/** Keeps the reveal threshold to a share that scratching can reach. */
export function clampThreshold(threshold: number): number {
  return Math.max(0.05, Math.min(1, threshold));
}

/** Where a pointer sits on the pad, in the pad's own px however it is scaled on screen. */
export function pointIn(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  w: number,
  h: number,
): Point {
  return {
    x: rect.width ? ((clientX - rect.left) / rect.width) * w : 0,
    y: rect.height ? ((clientY - rect.top) / rect.height) * h : 0,
  };
}

/** Enter and Space reveal everything at once, for anyone not scratching with a pointer. */
export function isRevealKey(key: string): boolean {
  return key === "Enter" || key === " ";
}

/** A share as a whole percent. */
export function percentOf(share: number): number {
  return Math.round(Math.max(0, Math.min(1, share)) * 100);
}

/** A ten-cell block meter, as Retro prints it. */
export function shareMeter(share: number): string {
  const lit = Math.round(percentOf(share) / 10);
  return "▓".repeat(lit) + "░".repeat(10 - lit);
}

/** Mulberry32, so a coating's speckle is the same on every paint. */
export function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Where Toy's confetti flies: offsets in % of the pad from its centre, kept well inside it. */
export function burst(count: number, seed = 7) {
  const rnd = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + rnd() * 0.4;
    const reach = 22 + rnd() * 16;
    return {
      x: Math.cos(angle) * reach,
      y: Math.sin(angle) * reach,
      rotate: Math.round(rnd() * 360),
      tone: i % 3,
    };
  });
}
