import { describe, expect, it } from "vitest";
import {
  aimAt,
  angleOf,
  childAngle,
  nearestAngle,
  nextEnabled,
  NOTHING,
  placeMenu,
  RADIAL,
  sectorPath,
  type Shape,
} from "@/components/ovio/dial-menu/dial";

/** Four items: the second has three children, the fourth is disabled. */
const shape: Shape = [
  { children: 0 },
  { children: 3 },
  { children: 0 },
  { children: 0, disabled: true },
];
/** A pointer `r` from the centre at `deg`. */
const at = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)] as const;
};

describe("dial aim", () => {
  it("starts at 12 o'clock and goes clockwise", () => {
    expect([0, 1, 2, 3].map((i) => angleOf(i, 4))).toEqual([-90, 0, 90, 180]);
    expect([0, 1, 2].map((k) => childAngle(0, k, 3))).toEqual([-32, 0, 32]);
  });

  it("aims at nothing inside the hub", () => {
    expect(aimAt(...at(0, RADIAL.hub - 1), shape, -1)).toEqual(NOTHING);
  });

  it("aims by direction, however far out, and opens a branch", () => {
    expect(aimAt(...at(-90, 70), shape, -1)).toEqual({ main: 0, branch: -1, sub: -1 });
    expect(aimAt(...at(-80, 600), shape, -1)).toEqual({ main: 0, branch: -1, sub: -1 });
    expect(aimAt(...at(10, 70), shape, -1)).toEqual({ main: 1, branch: 1, sub: -1 });
  });

  it("picks a child past the ring, inside the open branch's span", () => {
    expect(aimAt(...at(-30, RADIAL.band.icon), shape, 1)).toEqual({ main: 1, branch: 1, sub: 0 });
    expect(aimAt(...at(34, RADIAL.band.icon), shape, 1)).toEqual({ main: 1, branch: 1, sub: 2 });
    // Still on the ring, it's the parent, not a child.
    expect(aimAt(...at(34, RADIAL.icon), shape, 1)).toEqual({ main: 1, branch: 1, sub: -1 });
    // Out past the band's span, the direction picks another item.
    expect(aimAt(...at(90, RADIAL.band.icon), shape, 1)).toEqual({ main: 2, branch: -1, sub: -1 });
  });

  it("never aims at a disabled item", () => {
    expect(aimAt(...at(180, 70), shape, -1)).toEqual(NOTHING);
  });
});

describe("dial keys", () => {
  const disabled = [false, true, false, false];
  it("skips disabled items, wrapping round the ring or stopping in a branch", () => {
    expect(nextEnabled(disabled, 0, 1, true)).toBe(2);
    expect(nextEnabled(disabled, 3, 1, true)).toBe(0);
    expect(nextEnabled(disabled, 0, -1, true)).toBe(3);
    expect(nextEnabled(disabled, 3, 1, false)).toBe(3);
    expect(nextEnabled(disabled, -1, 1, false)).toBe(0);
    expect(nextEnabled([true, true], 0, 1, true)).toBe(0);
  });
});

describe("dial geometry", () => {
  it("turns the short way round", () => {
    expect(nearestAngle(170, -170)).toBe(190);
    expect(nearestAngle(-90, 180)).toBe(-180);
    expect(nearestAngle(720, 0)).toBe(720);
  });

  it("keeps the menu on screen", () => {
    const r = RADIAL.band.outer + RADIAL.margin;
    expect(placeMenu(5, 5, 1000, 800)).toEqual({ x: r, y: r });
    expect(placeMenu(500, 400, 1000, 800)).toEqual({ x: 500, y: 400 });
    expect(placeMenu(990, 790, 1000, 800)).toEqual({ x: 1000 - r, y: 800 - r });
    expect(placeMenu(10, 10, 200, 200)).toEqual({ x: 100, y: 100 });
  });

  it("draws a closed annular sector", () => {
    expect(sectorPath(10, 5, 10, 0, 90)).toBe(
      "M17.07 2.93A10 10 0 0 1 17.07 17.07L13.54 13.54A5 5 0 0 0 13.54 6.46Z",
    );
  });
});
