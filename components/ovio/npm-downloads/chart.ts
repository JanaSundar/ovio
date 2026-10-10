import { COMPACT, formatNumber, formatShortDate } from "@/lib/format";
import type { DownloadWeek } from "./npm-downloads";

/**
 * The chart's numbers from a weekly history: the shown weeks as points, their peak and total,
 * the goal's place and a text summary. Plain functions, so the component and anything drawn on
 * the server (the README embed) read the same chart.
 */

export type WeekPoint = {
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

export type DownloadsChart = {
  points: WeekPoint[];
  latest: WeekPoint;
  /** Sum of the shown weeks. */
  total: number;
  peak: number;
  /** The goal line as 0–1 of the chart scale. */
  goalHeight: number;
  /** Text equivalent of the chart. */
  summary: string;
};

export const EMPTY_WEEK: WeekPoint = {
  week: "",
  label: "",
  downloads: 0,
  delta: null,
  height: 0,
  ago: 0,
};

/** A change this big (in percent) is shown as a multiple instead. */
const SURGE = 1000;

/** "+12.4%", "−3.1%", or with other marks for up and down ("▲ 12.4%"). */
export function formatDelta(delta: number | null, marks: [string, string] = ["+", "−"]): string {
  if (delta === null) return "—";
  // From eleven times up, a multiple reads better than a percentage: "×12", "↑ ×100M".
  if (delta >= SURGE)
    return `${marks[0] === "+" ? "" : marks[0]}×${formatNumber(1 + delta / 100, COMPACT)}`;
  return `${delta >= 0 ? marks[0] : marks[1]}${Math.abs(delta).toFixed(1)}%`;
}

/** The latest `weeks` of a history, scaled to their peak or the goal, whichever is higher. */
export function readDownloads(
  packageName: string,
  data: DownloadWeek[],
  weeks = 12,
  goal?: number,
): DownloadsChart {
  const start = Math.max(0, data.length - Math.max(1, weeks));
  const shown = data.slice(start);
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
  const latest = points[points.length - 1] ?? EMPTY_WEEK;
  const summary =
    points.length > 0
      ? `${packageName} weekly downloads, ${points.length} weeks from ${points[0].label} to ${latest.label}: ` +
        `latest ${formatNumber(latest.downloads)} (${formatDelta(latest.delta)} on the week before), ` +
        `peak ${formatNumber(peak)}` +
        (goal ? `, goal ${formatNumber(goal)}.` : ".")
      : `${packageName} weekly downloads: no data.`;
  return {
    points,
    latest,
    total: shown.reduce((sum, w) => sum + w.downloads, 0),
    peak,
    goalHeight: goal ? goal / scale : 0,
    summary,
  };
}

/** Craft's handwritten note at the foot of the receipt. */
export function receiptNote(delta: number | null, hit: boolean) {
  if (hit) return "goal hit, wow!";
  if (delta === null) return "first week!";
  if (delta >= SURGE) return `${formatDelta(delta)} in a week!`;
  if (delta >= 0) return `up ${delta.toFixed(1)}%, nice!`;
  return `down ${Math.abs(delta).toFixed(1)}%, onwards`;
}
