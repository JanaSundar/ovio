"use client";

import type { ComponentType } from "react";
import { BundleSizeDemo } from "@/components/ovio/bundle-size/demo";
import { ChangelogDemo } from "@/components/ovio/changelog/demo";
import { ContributionGraphDemo } from "@/components/ovio/contribution-graph/demo";
import { DeveloperIdCardDemo } from "@/components/ovio/developer-id-card/demo";
import { EventTicketDemo } from "@/components/ovio/event-ticket/demo";
import { GitBranchVisualizerDemo } from "@/components/ovio/git-branch-visualizer/demo";
import { GooeyTabsDemo } from "@/components/ovio/gooey-tabs/demo";
import { NowPlayingDemo } from "@/components/ovio/now-playing/demo";
import { NpmDownloadsDemo } from "@/components/ovio/npm-downloads/demo";
import { PhysicalKnobDemo } from "@/components/ovio/physical-knob/demo";
import { RepositoryCardDemo } from "@/components/ovio/repository-card/demo";
import { SponsorWallDemo } from "@/components/ovio/sponsor-wall/demo";
import { StarHistoryDemo } from "@/components/ovio/star-history/demo";
import { ToastDemo } from "@/components/ovio/toast/demo";
import { TopContributorsDemo } from "@/components/ovio/top-contributors/demo";

/** Each component's demo, with fixed sample props, and the stage height it needs. */
export const DEMOS: Record<string, { Demo: ComponentType; minHeight: number }> = {
  "repository-card": { Demo: RepositoryCardDemo, minHeight: 400 },
  "gooey-tabs": { Demo: GooeyTabsDemo, minHeight: 420 },
  "physical-knob": { Demo: PhysicalKnobDemo, minHeight: 480 },
  "contribution-graph": { Demo: ContributionGraphDemo, minHeight: 520 },
  "star-history": { Demo: StarHistoryDemo, minHeight: 420 },
  "top-contributors": { Demo: TopContributorsDemo, minHeight: 460 },
  "npm-downloads": { Demo: NpmDownloadsDemo, minHeight: 440 },
  "bundle-size": { Demo: BundleSizeDemo, minHeight: 460 },
  changelog: { Demo: ChangelogDemo, minHeight: 460 },
  "event-ticket": { Demo: EventTicketDemo, minHeight: 500 },
  "sponsor-wall": { Demo: SponsorWallDemo, minHeight: 480 },
  "developer-id-card": { Demo: DeveloperIdCardDemo, minHeight: 520 },
  "git-branch-visualizer": { Demo: GitBranchVisualizerDemo, minHeight: 520 },
  "now-playing": { Demo: NowPlayingDemo, minHeight: 440 },
  toast: { Demo: ToastDemo, minHeight: 280 },
};

/** A component's demo, with fixed sample props. */
export function Demo({ slug }: { slug: string }) {
  const demo = DEMOS[slug];
  return demo ? <demo.Demo /> : null;
}
