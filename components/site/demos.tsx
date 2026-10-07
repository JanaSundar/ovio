"use client";

import { useEffect, useState, type ReactNode } from "react";
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

/** Sample data used across the demos: the same fictional project as the mockups. */
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
  const [status, setStatus] = useState(0);
  const reduced = useReducedMotionSafe();
  // The deploy status cycles so every state can be seen.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setStatus((s) => (s + 1) % 3), 2400);
    return () => clearInterval(id);
  }, [reduced]);
  return (
    <GooeyTabs tabs={TABS} panels={PANELS} status={STATUSES[status]} label="Repository sections" />
  );
}

function KnobDemo() {
  return <PhysicalKnob defaultValue={72} label="Level" />;
}

function RepoDemo() {
  return <RepositoryCard repo={SAMPLE_REPO} />;
}

export const DEMOS: Record<string, { render: () => ReactNode; minHeight: number }> = {
  "repository-card": { render: () => <RepoDemo />, minHeight: 400 },
  "gooey-tabs": { render: () => <GooeyTabsDemo />, minHeight: 420 },
  "physical-knob": { render: () => <KnobDemo />, minHeight: 480 },
  "contribution-graph": { render: () => <ContributionGraphDemo />, minHeight: 520 },
  "star-history": { render: () => <StarHistoryDemo />, minHeight: 420 },
  "top-contributors": { render: () => <TopContributorsDemo />, minHeight: 460 },
  "npm-downloads": { render: () => <NpmDownloadsDemo />, minHeight: 440 },
  "bundle-size": { render: () => <BundleSizeDemo />, minHeight: 460 },
  changelog: { render: () => <ChangelogDemo />, minHeight: 460 },
};

export function Demo({ slug }: { slug: string }) {
  const demo = DEMOS[slug];
  return demo ? <>{demo.render()}</> : null;
}
