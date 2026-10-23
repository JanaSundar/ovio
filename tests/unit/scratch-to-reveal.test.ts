import { describe, expect, it } from "vitest";
import {
  burst,
  cellBox,
  cellsUnder,
  clampThreshold,
  clearedShare,
  distanceToSegment,
  gridFor,
  isRevealKey,
  percentOf,
  pointIn,
  shareMeter,
} from "@/components/ovio/scratch-to-reveal/scratch";

describe("scratch to reveal coverage", () => {
  it("splits the pad into cells about the given size", () => {
    expect(gridFor(300, 200, 10)).toEqual({ cols: 30, rows: 20 });
    expect(gridFor(304, 197, 10)).toEqual({ cols: 30, rows: 20 });
    expect(gridFor(3, 2, 10)).toEqual({ cols: 1, rows: 1 });
  });

  it("measures distance to a segment, or to a point when it has no length", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 0 };
    expect(distanceToSegment({ x: 5, y: 3 }, a, b)).toBe(3);
    expect(distanceToSegment({ x: -4, y: 3 }, a, b)).toBe(5);
    expect(distanceToSegment({ x: 3, y: 4 }, a, a)).toBe(5);
  });

  it("finds the cells a stroke covers, and only those", () => {
    const grid = gridFor(100, 100, 10);
    // A dot in the second cell catches just that cell.
    expect(cellsUnder({ x: 15, y: 5 }, { x: 15, y: 5 }, 4, grid, 100, 100)).toEqual([1]);
    // A line along the first row catches the whole row.
    expect(cellsUnder({ x: 0, y: 5 }, { x: 100, y: 5 }, 4, grid, 100, 100)).toEqual(
      Array.from({ length: 10 }, (_, i) => i),
    );
    // Off the pad, nothing.
    expect(cellsUnder({ x: -50, y: -50 }, { x: -40, y: -40 }, 4, grid, 100, 100)).toEqual([]);
  });

  it("gives cells whole-pixel boxes that meet without gaps", () => {
    const grid = gridFor(100, 30, 33);
    const boxes = [0, 1, 2].map((i) => cellBox(i, grid, 100, 30));
    expect(boxes[0].x).toBe(0);
    for (let i = 1; i < 3; i++)
      expect(boxes[i].x).toBeLessThanOrEqual(boxes[i - 1].x + boxes[i - 1].w);
    expect(boxes[2].x + boxes[2].w).toBe(100);
  });

  it("reads the share cleared, as a share and a percent", () => {
    const grid = gridFor(100, 100, 10);
    expect(clearedShare(0, grid)).toBe(0);
    expect(clearedShare(25, grid)).toBe(0.25);
    expect(clearedShare(400, grid)).toBe(1);
    expect(percentOf(0.256)).toBe(26);
    expect(percentOf(-1)).toBe(0);
  });

  it("keeps the threshold reachable", () => {
    expect(clampThreshold(0.6)).toBe(0.6);
    expect(clampThreshold(0)).toBe(0.05);
    expect(clampThreshold(2)).toBe(1);
  });
});

describe("scratch to reveal input", () => {
  it("reads a pointer in the pad's own px, however it is scaled", () => {
    const rect = { left: 100, top: 50, width: 200, height: 100 };
    expect(pointIn(200, 100, rect, 400, 200)).toEqual({ x: 200, y: 100 });
    expect(pointIn(100, 50, { ...rect, width: 0, height: 0 }, 400, 200)).toEqual({ x: 0, y: 0 });
  });

  it("reveals on Enter and Space only", () => {
    expect(isRevealKey("Enter")).toBe(true);
    expect(isRevealKey(" ")).toBe(true);
    expect(isRevealKey("a")).toBe(false);
  });
});

describe("scratch to reveal worlds", () => {
  it("prints Retro's ten-cell meter", () => {
    expect(shareMeter(0)).toBe("░░░░░░░░░░");
    expect(shareMeter(0.5)).toBe("▓▓▓▓▓░░░░░");
    expect(shareMeter(1)).toBe("▓▓▓▓▓▓▓▓▓▓");
  });

  it("keeps Toy's confetti inside the pad, the same every time", () => {
    const pieces = burst(14);
    expect(pieces).toEqual(burst(14));
    for (const p of pieces) {
      expect(Math.abs(p.x)).toBeLessThan(45);
      expect(Math.abs(p.y)).toBeLessThan(45);
    }
  });
});
