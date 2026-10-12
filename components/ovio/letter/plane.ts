/**
 * The paper plane, folded from a sheet in four stages, drawn nose up in a 100 × 130 box: the sheet,
 * top corners folded to the centre line, the sides folded in again, then the wings opened out.
 * Every stage of a wing has the same five points, so the outline morphs smoothly from one to the next.
 */

type Point = readonly [number, number];

/** The left wing, stage by stage, as nose, nose again, tail, outer corner, leading edge. */
const LEFT: readonly (readonly Point[])[] = [
  [
    [0, 0],
    [50, 0],
    [50, 130],
    [0, 130],
    [0, 45],
  ],
  [
    [50, 0],
    [50, 0],
    [50, 130],
    [0, 130],
    [0, 50],
  ],
  [
    [50, 0],
    [50, 0],
    [50, 130],
    [26, 130],
    [22, 60],
  ],
  [
    [50, 2],
    [50, 2],
    [50, 112],
    [6, 126],
    [39, 36],
  ],
];

const mirror = (points: readonly Point[]) => points.map(([x, y]) => [100 - x, y] as const);
const path = (points: readonly Point[]) => `M${points.map(([x, y]) => `${x} ${y}`).join(" L")} Z`;

/** Path data for each wing and the keel, one entry per stage. */
export const PLANE = {
  left: LEFT.map(path),
  right: LEFT.map(mirror).map(path),
  keel: LEFT.map((stage) => `M50 ${stage[0][1]} L50 ${stage[2][1]}`),
};

/** When each stage is reached, as a share of the fold. */
export const PLANE_TIMES = [0, 0.3, 0.62, 1];

/** The plane is drawn nose up, so it points along a heading (screen degrees, 0 = right) at heading + 90. */
export const noseFor = (heading: number) => heading + 90;

/** The signed turn from one angle to another, the short way round, in degrees. */
export function turn(from: number, to: number) {
  const d = (to - from) % 360;
  return d > 180 ? d - 360 : d < -180 ? d + 360 : d;
}
