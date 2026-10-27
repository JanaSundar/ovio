"use client";

import { BundleSize } from "@/components/ovio/bundle-size/bundle-size";
import { VERSIONS } from "@/components/ovio/bundle-size/demo";
import { ContributionGraph } from "@/components/ovio/contribution-graph/contribution-graph";
import { SAMPLE as CONTRIBUTIONS } from "@/components/ovio/contribution-graph/demo";
import { GitBranchVisualizer } from "@/components/ovio/git-branch-visualizer/git-branch-visualizer";
import { COMMITS } from "@/components/ovio/git-branch-visualizer/demo";
import { NpmDownloads } from "@/components/ovio/npm-downloads/npm-downloads";
import { StarHistory } from "@/components/ovio/star-history/star-history";
import { ANNOTATIONS, DATA as STARS } from "@/components/ovio/star-history/demo";
import { TopContributors } from "@/components/ovio/top-contributors/top-contributors";
import { CONTRIBUTORS } from "@/components/ovio/top-contributors/demo";
import { SAMPLE_DOWNLOADS, SAMPLE_PACKAGE } from "@/content/samples";
import { renderer, type Renders } from "./types";

const RENDERS: Renders = {
  "contribution-graph": (p) => (
    <ContributionGraph data={CONTRIBUTIONS} endDate="2026-10-07" {...p} />
  ),
  "star-history": (p) => <StarHistory data={STARS} annotations={ANNOTATIONS} {...p} />,
  "npm-downloads": (p) => (
    <NpmDownloads packageName={SAMPLE_PACKAGE} data={SAMPLE_DOWNLOADS} {...p} />
  ),
  "bundle-size": (p) => <BundleSize packageName="lumen" versions={VERSIONS} {...p} />,
  "git-branch-visualizer": (p) => (
    <GitBranchVisualizer
      repo="ada-dev/lumen"
      commits={COMMITS}
      head="main"
      defaultValue="6e10d88a2c5f4b91e7d03c6a8b2f5e1d9c4a7b03"
      {...p}
    />
  ),
  "top-contributors": (p) => (
    <TopContributors repo="ada-dev/lumen" contributors={CONTRIBUTORS} {...p} />
  ),
};

export default renderer(RENDERS);
