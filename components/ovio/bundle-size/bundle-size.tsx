"use client";

import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { keyToIndex } from "@/lib/keys";
import { MinimalBundleSize } from "./worlds/minimal";
import { CraftBundleSize } from "./worlds/craft";
import { RetroBundleSize } from "./worlds/retro";
import { ToyBundleSize } from "./worlds/toy";

/** One published version. Sizes are in bytes. */
export type BundleVersion = {
  version: string;
  raw: number;
  gzip: number;
  /** Leave out to hide the row. */
  brotli?: number;
  /** Runtime dependency count. Leave out to hide the row. */
  dependencies?: number;
};

export type BundleSizeProps = {
  packageName: string;
  /** Newest first. */
  versions: BundleVersion[];
  /** Size budget in kB. Leave out and the bar scales to the largest version. */
  budget?: number;
  variant?: World;
  className?: string;
};

/** "down" is smaller than the previous version, "first" has no previous version. */
export type BundleTrend = "down" | "up" | "same" | "first";

/** The selected version, in kB, measured against the previous one and the budget. */
export type BundleReading = {
  version: string;
  raw: number;
  gzip: number;
  brotli?: number;
  dependencies?: number;
  previous?: { version: string; raw: number };
  /** Absolute change from the previous version, in percent. */
  delta: number;
  trend: BundleTrend;
  /** Bar scale in kB: the budget, or the largest version rounded up. */
  scale: number;
  budget?: number;
  /** Raw size as a share of the scale, 0 to 1. */
  fill: number;
  /** Previous raw size as a share of the scale, 0 to 1. */
  previousFill?: number;
  /** Raw size as a whole percent of the scale (can pass 100). */
  percent: number;
  over: boolean;
};

/** Everything a world needs to draw the panel. Worlds only render; state lives here. */
export type BundleSizeWorldProps = {
  packageName: string;
  versions: string[];
  index: number;
  reading: BundleReading;
  select: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  tabRef: (index: number) => (el: HTMLButtonElement | null) => void;
  tabId: (index: number) => string;
  panelId: string;
  className?: string;
};

const kB = (bytes: number) => bytes / 1000;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Rounds a decrease or increase to one decimal, the precision every world shows. */
const round1 = (n: number) => Math.round(n * 10) / 10;

function readBundle(versions: BundleVersion[], index: number, budget?: number) {
  const current = versions[index];
  const prev = versions[index + 1];
  const raw = kB(current.raw);
  const largest = Math.max(...versions.map((v) => kB(v.raw)));
  const scale = budget ?? Math.max(10, Math.ceil(largest / 10) * 10);
  const delta = prev ? round1(((raw - kB(prev.raw)) / kB(prev.raw)) * 100) : 0;

  return {
    version: current.version,
    raw,
    gzip: kB(current.gzip),
    brotli: current.brotli === undefined ? undefined : kB(current.brotli),
    dependencies: current.dependencies,
    previous: prev && { version: prev.version, raw: kB(prev.raw) },
    delta: Math.abs(delta),
    trend: !prev ? "first" : delta < 0 ? "down" : delta > 0 ? "up" : "same",
    scale,
    budget,
    fill: clamp01(raw / scale),
    previousFill: prev && clamp01(kB(prev.raw) / scale),
    percent: Math.round((raw / scale) * 100),
    over: budget !== undefined && raw > budget,
  } satisfies BundleReading;
}

/** "-8.4%", "+3.0%" or "±0%". */
export function signedDelta(r: BundleReading) {
  if (r.trend === "same") return "±0%";
  return `${r.trend === "down" ? "-" : "+"}${r.delta.toFixed(1)}%`;
}

/** "-8.4% VS 1.1.0": the change as a terminal or a label prints it. */
export function deltaLabel(r: BundleReading) {
  return r.previous ? `${signedDelta(r)} VS ${r.previous.version}` : "FIRST RELEASE";
}

export const ARROW: Record<BundleTrend, string> = { down: "↓", up: "↑", same: "=", first: "·" };

export const KB_FORMAT = { minimumFractionDigits: 1, maximumFractionDigits: 1 } as const;

export function BundleSize({ packageName, versions, budget, variant, className }: BundleSizeProps) {
  const world = useWorld(variant);
  const [selected, setSelected] = useState(0);
  const index = Math.max(0, Math.min(versions.length - 1, selected));
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const select = useCallback(
    (next: number) => setSelected(Math.max(0, Math.min(versions.length - 1, next))),
    [versions.length],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const next = keyToIndex(event.key, index, versions.length, { wrap: true });
    if (next === null) return;
    event.preventDefault();
    select(next);
    refs.current[next]?.focus();
  };

  if (versions.length === 0) return null;

  const props: BundleSizeWorldProps = {
    packageName,
    versions: versions.map((v) => v.version),
    index,
    reading: readBundle(versions, index, budget),
    select,
    onKeyDown,
    tabRef: (i) => (el) => {
      refs.current[i] = el;
    },
    tabId: (i) => `${id}-tab-${i}`,
    panelId: `${id}-panel`,
    className,
  };

  switch (world) {
    case "craft":
      return <CraftBundleSize {...props} />;
    case "retro":
      return <RetroBundleSize {...props} />;
    case "toy":
      return <ToyBundleSize {...props} />;
    default:
      return <MinimalBundleSize {...props} />;
  }
}

/** Text equivalent of the size bar. */
export function barLabel(r: BundleReading) {
  const of = r.budget !== undefined ? `${r.budget} kB budget` : `a ${r.scale} kB scale`;
  return `${r.raw.toFixed(1)} kB of ${of}, ${r.percent}%${r.over ? ", over budget" : ""}`;
}
