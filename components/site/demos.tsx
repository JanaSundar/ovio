"use client";

import { useEffect, useState, type ComponentType } from "react";
import { GooeyTabs, type GooeyStatus } from "@/components/ovio/gooey-tabs/gooey-tabs";
import { PhysicalKnob } from "@/components/ovio/physical-knob/physical-knob";
import { RepositoryCard, type Repository } from "@/components/ovio/repository-card/repository-card";
import { BundleSizeDemo } from "@/components/ovio/bundle-size/demo";
import { ChangelogDemo } from "@/components/ovio/changelog/demo";
import { ContributionGraphDemo } from "@/components/ovio/contribution-graph/demo";
import { NpmDownloadsDemo } from "@/components/ovio/npm-downloads/demo";
import { StarHistoryDemo } from "@/components/ovio/star-history/demo";
import { TopContributorsDemo } from "@/components/ovio/top-contributors/demo";
import { useReducedMotionSafe } from "@/lib/motion";

/** Sample data shared by the demos, for one fictional project. */
const SAMPLE_REPO: Repository = {
  owner: "ada-dev",
  name: "lumen",
  description: "A tiny, typed state machine for interface animation.",
  language: "TypeScript",
  stars: 10945,
  forks: 812,
  issues: 37,
  updatedAt: "2026-10-07T06:00:00Z",
};

const TABS = ["Overview", "Commits", "Issues", "Releases"];
const PANELS = [
  "README · 4 min read",
  "1,248 commits on main",
  "37 open · 412 closed",
  "v2.4.0 is latest",
];
const STATUSES: GooeyStatus[] = ["offline", "building", "online"];

function GooeyTabsDemo() {
  const [status, setStatus] = useState(1);
  const reduced = useReducedMotionSafe();
  // The deploy status cycles so every state can be seen; it holds on "building" under reduced motion.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setStatus((s) => (s + 1) % STATUSES.length), 2400);
    return () => clearInterval(id);
  }, [reduced]);
  return (
    <GooeyTabs tabs={TABS} panels={PANELS} status={STATUSES[status]} label="Repository sections" />
  );
}

const KnobDemo = () => <PhysicalKnob defaultValue={72} label="Level" />;
const RepoDemo = () => <RepositoryCard repository={SAMPLE_REPO} />;

export const DEMOS: Record<string, { Demo: ComponentType; minHeight: number }> = {
  "repository-card": { Demo: RepoDemo, minHeight: 400 },
  "gooey-tabs": { Demo: GooeyTabsDemo, minHeight: 420 },
  "physical-knob": { Demo: KnobDemo, minHeight: 480 },
  "contribution-graph": { Demo: ContributionGraphDemo, minHeight: 520 },
  "star-history": { Demo: StarHistoryDemo, minHeight: 420 },
  "top-contributors": { Demo: TopContributorsDemo, minHeight: 460 },
  "npm-downloads": { Demo: NpmDownloadsDemo, minHeight: 440 },
  "bundle-size": { Demo: BundleSizeDemo, minHeight: 460 },
  changelog: { Demo: ChangelogDemo, minHeight: 460 },
};

/** A component's demo, with fixed sample props. */
export function Demo({ slug }: { slug: string }) {
  const demo = DEMOS[slug];
  return demo ? <demo.Demo /> : null;
}
