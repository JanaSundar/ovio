"use client";

import type { ComponentType, ReactNode } from "react";
import { GooeyTabs, type GooeyTabsProps } from "@/components/ovio/gooey-tabs/gooey-tabs";
import {
  PhysicalKnob,
  type PhysicalKnobProps,
} from "@/components/ovio/physical-knob/physical-knob";
import {
  RepositoryCard,
  type Repository,
  type RepositoryCardProps,
} from "@/components/ovio/repository-card/repository-card";
import type {
  ContributorPeriod,
  TopContributorsProps,
} from "@/components/ovio/top-contributors/top-contributors";
import { BundleSizeDemo } from "@/components/ovio/bundle-size/demo";
import { ChangelogDemo } from "@/components/ovio/changelog/demo";
import { ContributionGraphDemo } from "@/components/ovio/contribution-graph/demo";
import { NpmDownloadsDemo } from "@/components/ovio/npm-downloads/demo";
import { StarHistoryDemo } from "@/components/ovio/star-history/demo";
import { TopContributorsDemo } from "@/components/ovio/top-contributors/demo";
import type { ControlValues } from "@/content/components";
import { usePlayground, type Playground } from "./playground";
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

type Render = (values: ControlValues, set: Playground["set"]) => ReactNode;

/** Spreads the playground's values as props: they are named after the component's own props. */
const spread =
  <P extends object>(Component: ComponentType<P>): Render =>
  (values) => <Component {...(values as P)} />;

export const DEMOS: Record<string, { render: Render; minHeight: number }> = {
  "repository-card": {
    render: (v) => <RepositoryCard repo={SAMPLE_REPO} {...(v as Partial<RepositoryCardProps>)} />,
    minHeight: 400,
  },
  "gooey-tabs": {
    render: (v) => (
      <GooeyTabs
        tabs={TABS}
        panels={PANELS}
        label="Repository sections"
        {...(v as Partial<GooeyTabsProps>)}
      />
    ),
    minHeight: 420,
  },
  // The knob drives its control too, so turning it moves the slider and the snippet.
  "physical-knob": {
    render: ({ defaultValue, ...v }, set) => (
      <PhysicalKnob
        label="Level"
        {...(v as Partial<PhysicalKnobProps>)}
        value={defaultValue as number | undefined}
        onChange={(n) => set("defaultValue", n)}
      />
    ),
    minHeight: 480,
  },
  "contribution-graph": { render: spread(ContributionGraphDemo), minHeight: 520 },
  "star-history": { render: spread(StarHistoryDemo), minHeight: 420 },
  "top-contributors": {
    render: ({ defaultPeriod, ...v }, set) => (
      <TopContributorsDemo
        {...(v as Partial<TopContributorsProps>)}
        period={defaultPeriod as ContributorPeriod | undefined}
        onPeriodChange={(p) => set("defaultPeriod", p)}
      />
    ),
    minHeight: 460,
  },
  "npm-downloads": { render: spread(NpmDownloadsDemo), minHeight: 440 },
  "bundle-size": { render: spread(BundleSizeDemo), minHeight: 460 },
  changelog: { render: spread(ChangelogDemo), minHeight: 460 },
};

/** A component's demo, fed by the nearest playground (none on the homepage: defaults apply). */
export function Demo({ slug }: { slug: string }) {
  const { values, set } = usePlayground();
  return <>{DEMOS[slug]?.render(values, set)}</>;
}
