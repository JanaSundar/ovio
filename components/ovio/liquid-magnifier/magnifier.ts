/** The zoom range the lens allows unless the props narrow it. */
export const ZOOM_RANGE = { min: 1.5, max: 4 } as const;

export function clampZoom(
  zoom: number,
  min: number = ZOOM_RANGE.min,
  max: number = ZOOM_RANGE.max,
) {
  return Math.min(max, Math.max(min, zoom));
}

/** A wheel tick zooms in on scroll up and out on scroll down. */
export function zoomForWheel(zoom: number, deltaY: number, min?: number, max?: number) {
  return clampZoom(zoom - deltaY * 0.002, min, max);
}

/** Where + and - take the zoom, or undefined for other keys. */
export function zoomForKey(key: string, zoom: number, min?: number, max?: number) {
  if (key === "+" || key === "=") return clampZoom(zoom + 0.5, min, max);
  if (key === "-" || key === "_") return clampZoom(zoom - 0.5, min, max);
  return undefined;
}

/** Where an arrow key moves the lens centre inside a w×h view, or undefined for other keys. */
export function moveForKey(
  key: string,
  at: { x: number; y: number },
  step: number,
  w: number,
  h: number,
): { x: number; y: number } | undefined {
  const moves: Record<string, [number, number]> = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  };
  const m = moves[key];
  if (!m) return undefined;
  return { x: Math.min(w, Math.max(0, at.x + m[0])), y: Math.min(h, Math.max(0, at.y + m[1])) };
}

/** Snaps a coordinate to a world's grid (0 leaves it continuous). */
export function snap(v: number, grid = 0) {
  return grid > 0 ? Math.round(v / grid) * grid : v;
}

/**
 * Corner radii wandering around a circle as `phase` runs 0 → 2π (so it loops seamlessly). Each
 * pair of radii along an edge sums to 100%, so the shape never flattens into a pill.
 */
export function lensRadius(phase: number, wobble: number): string {
  const r = (k: number, o: number) => Number((50 + wobble * Math.sin(phase * k + o)).toFixed(1));
  const [h1, h2, v1, v2] = [r(1, 0), r(2, 2), r(3, 4), r(2, 6)];
  const c = (n: number) => Number((100 - n).toFixed(1));
  return `${h1}% ${c(h1)}% ${h2}% ${c(h2)}% / ${v1}% ${v2}% ${c(v2)}% ${c(v1)}%`;
}

/** How far a moving lens stretches along its direction of travel: `gain` per px/s, up to `max`. */
export function squash(vx: number, vy: number, gain: number, max: number) {
  return { angle: Math.atan2(vy, vx), stretch: Math.min(max, Math.hypot(vx, vy) * gain) };
}

/**
 * The lens box, centred on (x, y): stretched along `angle` and narrowed across it like a drop,
 * scaled by `grow` for its entrance.
 */
export function lensTransform(
  x: number,
  y: number,
  r: number,
  grow: number,
  angle: number,
  stretch: number,
) {
  const f = (n: number) => Number(n.toFixed(3));
  return (
    `translate(${f(x - r)}px, ${f(y - r)}px) rotate(${f(angle)}rad) ` +
    `scale(${f(grow * (1 + stretch))}, ${f(grow * (1 - stretch * 0.7))}) rotate(${f(-angle)}rad)`
  );
}

/** The magnified copy inside the lens: the point under the lens centre lands on the lens centre. */
export function contentTransform(x: number, y: number, r: number, zoom: number) {
  const f = (n: number) => Number(n.toFixed(2));
  return `translate(${f(r - x * zoom)}px, ${f(r - y * zoom)}px) scale(${f(zoom)})`;
}

/** The zoom as each world prints it: "2.5×", or Retro's whole "3X". */
export function zoomReadout(zoom: number, whole = false) {
  return whole ? `${Math.round(zoom)}X` : `${zoom.toFixed(1)}×`;
}

/** The zoom at a fraction (0–1) of the way along a zoom slider. */
export function zoomAtFraction(
  t: number,
  min: number = ZOOM_RANGE.min,
  max: number = ZOOM_RANGE.max,
) {
  return clampZoom(min + Math.min(1, Math.max(0, t)) * (max - min), min, max);
}
