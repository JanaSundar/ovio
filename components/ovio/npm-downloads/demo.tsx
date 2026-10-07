"use client";

import { seeded } from "@/components/site/seeded";
import { NpmDownloads, type DownloadWeek } from "./npm-downloads";

/** 26 weeks of steady growth with some noise, from a fixed seed so SSR and client agree. */
function sampleWeeks(): DownloadWeek[] {
  const rnd = seeded(4821);
  const start = Date.UTC(2026, 3, 6);
  const weeks = Array.from({ length: 26 }, (_, i) => ({
    week: new Date(start + i * 7 * 86400000).toISOString().slice(0, 10),
    downloads: Math.round(20000 * Math.pow(1.034, i) * (0.9 + rnd() * 0.2)),
  }));
  weeks[24].downloads = 42890;
  weeks[25].downloads = 48210;
  return weeks;
}

const DOWNLOADS = sampleWeeks();

export function NpmDownloadsDemo() {
  return <NpmDownloads packageName="lumen" data={DOWNLOADS} goal={50000} />;
}
