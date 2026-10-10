import { plural } from "@/lib/format";
import type { ContributionDay } from "./types";

/**
 * Shapes sparse daily counts into a GitHub-style year: columns are weeks (Sunday first),
 * rows are weekdays, every missing day is zero. Dates are calendar days ("YYYY-MM-DD") read in UTC,
 * so the grid is the same on the server and in every time zone.
 */

type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionCell = ContributionDay & {
  /** Position in the year, 0 is the first Sunday. */
  index: number;
  week: number;
  /** 0 Sunday … 6 Saturday. */
  weekday: number;
  /** Intensity bucket relative to the busiest day: 0 none … 4 busiest. */
  level: ContributionLevel;
  /** "Wed, Oct 7". */
  label: string;
};

export type ContributionYear = {
  /** Every day from the first Sunday to the last day, in order. */
  days: ContributionCell[];
  /** The days split by weekday, Sunday first (the rows of the grid). */
  rows: ContributionCell[][];
  weeks: number;
  /** Month names for the weeks that start a month, by week. */
  months: { week: number; label: string }[];
  total: number;
  /** Longest run of active days. */
  longest: number;
  /** Active days running up to the last day (a quiet last day does not break it). */
  current: number;
  /** The busiest day (the earliest one on a tie). */
  best: ContributionCell;
  /** The weekday with the most contributions, "Tuesday". */
  busiestWeekday: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DAY = 86_400_000;

const toTime = (date: string) => {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10);

/** Level from a count's share of the busiest day. */
function levelOf(count: number, max: number): ContributionLevel {
  if (count <= 0 || max <= 0) return 0;
  const r = count / max;
  return r <= 0.15 ? 1 : r <= 0.33 ? 2 : r <= 0.55 ? 3 : 4;
}

/**
 * Builds the full year grid from sparse data: 53 weeks ending on `end`
 * (defaults to the latest date in the data). Duplicate dates are summed, gaps are zero.
 */
export function buildContributionYear(
  data: ContributionDay[],
  { end, weeks = 53 }: { end?: string; weeks?: number } = {},
): ContributionYear {
  const counts = new Map<number, number>();
  for (const d of data) {
    const t = toTime(d.date);
    counts.set(t, (counts.get(t) ?? 0) + Math.max(0, d.count));
  }

  // Without data or an end date the year ends today (UTC), the only non-deterministic case.
  const last = end
    ? toTime(end)
    : counts.size
      ? Math.max(...counts.keys())
      : toTime(toIso(Date.now()));
  const lastWeekday = new Date(last).getUTCDay();
  const length = (weeks - 1) * 7 + lastWeekday + 1;
  const first = last - (length - 1) * DAY;

  const raw = Array.from({ length }, (_, i) => counts.get(first + i * DAY) ?? 0);
  const max = Math.max(0, ...raw);

  const days: ContributionCell[] = raw.map((count, index) => {
    const date = new Date(first + index * DAY);
    const weekday = index % 7;
    return {
      date: toIso(date.getTime()),
      count,
      index,
      week: Math.floor(index / 7),
      weekday,
      level: levelOf(count, max),
      label: `${WEEKDAYS[weekday].slice(0, 3)}, ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`,
    };
  });

  const months: ContributionYear["months"] = [];
  for (let w = 0; w < weeks; w++) {
    const sunday = new Date(first + w * 7 * DAY);
    if (sunday.getUTCDate() <= 7) months.push({ week: w, label: MONTHS[sunday.getUTCMonth()] });
  }

  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  for (let i = days[length - 1].count ? length - 1 : length - 2; i >= 0 && days[i].count; i--) {
    current++;
  }

  const byWeekday = [0, 0, 0, 0, 0, 0, 0];
  for (const d of days) byWeekday[d.weekday] += d.count;

  return {
    days,
    rows: WEEKDAYS.map((_, wd) => days.filter((d) => d.weekday === wd)),
    weeks,
    months,
    total: raw.reduce((a, b) => a + b, 0),
    longest,
    current,
    best: days.reduce((a, d) => (d.count > a.count ? d : a), days[0]),
    busiestWeekday: WEEKDAYS[byWeekday.indexOf(Math.max(...byWeekday))],
  };
}

export const unit = (count: number) => plural(count, "contribution");
