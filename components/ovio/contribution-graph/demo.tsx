"use client";

import { LiveDemo } from "@/components/site/live-demo";
import { seeded } from "@/components/site/seeded";
import { ContributionGraph, type ContributionDay } from "./contribution-graph";

const END = Date.UTC(2026, 9, 7);
const DAYS = 371;

/**
 * A year of ada-dev's commits to lumen, ending 2026-10-07: quieter weekends, a v2 push in winter,
 * a three-week break in spring, a release sprint in summer and a busier autumn. Only active days are
 * listed; the graph fills the gaps with zero.
 */
const SAMPLE: ContributionDay[] = (() => {
  const rnd = seeded(20261007);
  const out: ContributionDay[] = [];
  for (let i = 0; i < DAYS; i++) {
    const time = END - (DAYS - 1 - i) * 86_400_000;
    const week = Math.floor(i / 7);
    const weekday = new Date(time).getUTCDay();
    let act = weekday === 0 || weekday === 6 ? 0.3 : 0.6;
    if (week >= 9 && week <= 16) act += 0.35;
    if (week >= 31 && week <= 35) act += 0.3;
    if (week >= 44) act += 0.15;
    if (week >= 21 && week <= 23) act = 0.05;
    const count = rnd() < act ? Math.max(1, Math.round(rnd() ** 1.5 * act * 22)) : 0;
    if (count) out.push({ date: new Date(time).toISOString().slice(0, 10), count });
  }
  return out;
})();

export function ContributionGraphDemo() {
  return (
    <LiveDemo slug="contribution-graph" fallback={SAMPLE}>
      {(data, live) => (
        <ContributionGraph
          data={data}
          endDate={live ? undefined : "2026-10-07"}
          compactMonths={6}
        />
      )}
    </LiveDemo>
  );
}
