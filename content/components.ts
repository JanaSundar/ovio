/**
 * The component catalogue, typed from the COMPS array in the Docs mockup.
 * Props for built components describe the shipped API; the rest are carried over from the mockup
 * and are revised as each component lands.
 */

type PropDoc = { name: string; type: string; description: string };

/**
 * A playground control over one prop. A range bound can name another control, so a value stays
 * inside a range that is itself adjustable.
 */
export type Control =
  | { prop: string; type: "select"; options: readonly string[]; default: string }
  | { prop: string; type: "multi"; options: readonly string[]; default: readonly string[] }
  | {
      prop: string;
      type: "range";
      min: number | string;
      max: number | string;
      step?: number;
      default: number;
    };
export type ControlValue = string | number | readonly string[];
export type ControlValues = Record<string, ControlValue>;

export type ComponentDoc = {
  slug: string;
  name: string;
  /** What it is drawn with. */
  tech: string;
  description: string;
  /** Export name. */
  exportName: string;
  /** Fixed lines for the usage snippet, after `variant`; the playground's props follow them. */
  usage: string;
  /** Playground controls for the live preview. */
  controls?: Control[];
  props: PropDoc[];
  /** Build phase from the library code plan. */
  phase: 1 | 2 | 3;
  /** Whether the component ships in this build. */
  ready: boolean;
  /** Source files shown in the Code tab and shipped by the registry, relative to the repo root. */
  files: string[];
  /** npm packages the component installs. */
  dependencies: string[];
  /** Ovio registry items it pulls in. */
  registryDependencies: string[];
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
const ANIMATIONS = ["none", "enter-exit", "always"] as const;
const animation: Control = {
  prop: "animation",
  type: "select",
  options: ANIMATIONS,
  default: "enter-exit",
};
const range = (prop: string, min: number, max: number, def: number, step = 1): Control => ({
  prop,
  type: "range",
  min,
  max,
  step,
  default: def,
});
const CL: PropDoc = { name: "className", type: "string", description: "Merged onto the root." };

const worldFiles = (slug: string, extra: string[] = []) => [
  `components/ovio/${slug}/${slug}.tsx`,
  ...extra.map((f) => `components/ovio/${slug}/${f}`),
  ...["minimal", "craft", "retro", "toy"].map((w) => `components/ovio/${slug}/worlds/${w}.tsx`),
];

export const COMPONENTS: ComponentDoc[] = [
  {
    slug: "contribution-graph",
    name: "Contribution Graph",
    tech: "CSS grid · Motion for React (Toy: CSS 3D drum)",
    description:
      "A year of activity, one cell per day. From an editorial heatmap to a drum you can spin.",
    exportName: "ContributionGraph",
    usage: "  data={contributions}",
    controls: [animation],
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
          'Default "enter-exit". "always" adds the Retro flicker and the Toy wave. Forced to "none" under reduced motion.',
      },
      {
        name: "end",
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
    files: worldFiles("contribution-graph", ["year.ts", "grid.ts"]),
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number", "format"],
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
    files: [],
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
    controls: [
      {
        prop: "status",
        type: "select",
        options: ["offline", "building", "online"],
        default: "building",
      },
    ],
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
    files: worldFiles("gooey-tabs", ["goo.tsx"]),
    dependencies: ["motion"],
    registryDependencies: ["world", "motion", "theme", "keys"],
  },
  {
    slug: "star-history",
    name: "Star History",
    tech: "SVG · Motion for React path draw",
    description: "Stargazers over time, with annotated spikes.",
    exportName: "StarHistory",
    usage: "  data={stars}",
    controls: [animation],
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
    files: worldFiles("star-history", ["shape.ts", "use-scrubber.ts", "line-plot.tsx"]),
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number", "keys", "format"],
  },
  {
    slug: "repository-card",
    name: "Repository Card",
    tech: "CSS · Motion for React",
    description: "A repo at a glance: name, description, stars, forks and language.",
    exportName: "RepositoryCard",
    usage: "  repo={repo}",
    controls: [
      {
        prop: "stats",
        type: "multi",
        options: ["stars", "forks", "issues"],
        default: ["stars", "forks", "issues"],
      },
    ],
    props: [
      V,
      {
        name: "repo",
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
    files: worldFiles("repository-card"),
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number", "toy"],
  },
  {
    slug: "top-contributors",
    name: "Top Contributors",
    tech: "CSS · Motion for React",
    description: "The people behind a project, ranked by commits.",
    exportName: "TopContributors",
    usage: "  contributors={contributors}",
    controls: [
      range("limit", 1, 8, 6),
      { prop: "defaultPeriod", type: "select", options: ["30d", "90d", "all"], default: "90d" },
    ],
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
    files: worldFiles("top-contributors", ["avatar.tsx"]),
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number", "toy"],
  },
  {
    slug: "npm-downloads",
    name: "npm Downloads",
    tech: "CSS · SVG · Motion for React",
    description: "Weekly installs with trend and goal.",
    exportName: "NpmDownloads",
    usage: '  pkg="lumen"\n  data={downloads}',
    controls: [range("weeks", 4, 26, 12), range("goal", 10000, 80000, 50000, 5000)],
    props: [
      { name: "pkg", type: "string", description: "Package name." },
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
    files: worldFiles("npm-downloads"),
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number", "keys", "format"],
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
    files: [],
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
    usage: "  onChange={setLevel}",
    controls: [
      range("min", 0, 50, 0, 5),
      range("max", 60, 200, 100, 10),
      { prop: "defaultValue", type: "range", min: "min", max: "max", default: 72 },
    ],
    props: [
      V,
      {
        name: "value / defaultValue",
        type: "number",
        description: "Controlled value, or the starting one (72).",
      },
      { name: "min / max", type: "number", description: "Range, default 0–100." },
      { name: "onChange", type: "(value: number) => void", description: "Fires while turning." },
      { name: "label", type: "string", description: "Accessible name, printed on the dial." },
      CL,
    ],
    phase: 1,
    ready: true,
    files: worldFiles("physical-knob", ["use-knob.ts"]),
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number"],
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
    files: [],
    dependencies: ["motion", "uqr"],
    registryDependencies: ["world", "motion", "theme"],
  },
  {
    slug: "bundle-size",
    name: "Bundle Size",
    tech: "CSS · Motion for React",
    description: "Package size with gzip, brotli and the change from the previous version.",
    exportName: "BundleSize",
    usage: '  pkg="lumen"\n  versions={versions}',
    controls: [range("budget", 10, 60, 40)],
    props: [
      { name: "pkg", type: "string", description: "Package name." },
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
    files: worldFiles("bundle-size"),
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number", "toy", "keys"],
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
    files: [],
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
    controls: [range("limit", 1, 4, 4)],
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
    files: worldFiles("changelog"),
    dependencies: ["motion"],
    registryDependencies: ["world", "motion", "theme", "toy", "format"],
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
    files: [],
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number"],
  },
];

export const getComponent = (slug: string) => COMPONENTS.find((c) => c.slug === slug);

/** Where "Docs" links land: the first built component. /docs redirects here too. */
export const DOCS_HREF = `/docs/${COMPONENTS.find((c) => c.ready)!.slug}`;

export const installCommand = (slug: string) => `npx shadcn add @ovio/${slug}`;
