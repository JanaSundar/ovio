"use client";

import { type ComponentType, useState, type KeyboardEvent } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { formatNumber } from "@/lib/format";
import { keyToIndex } from "@/lib/keys";
import { EMPTY_WEEK, readDownloads, type WeekPoint } from "./chart";
import { MinimalNpmDownloads } from "./worlds/minimal";
import { CraftNpmDownloads } from "./worlds/craft";
import { RetroNpmDownloads } from "./worlds/retro";
import { ToyNpmDownloads } from "./worlds/toy";

export { formatDelta } from "./chart";

export type DownloadWeek = {
  /** Start of the week, ISO 8601 date ("2026-09-28"). */
  week: string;
  downloads: number;
};

export type NpmDownloadsProps = {
  /** Package name, used as the label. */
  packageName: string;
  /** Weekly history, oldest first. */
  data: DownloadWeek[];
  /** How many of the latest weeks to show. */
  weeks?: number;
  /** Weekly target. Leave out to hide the goal. */
  goal?: number;
  variant?: World;
  className?: string;
};

/** Everything a world needs to draw the chart. Worlds only render; state lives here. */
export type NpmDownloadsWorldProps = {
  packageName: string;
  points: WeekPoint[];
  latest: WeekPoint;
  /** The week being inspected (hover, focus, keys or the Toy knob). Defaults to the latest. */
  selected: number;
  current: WeekPoint;
  /** "Week of Sep 28: 48,210 downloads", for screen readers. */
  currentText: string;
  select: (index: number) => void;
  /** Back to the latest week. */
  reset: () => void;
  /** Arrow keys, Home and End move the selection. */
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  /** Sum of the shown weeks. */
  total: number;
  peak: number;
  goal?: number;
  /** The selected week as 0–1 of the goal, capped at 1. */
  goalProgress: number;
  /** The goal line as 0–1 of the chart scale. */
  goalHeight: number;
  /** Text equivalent of the chart. */
  summary: string;
  className?: string;
};

const VIEWS = {
  minimal: MinimalNpmDownloads,
  craft: CraftNpmDownloads,
  retro: RetroNpmDownloads,
  toy: ToyNpmDownloads,
} satisfies Record<World, ComponentType<NpmDownloadsWorldProps>>;

export function NpmDownloads({
  packageName,
  data,
  weeks = 12,
  goal: goalProp,
  variant,
  className,
}: NpmDownloadsProps) {
  // Only a real, positive target is a goal: 0 or NaN would print "Goal 0" or "Goal NaN".
  const goal =
    goalProp !== undefined && Number.isFinite(goalProp) && goalProp > 0 ? goalProp : undefined;
  const world = useWorld(variant);
  const { points, latest, total, peak, goalHeight, summary } = readDownloads(
    packageName,
    data,
    weeks,
    goal,
  );
  const [picked, setPicked] = useState<number | null>(null);
  const last = Math.max(0, points.length - 1);
  const selected = picked === null ? last : Math.min(picked, last);

  const current = points[selected] ?? EMPTY_WEEK;
  const select = (i: number) => setPicked(Math.max(0, Math.min(last, i)));
  const reset = () => setPicked(null);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const next = keyToIndex(event.key, selected, points.length, { vertical: true });
    if (next === null) return;
    event.preventDefault();
    select(next);
  };

  const props: NpmDownloadsWorldProps = {
    packageName,
    points,
    latest,
    selected,
    current,
    currentText: `Week of ${current.label}: ${formatNumber(current.downloads)} downloads`,
    select,
    reset,
    onKeyDown,
    total,
    peak,
    goal,
    goalProgress: goal ? Math.min(1, current.downloads / goal) : 0,
    goalHeight,
    summary,
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
