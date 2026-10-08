import { describe, expect, it } from "vitest";
import {
  formatCount,
  formatDate,
  formatMonth,
  formatNumber,
  formatShortDate,
  isoDate,
  plural,
} from "@/lib/format";
import { keyToIndex } from "@/lib/keys";

describe("keyToIndex", () => {
  it("steps and stops at the ends", () => {
    expect(keyToIndex("ArrowRight", 2, 5)).toBe(3);
    expect(keyToIndex("ArrowRight", 4, 5)).toBe(4);
    expect(keyToIndex("ArrowLeft", 0, 5)).toBe(0);
    expect(keyToIndex("Home", 3, 5)).toBe(0);
    expect(keyToIndex("End", 1, 5)).toBe(4);
  });

  it("wraps when asked", () => {
    expect(keyToIndex("ArrowRight", 4, 5, { wrap: true })).toBe(0);
    expect(keyToIndex("ArrowLeft", 0, 5, { wrap: true })).toBe(4);
  });

  it("only moves on Up, Down and Page keys when enabled", () => {
    expect(keyToIndex("ArrowUp", 2, 5)).toBeNull();
    expect(keyToIndex("ArrowUp", 2, 5, { vertical: true })).toBe(3);
    expect(keyToIndex("ArrowDown", 2, 5, { vertical: true })).toBe(1);
    expect(keyToIndex("PageUp", 2, 50)).toBeNull();
    expect(keyToIndex("PageUp", 2, 50, { page: 10 })).toBe(12);
    expect(keyToIndex("ArrowRight", 2, 50, { step: 5 })).toBe(7);
  });

  it("ignores other keys and empty rows", () => {
    expect(keyToIndex("a", 1, 5)).toBeNull();
    expect(keyToIndex("ArrowRight", 0, 0)).toBeNull();
  });
});

describe("format", () => {
  it("formats numbers and counts", () => {
    expect(formatNumber(12450)).toBe("12,450");
    expect(plural(1, "star")).toBe("star");
    expect(plural(2, "star")).toBe("stars");
    expect(formatCount(1, "star")).toBe("1 star");
    expect(formatCount(2400, "star")).toBe("2,400 stars");
    expect(formatCount(2, "child", "children")).toBe("2 children");
  });

  it("formats dates in UTC", () => {
    expect(formatDate("2026-09-30")).toBe("Sep 30, 2026");
    expect(formatShortDate("2026-09-30")).toBe("Sep 30");
    expect(formatMonth(2025, 7)).toBe("Jul 2025");
    expect(isoDate(Date.UTC(2026, 8, 30, 23, 59))).toBe("2026-09-30");
    expect(formatDate("not a date")).toBe("not a date");
  });
});
