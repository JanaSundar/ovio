"use client";

import { DemoLabel } from "@/components/site/live-demo";
import { SAMPLE_ONLY } from "@/content/demo-sources";
import { StarHistory, type StarHistoryAnnotation, type StarHistoryPoint } from "./star-history";

/** Stars gained each month, Oct 2024 to Sep 2026. July 2025 is the Hacker News spike. */
const GAINS = [
  40, 55, 70, 90, 120, 150, 180, 210, 260, 2400, 620, 380, 330, 300, 340, 410, 380, 450, 520, 600,
  640, 720, 800, 880,
];

/** Spreads each month's stars over its days: a steady wobble, or a burst that decays after launch day. */
function buildHistory(): StarHistoryPoint[] {
  const out: StarHistoryPoint[] = [];
  let stars = 0;
  GAINS.forEach((gain, i) => {
    const year = 2024 + Math.floor((9 + i) / 12);
    const month = (9 + i) % 12;
    const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const weights = Array.from({ length: days }, (_, d) =>
      i === 9
        ? d >= 13
          ? 0.4 + 30 * Math.exp(-(d - 13) / 2)
          : 0.4
        : 1 + 0.5 * Math.sin((i * 31 + d) * 1.7) + 0.3 * Math.sin(d * 0.37),
    );
    const sum = weights.reduce((a, b) => a + b, 0);
    let given = 0;
    let acc = 0;
    weights.forEach((w, d) => {
      acc += (w / sum) * gain;
      const today = Math.round(acc) - given;
      given += today;
      stars += today;
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d + 1).padStart(2, "0")}`;
      out.push({ date, stars });
    });
  });
  return out;
}

const DATA = buildHistory();
const ANNOTATIONS: StarHistoryAnnotation[] = [
  { date: "2025-07-14", label: "hit the HN front page!" },
];

export function StarHistoryDemo() {
  return (
    <>
      <DemoLabel>Sample data · {SAMPLE_ONLY["star-history"]}</DemoLabel>
      <StarHistory repo="ada-dev/lumen" data={DATA} annotations={ANNOTATIONS} />
    </>
  );
}
