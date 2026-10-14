import { describe, expect, it } from "vitest";
import {
  snapSplit,
  splitAt,
  splitForKey,
  splitMeter,
} from "@/components/ovio/compare-slider/compare";

describe("compare slider split", () => {
  it("clamps to 0–100 and snaps to a world's step", () => {
    expect(snapSplit(-12)).toBe(0);
    expect(snapSplit(140)).toBe(100);
    expect(snapSplit(37.4)).toBe(37.4);
    expect(snapSplit(37.4, 10)).toBe(40);
    expect(snapSplit(34, 10)).toBe(30);
  });

  it("reads the pointer as a share of the view", () => {
    expect(splitAt(150, 100, 200)).toBe(25);
    expect(splitAt(80, 100, 200)).toBe(-10);
    expect(splitAt(10, 0, 0)).toBe(50);
  });

  it("moves by the step on arrows, a page on PageUp/Down, to the ends on Home/End", () => {
    expect(splitForKey("ArrowRight", 50, 5)).toBe(55);
    expect(splitForKey("ArrowLeft", 2, 5)).toBe(0);
    expect(splitForKey("PageUp", 50, 5)).toBe(60);
    expect(splitForKey("ArrowRight", 50, 10)).toBe(60);
    expect(splitForKey("Home", 50, 5)).toBe(0);
    expect(splitForKey("End", 50, 5)).toBe(100);
    expect(splitForKey("a", 50, 5)).toBeUndefined();
  });

  it("prints Retro's ten-cell meter", () => {
    expect(splitMeter(0)).toBe("░░░░░░░░░░");
    expect(splitMeter(50)).toBe("▓▓▓▓▓░░░░░");
    expect(splitMeter(100)).toBe("▓▓▓▓▓▓▓▓▓▓");
  });
});
