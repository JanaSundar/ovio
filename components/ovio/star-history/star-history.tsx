"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { useReducedMotionSafe } from "@/lib/motion";
import { shapeStarHistory, type StarHistoryShape } from "./shape";
import { MinimalStarHistory } from "./worlds/minimal";
import { CraftStarHistory } from "./worlds/craft";
import { RetroStarHistory } from "./worlds/retro";
import { ToyStarHistory } from "./worlds/toy";

/** One day of history: the cumulative star count on that date. */
export type StarHistoryPoint = {
  /** ISO 8601 date, "2025-07-14". */
  date: string;
  stars: number;
};

/** A callout pinned to the curve at a date, like "hit the HN front page!". */
export type StarHistoryAnnotation = {
  date: string;
  label: string;
};

export type StarHistoryAnimation = "none" | "enter-exit" | "always";

export type StarHistoryProps = {
  /** Cumulative stars by day. Any order; sorted by date. */
  data: StarHistoryPoint[];
  /** "owner/name". Used for the title and the chart's accessible name only. */
  repo?: string;
  annotations?: StarHistoryAnnotation[];
  variant?: World;
  /**
   * "enter-exit" draws the chart in on mount and when the data changes; "always" also keeps a
   * live marker on the latest point moving. Forced to "none" under reduced motion.
   */
  animation?: StarHistoryAnimation;
  className?: string;
};

/** Everything a world needs to draw the chart. Worlds only render; data shaping lives here. */
export type StarHistoryWorldProps = {
  shape: StarHistoryShape;
  /** The repo's name without its owner ("lumen"), for titles. */
  name: string;
  /** Accessible name for the chart's scrubber. */
  label: string;
  animation: StarHistoryAnimation;
  /** False until after the first paint, so the total can roll up from zero. */
  entered: boolean;
  /** Changes when the data changes, to replay the entrance. */
  dataKey: string;
  className?: string;
};

const NO_ANNOTATIONS: StarHistoryAnnotation[] = [];
const noop = () => () => {};
const yes = () => true;
const no = () => false;

export function StarHistory({
  data,
  repo,
  annotations = NO_ANNOTATIONS,
  variant,
  animation = "enter-exit",
  className,
}: StarHistoryProps) {
  const world = useWorld(variant);
  const reduced = useReducedMotionSafe();
  const motionMode = reduced ? "none" : animation;
  const shape = useMemo(() => shapeStarHistory(data, annotations, repo), [data, annotations, repo]);

  // False while hydrating (and on the server), true after, so the total rolls up from zero.
  const painted = useSyncExternalStore(noop, yes, no);

  const last = shape.points.at(-1);
  const props: StarHistoryWorldProps = {
    shape,
    name: repo?.split("/").pop() || "repository",
    label: repo ? `Star history of ${repo}` : "Star history",
    animation: motionMode,
    entered: painted || motionMode === "none",
    dataKey: `${shape.points.length}:${shape.points[0]?.date ?? ""}:${last?.date ?? ""}:${shape.total}`,
    className,
  };

  switch (world) {
    case "craft":
      return <CraftStarHistory {...props} />;
    case "retro":
      return <RetroStarHistory {...props} />;
    case "toy":
      return <ToyStarHistory {...props} />;
    default:
      return <MinimalStarHistory {...props} />;
  }
}
