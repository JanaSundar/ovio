/**
 * The radial menu's geometry and hit-testing, with no React, so the worlds, the OG art and the
 * tests share it. Angles are degrees clockwise from 3 o'clock, as on screen; the first item sits at
 * 12 o'clock and the rest follow clockwise.
 */

export const RADIAL = {
  /** The hub in the middle: pointing inside it aims at nothing, and clicking there closes. */
  hub: 44,
  /** The main ring's icons sit on this circle, inside its outer edge. */
  icon: 74,
  outer: 102,
  /** The band a branch's children fan out on, past the main ring. */
  band: { inner: 110, icon: 132, outer: 154 },
  /** Between neighbouring children, in degrees. */
  childStep: 32,
  /** Space kept between the menu and the edge of the screen, in px. */
  margin: 12,
} as const;

/** The menu's box: the band's full circle. */
export const MENU_SIZE = 2 * RADIAL.band.outer;

/** What the hit-test needs to know of each top-level item. */
export type Shape = { children: number; disabled?: boolean }[];

/** What the pointer points at: a top-level item, the branch open beside it, and a child. -1 is none. */
export type Aim = { main: number; branch: number; sub: number };

export const NOTHING: Aim = { main: -1, branch: -1, sub: -1 };

export const mod = (i: number, n: number) => ((i % n) + n) % n;

/** Degrees between neighbouring top-level items. */
export const stepOf = (count: number) => 360 / Math.max(1, count);

/** Where top-level item `i` of `count` points. */
export const angleOf = (i: number, count: number) => -90 + i * stepOf(count);

/** Where child `k` of `count` points, fanned around its parent's angle. */
export const childAngle = (parent: number, k: number, count: number) =>
  parent + (k - (count - 1) / 2) * RADIAL.childStep;

const round = (v: number) => Math.round(v * 100) / 100;

/** A point `r` from (c, c) at `deg`. */
export function polar(c: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: round(c + r * Math.cos(a)), y: round(c + r * Math.sin(a)) };
}

/** An annular sector around (c, c), `span` degrees wide and centred on `at`, as an SVG path. */
export function sectorPath(c: number, inner: number, outer: number, at: number, span: number) {
  const large = span > 180 ? 1 : 0;
  const [a, b] = [at - span / 2, at + span / 2];
  const p = [polar(c, outer, a), polar(c, outer, b), polar(c, inner, b), polar(c, inner, a)];
  return (
    `M${p[0].x} ${p[0].y}A${outer} ${outer} 0 ${large} 1 ${p[1].x} ${p[1].y}` +
    `L${p[2].x} ${p[2].y}A${inner} ${inner} 0 ${large} 0 ${p[3].x} ${p[3].y}Z`
  );
}

/** The angle equal to `to` nearest `from`, so a turn always goes the short way round. */
export const nearestAngle = (from: number, to: number) => from + (mod(to - from + 180, 360) - 180);

/** The direction of a pointer offset from the centre, in degrees. */
export const directionOf = (dx: number, dy: number) => (Math.atan2(dy, dx) * 180) / Math.PI;

/**
 * What a pointer `dx, dy` from the centre aims at. Inside the hub it aims at nothing; elsewhere the
 * direction picks a top-level item, however far out, so a quick flick works like a marking menu.
 * Past the main ring, inside the open branch's span, it picks a child instead.
 */
export function aimAt(dx: number, dy: number, shape: Shape, branch: number): Aim {
  const n = shape.length;
  const distance = Math.hypot(dx, dy);
  if (n === 0 || distance < RADIAL.hub) return NOTHING;
  const deg = directionOf(dx, dy);
  if (branch >= 0 && distance >= RADIAL.outer && shape[branch]?.children) {
    const m = shape[branch].children;
    const from = angleOf(branch, n);
    const k = (nearestAngle(from, deg) - from) / RADIAL.childStep + (m - 1) / 2;
    // Half a child's width of slack past each end of the band.
    if (k > -0.75 && k < m - 0.25) return { main: branch, branch, sub: Math.round(Math.max(0, k)) };
  }
  const main = mod(Math.round((deg + 90) / stepOf(n)), n);
  if (shape[main].disabled) return NOTHING;
  return { main, branch: shape[main].children > 0 ? main : -1, sub: -1 };
}

/** The next enabled index from `from`, `by` steps on; wraps when asked, else stops at the ends. */
export function nextEnabled(
  disabled: readonly boolean[],
  from: number,
  by: 1 | -1,
  wrap: boolean,
): number {
  const n = disabled.length;
  for (let i = 1; i <= n; i++) {
    const at = from + by * i;
    if (!wrap && (at < 0 || at >= n)) return from;
    if (!disabled[mod(at, n)]) return mod(at, n);
  }
  return from;
}

/** Where to centre the menu for a press at (x, y), so it stays on a `width` × `height` screen. */
export function placeMenu(x: number, y: number, width: number, height: number) {
  const r = RADIAL.band.outer + RADIAL.margin;
  const clamp = (v: number, size: number) =>
    size < 2 * r ? size / 2 : Math.min(size - r, Math.max(r, v));
  return { x: clamp(x, width), y: clamp(y, height) };
}
