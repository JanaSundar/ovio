/**
 * Fold geometry for Peel to Reveal: no React, so it can be tested.
 *
 * Dragging corner C to point P folds the cover along the perpendicular bisector of C and P.
 * Everything nearer C than P lifts away; the lifted part, mirrored across the fold, is the flap.
 */

export type Pt = { x: number; y: number };
export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export const cornerPoint = (corner: Corner, w: number, h: number): Pt => ({
  x: corner.endsWith("right") ? w : 0,
  y: corner.startsWith("bottom") ? h : 0,
});

/** The corner across the diagonal. */
const opposite = (c: Pt, w: number, h: number): Pt => ({ x: w - c.x, y: h - c.y });

const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y;
const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });

/** Keeps the part of a convex polygon where side(point) <= 0 (Sutherland–Hodgman, one edge). */
export function clipPolygon(poly: Pt[], side: (p: Pt) => number): Pt[] {
  const out: Pt[] = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const sa = side(a);
    const sb = side(b);
    if (sa <= 0) out.push(a);
    if ((sa < 0 && sb > 0) || (sa > 0 && sb < 0)) {
      const t = sa / (sa - sb);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  });
  return out;
}

/** The cover still flat on the card, and the flap folded over it, for corner C dragged to P. */
export function peelShapes(w: number, h: number, c: Pt, p: Pt): { cover: Pt[]; flap: Pt[] } {
  const rect = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ];
  const d = sub(c, p);
  const len = Math.hypot(d.x, d.y);
  if (len < 0.5) return { cover: rect, flap: [] };
  const n = { x: d.x / len, y: d.y / len };
  const mid = { x: (c.x + p.x) / 2, y: (c.y + p.y) / 2 };
  const side = (q: Pt) => dot(sub(q, mid), n);
  const lifted = clipPolygon(rect, (q) => -side(q));
  return {
    cover: clipPolygon(rect, side),
    flap: lifted.map((q) => {
      const s = 2 * side(q);
      return { x: q.x - s * n.x, y: q.y - s * n.y };
    }),
  };
}

/** How far the peel has gone, 0 at the corner and 1 across the whole diagonal. */
export const peelProgress = (w: number, h: number, c: Pt, p: Pt) =>
  Math.min(1, Math.hypot(c.x - p.x, c.y - p.y) / (Math.hypot(w, h) || 1));

/** Where the corner rests: pulled `curl` px in along the diagonal, a dog-ear inviting the drag. */
export function restPoint(c: Pt, w: number, h: number, curl: number): Pt {
  const o = opposite(c, w, h);
  const len = Math.hypot(o.x - c.x, o.y - c.y) || 1;
  return { x: c.x + ((o.x - c.x) / len) * curl, y: c.y + ((o.y - c.y) / len) * curl };
}

/** Far enough that the fold has passed the opposite corner: the whole cover has lifted. */
export function peeledPoint(c: Pt, w: number, h: number): Pt {
  const o = opposite(c, w, h);
  return { x: c.x + (o.x - c.x) * 2.1, y: c.y + (o.y - c.y) * 2.1 };
}

/** A polygon as a CSS clip-path. */
export const toClipPath = (poly: Pt[]) =>
  poly.length < 3
    ? "polygon(0 0, 0 0, 0 0)"
    : `polygon(${poly.map((q) => `${q.x.toFixed(1)}px ${q.y.toFixed(1)}px`).join(", ")})`;

/** A polygon as SVG points. */
export const toPoints = (poly: Pt[]) =>
  poly.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");
