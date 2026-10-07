/** The component catalogue. Props of components that are not `ready` yet are provisional. */

type PropDoc = { name: string; type: string; description: string };

export type ComponentDoc = {
  slug: string;
  name: string;
  /** What it is drawn with. */
  tech: string;
  description: string;
  exportName: string;
  /** Lines for the usage snippet, after `variant`. */
  usage: string;
  props: PropDoc[];
  phase: 1 | 2 | 3;
  /** Whether the component ships in this build. */
  ready: boolean;
  /** Planned npm packages. A built component's come from registry.json. */
  dependencies?: string[];
  /** Planned Ovio registry items. A built component's come from registry.json. */
  registryDependencies?: string[];
};

const WORLDS_TYPE = '"minimal" | "craft" | "retro" | "toy"';
const V: PropDoc = {
  name: "variant",
  type: WORLDS_TYPE,
  description: "Which world to render. Defaults to the nearest OvioProvider, then minimal.",
};
const A: PropDoc = {
  name: "animation",
  type: '"none" | "enter-exit" | "always"',
  description: 'Forced to "none" under reduced motion.',
};
const CL: PropDoc = { name: "className", type: "string", description: "Merged onto the root." };

export const COMPONENTS: ComponentDoc[] = [
  {
    slug: "contribution-graph",
    name: "Contribution Graph",
    tech: "CSS grid · Motion for React (Toy: CSS 3D drum)",
    description:
      "A year of activity, one cell per day. From an editorial heatmap to a drum you can spin.",
    exportName: "ContributionGraph",
    usage: "  data={contributions}",
    props: [
      {
        name: "data",
        type: "{ date: string; count: number }[]",
        description: "Daily counts as YYYY-MM-DD. Gaps become zero; duplicate dates are summed.",
      },
      V,
      {
        name: "animation",
        type: '"none" | "enter-exit" | "always"',
        description:
          'Default "enter-exit". "always" adds the Retro flicker and roll bar. Forced to "none" under reduced motion.',
      },
      {
        name: "endDate",
        type: "string",
        description: "Last day shown. Defaults to the latest date in data.",
      },
      {
        name: "onDayHover",
        type: "(day: ContributionCell | null) => void",
        description: "Hover and keyboard focus; null when they leave.",
      },
      CL,
    ],
    phase: 2,
    ready: true,
  },
  {
    slug: "event-ticket",
    name: "Event Ticket",
    tech: "CSS 3D · canvas art",
    description:
      "A pass for launches and conferences. Book on the stub, tear it to check in, flip it for the QR code.",
    exportName: "EventTicket",
    usage: '  layout="horizontal"\n  onBook={reserve}\n  onTear={checkIn}',
    props: [
      V,
      {
        name: "layout",
        type: '"horizontal" | "vertical"',
        description: "Side stub or tear-off bottom.",
      },
      { name: "event", type: "{ name; date; venue? }", description: "Printed on the ticket." },
      {
        name: "onBook",
        type: "(attendee) => Promise<void>",
        description: "The book button waits on it.",
      },
      { name: "onTear", type: "() => void", description: "Fires when the stub tears off." },
    ],
    phase: 3,
    ready: false,
    dependencies: ["motion", "uqr"],
    registryDependencies: ["world", "motion", "theme"],
  },
  {
    slug: "gooey-tabs",
    name: "Gooey Tabs",
    tech: "SVG goo filter · Motion for React (Toy: spring drag)",
    description:
      "A tab bar with a moving indicator and a deploy status. In Toy, the indicator is a piece you can drag and flick.",
    exportName: "GooeyTabs",
    usage: '  tabs={["Overview", "Commits", "Issues", "Releases"]}',
    props: [
      V,
      { name: "tabs", type: "string[]", description: "Equal-width tabs." },
      {
        name: "value / defaultValue",
        type: "number",
        description: "Selected index, controlled or not.",
      },
      {
        name: "onValueChange",
        type: "(index: number) => void",
        description: "Fires when a tab is chosen.",
      },
      {
        name: "status",
        type: '"offline" | "building" | "online"',
        description: "Deploy indicator. Hidden when left out.",
      },
      { name: "panels", type: "ReactNode[]", description: "Panel content per tab." },
      { name: "goo", type: "number", description: "Blur strength of the filter. Default 9." },
      CL,
    ],
    phase: 1,
    ready: true,
  },
  {
    slug: "star-history",
    name: "Star History",
    tech: "SVG · Motion for React path draw",
    description: "Stargazers over time, with annotated spikes.",
    exportName: "StarHistory",
    usage: "  data={stars}",
    props: [
      {
        name: "data",
        type: "{ date: string; stars: number }[]",
        description: "Cumulative stars by day, any order.",
      },
      {
        name: "repo",
        type: "string",
        description: '"owner/name", for the title and accessible name.',
      },
      { name: "annotations", type: "{ date; label }[]", description: "Callouts on the curve." },
      V,
      {
        name: "animation",
        type: '"none" | "enter-exit" | "always"',
        description:
          'Default "enter-exit". "always" keeps a live marker on the latest point. Forced to "none" under reduced motion.',
      },
      CL,
    ],
    phase: 2,
    ready: true,
  },
  {
    slug: "repository-card",
    name: "Repository Card",
    tech: "CSS · Motion for React",
    description: "A repo at a glance: name, description, stars, forks and language.",
    exportName: "RepositoryCard",
    usage: "  repository={repository}",
    props: [
      V,
      {
        name: "repository",
        type: "{ owner; name; description?; language?; stars; forks; issues?; updatedAt? }",
        description: "Repository data. Fetch it on the server with getRepository().",
      },
      {
        name: "stats",
        type: '("stars" | "forks" | "issues")[]',
        description: "Which counts to show.",
      },
      {
        name: "starred / onStarredChange",
        type: "boolean · (starred) => void",
        description: "The Toy star key toggles it.",
      },
      CL,
    ],
    phase: 1,
    ready: true,
  },
  {
    slug: "top-contributors",
    name: "Top Contributors",
    tech: "CSS · Motion for React",
    description: "The people behind a project, ranked by commits.",
    exportName: "TopContributors",
    usage: "  contributors={contributors}",
    props: [
      {
        name: "contributors",
        type: "{ login; name?; avatarUrl?; commits; byPeriod? }[]",
        description: "Ranked by commits in the chosen window.",
      },
      V,
      { name: "repo", type: "string", description: 'Header label, e.g. "ada-dev/lumen".' },
      { name: "limit", type: "number", description: "Max people shown. Default 6." },
      {
        name: "period / defaultPeriod",
        type: '"30d" | "90d" | "all"',
        description: 'Time window, controlled or not. Default "90d".',
      },
      {
        name: "onPeriodChange",
        type: "(period) => void",
        description: "Fires when the window changes.",
      },
      {
        name: "periods",
        type: "ContributorPeriod[]",
        description: "Windows offered; [] hides the switcher.",
      },
      CL,
    ],
    phase: 2,
    ready: true,
  },
  {
    slug: "npm-downloads",
    name: "npm Downloads",
    tech: "CSS · SVG · Motion for React",
    description: "Weekly installs with trend and goal.",
    exportName: "NpmDownloads",
    usage: '  packageName="lumen"\n  data={downloads}',
    props: [
      { name: "packageName", type: "string", description: "npm package name." },
      {
        name: "data",
        type: "{ week: string; downloads: number }[]",
        description: "Weekly history, oldest first.",
      },
      V,
      { name: "weeks", type: "number", description: "Latest weeks shown. Default 12." },
      { name: "goal", type: "number", description: "Weekly target. Hidden when left out." },
      CL,
    ],
    phase: 2,
    ready: true,
  },
  {
    slug: "sponsor-wall",
    name: "Sponsor Wall",
    tech: "CSS · Motion for React",
    description: "Sponsors by tier, from a logo wall to blocks on a pegboard.",
    exportName: "SponsorWall",
    usage: "  sponsors={sponsors}",
    props: [
      V,
      { name: "sponsors", type: "{ name; tier; url? }[]", description: "Tier decides size." },
      { name: "cta", type: "string", description: "Become-a-sponsor link." },
      A,
    ],
    phase: 3,
    ready: false,
    dependencies: ["motion"],
    registryDependencies: ["world", "motion", "theme"],
  },
  {
    slug: "physical-knob",
    name: "Physical Knob",
    tech: "CSS · Motion for React (spring, drag, inertia)",
    description:
      "A rotary control with tick marks and a value display. Drag, flick, scroll or use the arrow keys.",
    exportName: "PhysicalKnob",
    usage: "  onValueChange={setLevel}",
    props: [
      V,
      {
        name: "value / defaultValue",
        type: "number",
        description: "Controlled value, or the starting one (72).",
      },
      { name: "min / max", type: "number", description: "Range, default 0–100." },
      {
        name: "onValueChange",
        type: "(value: number) => void",
        description: "Fires while turning.",
      },
      { name: "label", type: "string", description: "Accessible name, printed on the dial." },
      CL,
    ],
    phase: 1,
    ready: true,
  },
  {
    slug: "developer-id-card",
    name: "Developer ID Card",
    tech: "CSS · Motion for React (drag)",
    description: "An identity card for a developer: name, role, stack, availability and a QR code.",
    exportName: "DeveloperIdCard",
    usage: '  name="Jana Sundar"\n  role="Senior Software Engineer"',
    props: [
      V,
      { name: "name", type: "string", description: "Printed name." },
      { name: "role", type: "string", description: "Job title." },
      { name: "stack", type: "string[]", description: "Technologies." },
      { name: "github", type: "string", description: "Profile for the QR code." },
    ],
    phase: 3,
    ready: false,
    dependencies: ["motion", "uqr"],
    registryDependencies: ["world", "motion", "theme"],
  },
  {
    slug: "bundle-size",
    name: "Bundle Size",
    tech: "CSS · Motion for React",
    description: "Package size with gzip, brotli and the change from the previous version.",
    exportName: "BundleSize",
    usage: '  packageName="lumen"\n  versions={versions}',
    props: [
      { name: "packageName", type: "string", description: "npm package name." },
      {
        name: "versions",
        type: "{ version; raw; gzip; brotli?; dependencies? }[]",
        description: "Sizes in bytes, newest first.",
      },
      V,
      {
        name: "budget",
        type: "number",
        description: "Budget in kB. The bar scales to the largest version without it.",
      },
      CL,
    ],
    phase: 2,
    ready: true,
  },
  {
    slug: "git-branch-visualizer",
    name: "Git Branch Visualizer",
    tech: "SVG · Motion for React",
    description:
      "Branches and commits as a graph. Hover a commit, pick a branch, merge or branch off.",
    exportName: "GitBranchVisualizer",
    usage: '  commits={commits}\n  head="main"',
    props: [
      V,
      {
        name: "commits",
        type: "{ id; branch; message; author; date; parents[] }[]",
        description: "Commit list.",
      },
      { name: "head", type: "string", description: "Checked-out branch." },
      { name: "onSelect", type: "(commit) => void", description: "Commit selected." },
    ],
    phase: 3,
    ready: false,
    dependencies: ["motion"],
    registryDependencies: ["world", "motion", "theme"],
  },
  {
    slug: "changelog",
    name: "Changelog",
    tech: "CSS · Motion for React",
    description: "Releases with dates and notes.",
    exportName: "Changelog",
    usage: "  releases={releases}",
    props: [
      {
        name: "releases",
        type: "{ version; date; title; items: (string | { type?; text })[]; hash? }[]",
        description: "Newest first. Item types: added, fixed, changed.",
      },
      V,
      { name: "limit", type: "number", description: "Releases shown. All when left out." },
      CL,
    ],
    phase: 2,
    ready: true,
  },
  {
    slug: "now-playing",
    name: "Now Playing",
    tech: "CSS · Motion for React",
    description: "What you're listening to, live.",
    exportName: "NowPlaying",
    usage: "  track={track}",
    props: [
      V,
      { name: "track", type: "{ title; artist; album; duration }", description: "Current track." },
      { name: "progress", type: "number", description: "Seconds elapsed." },
      A,
    ],
    phase: 3,
    ready: false,
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number"],
  },
];

export const getComponent = (slug: string) => COMPONENTS.find((c) => c.slug === slug);

/** Where "Docs" links land: the first built component. /docs redirects here too. */
export const DOCS_HREF = `/docs/${COMPONENTS.find((c) => c.ready)!.slug}`;

/** The GitHub repository that serves as the shadcn registry. */
export const REPO = "JanaSundar/ovio";

export const installCommand = (slug: string) => `npx shadcn add ${REPO}/${slug}`;
