"use client";

import { LiveDemo } from "@/components/site/live-demo";
import { seeded } from "@/components/site/seeded";
import { DEMO_TARGETS, DEMO_WEEKS } from "@/content/demo-sources";
import { NpmDownloads, type DownloadWeek } from "./npm-downloads";

/** The sample: steady growth with some noise, from a fixed seed so SSR and client agree. */
function sampleWeeks(): DownloadWeek[] {
  const rnd = seeded(4821);
  const start = Date.UTC(2026, 6, 6);
  const weeks = Array.from({ length: DEMO_WEEKS }, (_, i) => ({
    week: new Date(start + i * 7 * 86400000).toISOString().slice(0, 10),
    downloads: Math.round(31000 * Math.pow(1.034, i) * (0.9 + rnd() * 0.2)),
  }));
  weeks[11].downloads = 42890;
  weeks[12].downloads = 48210;
  return weeks;
}

const DOWNLOADS = sampleWeeks();

/** The next round milestone above the busiest week: 86M → 100M. */
function goalFor(data: DownloadWeek[]) {
  const peak = Math.max(...data.map((w) => w.downloads));
  const step = 10 ** Math.floor(Math.log10(peak));
  return Math.ceil((peak * 1.1) / step) * step;
}

export function NpmDownloadsDemo() {
  return (
    <LiveDemo slug="npm-downloads" fallback={DOWNLOADS}>
      {(data, live) =>
        live ? (
          <NpmDownloads
            packageName={DEMO_TARGETS["npm-downloads"]}
            data={data}
            goal={goalFor(data)}
          />
        ) : (
          <NpmDownloads packageName="lumen" data={data} goal={50000} />
        )
      }
    </LiveDemo>
  );
}
