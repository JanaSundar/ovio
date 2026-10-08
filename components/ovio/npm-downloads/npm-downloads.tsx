"use client";

import { type ComponentType, useState, type KeyboardEvent } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { formatNumber, formatShortDate } from "@/lib/format";
import { keyToIndex } from "@/lib/keys";
import { MinimalNpmDownloads } from "./worlds/minimal";
import { CraftNpmDownloads } from "./worlds/craft";
import { RetroNpmDownloads } from "./worlds/retro";
import { ToyNpmDownloads } from "./worlds/toy";

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

type WeekPoint = {
  week: string;
  /** "Sep 28". */
  label: string;
  downloads: number;
  /** Change from the week before as a percentage, or null for the first week of the history. */
  delta: number | null;
  /** Bar height as 0–1 of the chart scale. */
  height: number;
  /** Weeks before the latest one: 0 for the latest. */
  ago: number;
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

/** "+12.4%", "−3.1%", or with other marks for up and down ("▲ 12.4%"). */
export function formatDelta(delta: number | null, marks: [string, string] = ["+", "−"]): string {
  if (delta === null) return "—";
  return `${delta >= 0 ? marks[0] : marks[1]}${Math.abs(delta).toFixed(1)}%`;
}

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
  goal,
  variant,
  className,
}: NpmDownloadsProps) {
  const world = useWorld(variant);
  const start = Math.max(0, data.length - Math.max(1, weeks));
  const shown = data.slice(start);
  const [picked, setPicked] = useState<number | null>(null);

  const peak = Math.max(0, ...shown.map((w) => w.downloads));
  const scale = Math.max(peak, goal ?? 0) || 1;
  const points: WeekPoint[] = shown.map((w, i) => {
    const before = data[start + i - 1];
    return {
      week: w.week,
      label: formatShortDate(w.week),
      downloads: w.downloads,
      delta: before && before.downloads ? (w.downloads / before.downloads - 1) * 100 : null,
      height: w.downloads / scale,
      ago: shown.length - 1 - i,
    };
  });
  const empty: WeekPoint = { week: "", label: "", downloads: 0, delta: null, height: 0, ago: 0 };
  const latest = points[points.length - 1] ?? empty;
  const last = Math.max(0, points.length - 1);
  const selected = picked === null ? last : Math.min(picked, last);

  const current = points[selected] ?? empty;
  const select = (i: number) => setPicked(Math.max(0, Math.min(last, i)));
  const reset = () => setPicked(null);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const next = keyToIndex(event.key, selected, points.length, { vertical: true });
    if (next === null) return;
    event.preventDefault();
    select(next);
  };

  const total = shown.reduce((sum, w) => sum + w.downloads, 0);
  const summary =
    points.length > 0
      ? `${packageName} weekly downloads, ${points.length} weeks from ${points[0].label} to ${latest.label}: ` +
        `latest ${formatNumber(latest.downloads)} (${formatDelta(latest.delta)} on the week before), ` +
        `peak ${formatNumber(peak)}` +
        (goal ? `, goal ${formatNumber(goal)}.` : ".")
      : `${packageName} weekly downloads: no data.`;

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
    goalHeight: goal ? goal / scale : 0,
    summary,
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
