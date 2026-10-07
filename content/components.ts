/**
 * The component catalogue, typed from the COMPS array in the Docs mockup.
 * Props for built components describe the shipped API; the rest are carried over from the mockup
 * and are revised as each component lands.
 */

export type PropDoc = { name: string; type: string; description: string };

export type ComponentDoc = {
  slug: string;
  name: string;
  tag?: "flagship" | "new" | "motion";
  /** What it is drawn with. */
  tech: string;
  description: string;
  /** Export name. */
  exportName: string;
  /** Extra lines for the usage snippet, after `variant`. */
  usage: string;
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
    tag: "flagship",
    tech: "CSS grid · Motion for React (Toy: CSS 3D blocks)",
    description:
      "A year of activity, one cell per day. From an editorial heatmap to physical blocks you can press.",
    exportName: "ContributionGraph",
    usage: "  data={contributions}",
    props: [
      {
        name: "data",
        type: "{ date: string; count: number }[]",
        description: "Daily counts; gaps become zero.",
      },
      V,
      A,
      { name: "onDayHover", type: "(day) => void", description: "Hover and keyboard focus." },
      CL,
    ],
    phase: 2,
    ready: false,
    files: [],
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number"],
  },
  {
    slug: "event-ticket",
    name: "Event Ticket",
    tag: "new",
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
    tag: "motion",
    tech: "SVG goo filter · Motion for React (Toy: spring drag)",
    description:
      "A tab bar with a moving indicator and a deploy status. In Toy, the indicator is a piece you can drag and flick.",
    exportName: "GooeyTabs",
    usage: '  tabs={["Overview", "Commits", "Issues", "Releases"]}\n  status="building"',
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
    registryDependencies: ["world", "motion", "theme"],
  },
  {
    slug: "star-history",
    name: "Star History",
    tech: "SVG · Motion for React path draw",
    description: "Stargazers over time, with annotated spikes.",
    exportName: "StarHistory",
    usage: "  data={stars}",
    props: [
      V,
      {
        name: "data",
        type: "{ date: string; stars: number }[]",
        description: "Cumulative stars by day.",
      },
      { name: "annotations", type: "{ date; label }[]", description: "Callouts on the curve." },
      A,
    ],
    phase: 2,
    ready: false,
    files: [],
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number"],
  },
  {
    slug: "repository-card",
    name: "Repository Card",
    tech: "CSS · Motion for React",
    description: "A repo at a glance: name, description, stars, forks and language.",
    exportName: "RepositoryCard",
    usage: "  repo={repo}",
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
    usage: "  contributors={contributors}\n  limit={6}",
    props: [
      V,
      {
        name: "contributors",
        type: "{ login; avatar; commits }[]",
        description: "Ranked by commits.",
      },
      { name: "limit", type: "number", description: "Max people shown." },
      { name: "period", type: '"30d" | "90d" | "all"', description: "Time window." },
    ],
    phase: 2,
    ready: false,
    files: [],
    dependencies: ["motion"],
    registryDependencies: ["world", "motion", "theme"],
  },
  {
    slug: "npm-downloads",
    name: "npm Downloads",
    tech: "CSS · SVG · Motion for React",
    description: "Weekly installs with trend and goal.",
    exportName: "NpmDownloads",
    usage: '  pkg="lumen"\n  data={downloads}\n  goal={50000}',
    props: [
      V,
      { name: "pkg", type: "string", description: "Package name." },
      {
        name: "data",
        type: "{ week: string; downloads: number }[]",
        description: "Weekly history.",
      },
      { name: "goal", type: "number", description: "Weekly target." },
    ],
    phase: 2,
    ready: false,
    files: [],
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number"],
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
    tag: "new",
    tech: "CSS · Motion for React (spring, drag, inertia)",
    description:
      "A rotary control with tick marks and a value display. Drag, flick, scroll or use the arrow keys.",
    exportName: "PhysicalKnob",
    usage: "  value={level}\n  onChange={setLevel}",
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
    tag: "new",
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
    tag: "new",
    tech: "CSS · Motion for React",
    description: "Package size with gzip, brotli and the change from the previous version.",
    exportName: "BundleSize",
    usage: '  pkg="lumen"\n  versions={versions}',
    props: [
      V,
      { name: "pkg", type: "string", description: "Package name." },
      { name: "versions", type: "{ version; raw; gzip; brotli }[]", description: "Newest first." },
      { name: "budget", type: "number", description: "Budget in kB." },
    ],
    phase: 2,
    ready: false,
    files: [],
    dependencies: ["motion", "@number-flow/react"],
    registryDependencies: ["world", "motion", "theme", "rolling-number"],
  },
  {
    slug: "git-branch-visualizer",
    name: "Git Branch Visualizer",
    tag: "new",
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
    props: [
      V,
      {
        name: "releases",
        type: "{ version; date; title; items[] }[]",
        description: "Newest first.",
      },
      { name: "limit", type: "number", description: "Releases shown." },
      CL,
    ],
    phase: 2,
    ready: false,
    files: [],
    dependencies: ["motion"],
    registryDependencies: ["world", "motion", "theme"],
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

export const installCommand = (slug: string) => `npx shadcn add @ovio/${slug}`;
