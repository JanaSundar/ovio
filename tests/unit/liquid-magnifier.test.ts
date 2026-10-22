import { describe, expect, it } from "vitest";
import {
  clampZoom,
  contentTransform,
  lensRadius,
  moveForKey,
  snap,
  squash,
  zoomForKey,
  zoomForWheel,
  zoomAtFraction,
  zoomReadout,
} from "@/components/ovio/liquid-magnifier/magnifier";

describe("liquid magnifier", () => {
  it("keeps the zoom in range, from the wheel and from + and -", () => {
    expect(clampZoom(9)).toBe(4);
    expect(clampZoom(1, 2, 3)).toBe(2);
    expect(zoomForWheel(2.5, -100)).toBeCloseTo(2.7);
    expect(zoomForWheel(4, -100)).toBe(4);
    expect(zoomForKey("+", 2.5)).toBe(3);
    expect(zoomForKey("-", 1.6)).toBe(1.5);
    expect(zoomForKey("a", 2.5)).toBeUndefined();
  });

  it("moves the lens with the arrows without leaving the view", () => {
    expect(moveForKey("ArrowRight", { x: 10, y: 10 }, 20, 100, 80)).toEqual({ x: 30, y: 10 });
    expect(moveForKey("ArrowUp", { x: 10, y: 10 }, 20, 100, 80)).toEqual({ x: 10, y: 0 });
    expect(moveForKey("Enter", { x: 10, y: 10 }, 20, 100, 80)).toBeUndefined();
  });

  it("snaps to Retro's grid and leaves other worlds continuous", () => {
    expect(snap(13, 8)).toBe(16);
    expect(snap(13.4)).toBe(13.4);
  });

  it("wobbles around a circle whose edges always sum to 100%", () => {
    expect(lensRadius(0, 0)).toBe("50% 50% 50% 50% / 50% 50% 50% 50%");
    const [h, v] = lensRadius(1.3, 4)
      .split(" / ")
      .map((s) => s.split(" ").map(parseFloat));
    expect(h[0] + h[1]).toBeCloseTo(100);
    expect(h[2] + h[3]).toBeCloseTo(100);
    expect(v[0] + v[3]).toBeCloseTo(100);
    expect(v[1] + v[2]).toBeCloseTo(100);
  });

  it("stretches with speed, up to a limit, along the direction of travel", () => {
    expect(squash(0, 0, 0.001, 0.2).stretch).toBe(0);
    expect(squash(100, 0, 0.001, 0.2)).toEqual({ angle: 0, stretch: 0.1 });
    expect(squash(0, 1000, 0.001, 0.2).stretch).toBe(0.2);
  });

  it("puts the point under the lens at its centre", () => {
    expect(contentTransform(100, 50, 60, 2)).toBe("translate(-140px, -40px) scale(2)");
  });

  it("reads Toy's zoom knob as a share of its groove", () => {
    expect(zoomAtFraction(0)).toBe(1.5);
    expect(zoomAtFraction(0.5, 1, 3)).toBe(2);
    expect(zoomAtFraction(1.4)).toBe(4);
  });

  it("prints the zoom per world", () => {
    expect(zoomReadout(2.46)).toBe("2.5×");
    expect(zoomReadout(2.6, true)).toBe("3X");
  });
});
