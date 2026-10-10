/** Ready-made compositions of existing components. */

import { installCommand } from "./components";

export type Recipe = {
  slug: string;
  name: string;
  pitch: string;
  /** Where it belongs: a project site, a personal site, a status strip. */
  fits: string;
  slugs: string[];
  code: string;
};

export const RECIPES: Recipe[] = [
  {
    slug: "project-page",
    name: "Project page",
    pitch: "A repo, its stars, the people, and the releases — one world for all of them.",
    fits: "Project sites and READMEs that became pages.",
    slugs: ["repository-card", "star-history", "top-contributors", "changelog"],
    code: `import { OvioProvider } from "@/components/shared/world-provider";
import { RepositoryCard } from "@/components/ovio/repository-card/repository-card";
import { StarHistory } from "@/components/ovio/star-history/star-history";
import { TopContributors } from "@/components/ovio/top-contributors/top-contributors";
import { Changelog } from "@/components/ovio/changelog/changelog";

export function ProjectPage({ repository, stars, contributors, releases }) {
  return (
    <OvioProvider world="craft">
      <RepositoryCard repository={repository} />
      <StarHistory variant="craft" data={stars} repo="ada-dev/lumen" />
      <TopContributors contributors={contributors} repo="ada-dev/lumen" />
      <Changelog releases={releases} />
    </OvioProvider>
  );
}`,
  },
  {
    slug: "portfolio-header",
    name: "Portfolio header",
    pitch: "Who you are, a year of work, and what is playing while you build.",
    fits: "Personal sites and profiles.",
    slugs: ["developer-id-card", "contribution-graph", "now-playing"],
    code: `import { OvioProvider } from "@/components/shared/world-provider";
import { DeveloperIdCard } from "@/components/ovio/developer-id-card/developer-id-card";
import { ContributionGraph } from "@/components/ovio/contribution-graph/contribution-graph";
import { NowPlaying } from "@/components/ovio/now-playing/now-playing";

export function PortfolioHeader({ contributions, track }) {
  return (
    <OvioProvider world="minimal">
      <DeveloperIdCard
        name="Ada Park"
        title="Senior Software Engineer"
        stack={["React", "TypeScript", "Node"]}
        github="ada-dev"
        location="Chennai, India"
        available
      />
      <ContributionGraph data={contributions} />
      <NowPlaying track={track} />
    </OvioProvider>
  );
}`,
  },
  {
    slug: "release-desk",
    name: "Release desk",
    pitch: "Deploy status, weekly installs, and the bundle you just shipped.",
    fits: "Docs sidebars and project status strips.",
    slugs: ["gooey-tabs", "npm-downloads", "bundle-size"],
    code: `import { OvioProvider } from "@/components/shared/world-provider";
import { GooeyTabs } from "@/components/ovio/gooey-tabs/gooey-tabs";
import { NpmDownloads } from "@/components/ovio/npm-downloads/npm-downloads";
import { BundleSize } from "@/components/ovio/bundle-size/bundle-size";

export function ReleaseDesk({ downloads, versions }) {
  return (
    <OvioProvider world="retro">
      <GooeyTabs
        tabs={["Overview", "Downloads", "Bundle"]}
        status="online"
        panels={[
          <p key="overview">Production is up.</p>,
          <NpmDownloads key="downloads" packageName="lumen" data={downloads} />,
          <BundleSize key="bundle" packageName="lumen" versions={versions} />,
        ]}
      />
    </OvioProvider>
  );
}`,
  },
];

/** One shell line that installs every component a recipe uses. */
export const recipeInstall = (slugs: string[]) =>
  slugs.map((slug) => installCommand(slug)).join(" && ");
