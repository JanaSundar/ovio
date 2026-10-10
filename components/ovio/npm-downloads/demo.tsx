"use client";

import { LiveDemo } from "@/components/site/live-demo";
import { DEMO_TARGETS } from "@/content/demo-sources";
import { SAMPLE_DOWNLOADS, SAMPLE_PACKAGE } from "@/content/samples";
import { NpmDownloads, type DownloadWeek } from "./npm-downloads";

/** The next round milestone above the busiest week: 86M → 100M. */
function goalFor(data: DownloadWeek[]) {
  const peak = Math.max(...data.map((w) => w.downloads));
  const step = 10 ** Math.floor(Math.log10(peak));
  return Math.ceil((peak * 1.1) / step) * step;
}

export function NpmDownloadsDemo() {
  return (
    <LiveDemo slug="npm-downloads" fallback={SAMPLE_DOWNLOADS}>
      {(data, live) =>
        live ? (
          <NpmDownloads
            packageName={DEMO_TARGETS["npm-downloads"]}
            data={data}
            goal={goalFor(data)}
          />
        ) : (
          <NpmDownloads packageName={SAMPLE_PACKAGE} data={data} goal={50000} />
        )
      }
    </LiveDemo>
  );
}
