import { describe, expect, it } from "vitest";
import {
  edgeIndex,
  placeMenu,
  stepIndex,
  typeaheadIndex,
  type ContextMenuEntry,
} from "@/components/interactions/context-menu/menu";
import {
  keyValue,
  moveThumb,
  nearestThumb,
  percentOf,
  snap,
  toThumbs,
} from "@/components/interactions/fluid-range-slider/range";
import {
  clipPolygon,
  cornerPoint,
  peelProgress,
  peelShapes,
  peeledPoint,
  restPoint,
} from "@/components/interactions/peel-to-reveal/peel";

describe("Fluid Range Slider math", () => {
  it("snaps to the step from min and trims float noise", () => {
    expect(snap(0.30000000000000004, 0, 1, 0.1)).toBe(0.3);
    expect(snap(7, 5, 50, 5)).toBe(5);
    expect(snap(8, 5, 50, 5)).toBe(10);
    expect(snap(999, 0, 100, 1)).toBe(100);
    expect(snap(3.3, 0, 10, 0)).toBe(3.3);
  });

  it("places values on the track, with a zero-width range at the start", () => {
    expect(percentOf(50, 0, 200)).toBe(25);
    expect(percentOf(-5, 0, 10)).toBe(0);
    expect(percentOf(5, 5, 5)).toBe(0);
  });

  it("orders a range and keeps its thumbs from crossing", () => {
    expect(toThumbs([80, 20], 0, 100)).toEqual([20, 80]);
    expect(moveThumb([20, 80], 0, 95)).toEqual([80, 80]);
    expect(moveThumb([20, 80], 1, 5)).toEqual([20, 20]);
    expect(moveThumb([40], 0, 95)).toEqual([95]);
  });

  it("picks the nearer thumb, and the pressed side when they touch", () => {
    expect(nearestThumb([20, 80], 30)).toBe(0);
    expect(nearestThumb([20, 80], 70)).toBe(1);
    expect(nearestThumb([50, 50], 60)).toBe(1);
    expect(nearestThumb([50, 50], 40)).toBe(0);
  });

  it("moves by step, by a tenth with Shift or Page keys, and to the ends", () => {
    const o = { min: 0, max: 100, step: 1 };
    expect(keyValue("ArrowRight", 50, o)).toBe(51);
    expect(keyValue("ArrowDown", 50, o)).toBe(49);
    expect(keyValue("ArrowRight", 50, { ...o, shift: true })).toBe(60);
    expect(keyValue("PageDown", 5, o)).toBe(0);
    expect(keyValue("End", 5, o)).toBe(100);
    expect(keyValue("a", 5, o)).toBeNull();
  });
});

describe("Context Menu logic", () => {
  const items: ContextMenuEntry[] = [
    { type: "label", label: "File" },
    { id: "open", label: "Open" },
    { id: "rename", label: "Rename", disabled: true },
    { type: "separator" },
    { id: "rerun", label: "Rerun" },
    { id: "delete", label: "Delete" },
  ];

  it("steps over labels, separators and disabled items, wrapping", () => {
    expect(stepIndex(items, 1, 1)).toBe(4);
    expect(stepIndex(items, 5, 1)).toBe(1);
    expect(stepIndex(items, 1, -1)).toBe(5);
    expect(edgeIndex(items, "first")).toBe(1);
    expect(edgeIndex(items, "last")).toBe(5);
    expect(stepIndex([{ type: "separator" }], 0, 1)).toBe(-1);
  });

  it("finds items by typed prefix, cycling on a repeated letter", () => {
    expect(typeaheadIndex(items, -1, "r")).toBe(4);
    expect(typeaheadIndex(items, 4, "r")).toBe(4);
    expect(typeaheadIndex(items, 1, "de")).toBe(5);
    expect(typeaheadIndex(items, 1, "x")).toBe(-1);
  });

  it("opens at the pointer, flips where there is no room, and stays inside the viewport", () => {
    const viewport = { width: 1000, height: 800 };
    const size = { width: 220, height: 300 };
    expect(placeMenu({ x: 100, y: 100 }, size, viewport)).toEqual({
      x: 100,
      y: 100,
      origin: "left top",
    });
    expect(placeMenu({ x: 900, y: 700 }, size, viewport)).toEqual({
      x: 680,
      y: 400,
      origin: "right bottom",
    });
    const tiny = placeMenu({ x: 50, y: 50 }, size, { width: 200, height: 200 });
    expect(tiny.x).toBe(8);
    expect(tiny.y).toBe(8);
  });
});

describe("Peel to Reveal geometry", () => {
  const w = 300;
  const h = 200;
  const c = cornerPoint("bottom-right", w, h);
  const area = (poly: { x: number; y: number }[]) =>
    Math.abs(
      poly.reduce((s, p, i) => {
        const q = poly[(i + 1) % poly.length];
        return s + p.x * q.y - q.x * p.y;
      }, 0),
    ) / 2;

  it("keeps the whole cover flat when the corner hasn't moved", () => {
    const { cover, flap } = peelShapes(w, h, c, c);
    expect(area(cover)).toBe(w * h);
    expect(flap).toEqual([]);
  });

  it("splits the card along the fold: flat cover plus lifted part is the whole card", () => {
    const p = { x: 200, y: 120 };
    const { cover, flap } = peelShapes(w, h, c, p);
    // The flap is the lifted part mirrored, so it has the lifted part's area.
    expect(area(cover) + area(flap)).toBeCloseTo(w * h, 6);
    // The lifted corner lands exactly on the pointer.
    expect(flap.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 1e-9)).toBe(true);
  });

  it("clips a square in half along a line", () => {
    const sq = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ];
    expect(area(clipPolygon(sq, (q) => q.x - 1))).toBe(2);
  });

  it("rests a little way in, and peels clear past the opposite corner", () => {
    const rest = restPoint(c, w, h, 20);
    expect(Math.hypot(rest.x - c.x, rest.y - c.y)).toBeCloseTo(20, 6);
    const end = peeledPoint(c, w, h);
    expect(area(peelShapes(w, h, c, end).cover)).toBe(0);
    expect(peelProgress(w, h, c, end)).toBe(1);
    expect(peelProgress(w, h, c, c)).toBe(0);
  });
});
