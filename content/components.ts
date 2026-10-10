/** The component catalogue. */

import { EMBEDS } from "../lib/embed/params";
import { WORLDS } from "../lib/world";

type PropDoc = {
  name: string;
  type: string;
  description: string;
  /** The value used when the prop is left out, when it is a single value. */
  default?: string;
};

/** Where an API-backed component's data comes from, for its docs page. */
type DataDoc = {
  /** The data helper's registry item, which is also its file: lib/<lib>.ts. */
  lib: "github" | "npm" | "music";
  helper: string;
  source: string;
  auth: string;
  limits: string;
  /** Replaces the shared hour-long caching note. */
  caching?: string;
};

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
  data?: DataDoc;
};

const TOKEN_OPTIONAL =
  "Optional. GITHUB_TOKEN (or { token }) raises the limit from 60 to 5,000 requests an hour.";

const union = (values: readonly string[]) => values.map((v) => `"${v}"`).join(" | ");
const WORLDS_TYPE = union(WORLDS);
const ANIMATION_TYPE = union(["none", "enter-exit", "always"]);
const V: PropDoc = {
  name: "variant",
  type: WORLDS_TYPE,
  description: "Which world to render. Uses the nearest OvioProvider when there is one.",
  default: "minimal",
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
        type: ANIMATION_TYPE,
        description:
          '"always" adds the Retro flicker and roll bar. Forced to "none" under reduced motion.',
        default: "enter-exit",
      },
      {
        name: "endDate",
        type: "string",
        description: "Last day shown. Defaults to the latest date in data.",
      },
      {
        name: "compactMonths",
        type: "number",
        description:
          "Months shown on screens under 1024px so cells stay large. Left out, the full year scrolls sideways there. Toy always shows the year.",
      },
      {
        name: "onDayHover",
        type: "(day: ContributionCell | null) => void",
        description: "Hover and keyboard focus; null when they leave.",
      },
      CL,
    ],
    data: {
      lib: "github",
      helper: "getContributions(login)",
      source: "GitHub's GraphQL API: the contribution calendar on a user's profile.",
      auth: "Required. GraphQL rejects anonymous requests; any GITHUB_TOKEN works.",
      limits: "One query per refresh, against 5,000 points an hour per token.",
    },
  },
  {
    slug: "event-ticket",
    name: "Event Ticket",
    tech: "SVG · CSS 3D · Motion for React",
    description:
      "A pass for launches and conferences. Book on the stub, tear it to check in, flip it for the QR code.",
    exportName: "EventTicket",
    usage: "  event={event}\n  onBook={reserve}\n  onTear={checkIn}",
    props: [
      {
        name: "event",
        type: "{ name; date; venue?; title?; description?; tier?; price?; schedule? }",
        description: "Printed on the ticket. The schedule goes on the back.",
      },
      V,
      {
        name: "layout",
        type: '"horizontal" | "vertical"',
        description: "Side stub or tear-off bottom. Horizontal turns vertical below 600px.",
      },
      {
        name: "ticketId",
        type: "string",
        description: "Printed on the stub and encoded in the QR code.",
      },
      {
        name: "defaultAttendee",
        type: "{ name; email }",
        description: "Starts the ticket already booked.",
      },
      {
        name: "onBook",
        type: "(attendee) => Promise<void>",
        description: "The book button waits on it; a rejection shows its message.",
      },
      {
        name: "onTear",
        type: "(attendee | null) => void",
        description: "Fires when the stub is dragged off, booked or not.",
      },
      {
        name: "flipped / defaultFlipped",
        type: "boolean",
        description: "QR side showing, controlled or not.",
      },
      {
        name: "onFlippedChange",
        type: "(flipped: boolean) => void",
        description: "Fires when the ticket flips.",
      },
      CL,
    ],
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
      { name: "goo", type: "number", description: "Blur strength of the filter.", default: "9" },
      CL,
    ],
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
        type: ANIMATION_TYPE,
        description:
          '"always" keeps a live marker on the latest point. Forced to "none" under reduced motion.',
        default: "enter-exit",
      },
      CL,
    ],
    data: {
      lib: "github",
      helper: 'getStarHistory("owner/name")',
      source: "GitHub's REST API: stargazers with the time each star was given.",
      auth: "The repository owner's token. GitHub lists stargazers only to the owner, so you can chart your own repos but not someone else's.",
      limits:
        "Up to 16 requests per refresh: the repo, then 15 pages of 100 stargazers, sampled evenly. GitHub serves at most 400 pages.",
    },
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
    data: {
      lib: "github",
      helper: 'getRepository("owner/name")',
      source: "GitHub's REST API: the repository.",
      auth: TOKEN_OPTIONAL,
      limits: "One request per refresh.",
    },
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
      { name: "limit", type: "number", description: "Max people shown.", default: "6" },
      {
        name: "period / defaultPeriod",
        type: '"30d" | "90d" | "all"',
        description: "Time window, controlled or not.",
        default: "90d",
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
    data: {
      lib: "github",
      helper: 'getContributors("owner/name")',
      source:
        "GitHub's REST API: weekly commit stats per contributor, for the 30-day, 90-day and all-time windows. Bots are left out.",
      auth: TOKEN_OPTIONAL,
      limits:
        "One request, or up to four: GitHub answers 202 while it computes the stats, so the helper retries, then falls back to all-time counts.",
    },
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
      { name: "weeks", type: "number", description: "Latest weeks shown.", default: "12" },
      { name: "goal", type: "number", description: "Weekly target. Hidden when left out." },
      CL,
    ],
    data: {
      lib: "npm",
      helper: "getWeeklyDownloads(packageName, weeks)",
      source:
        "The npm registry's downloads API, summed into Monday-to-Sunday weeks. The current, partial week is left out.",
      auth: "None.",
      limits: "One request per refresh. npm serves up to 18 months, about 78 weeks.",
    },
  },
  {
    slug: "sponsor-wall",
    name: "Sponsor Wall",
    tech: "CSS · Motion for React (layout)",
    description: "Sponsors by tier, from a logo wall to blocks on a pegboard.",
    exportName: "SponsorWall",
    usage: '  sponsors={sponsors}\n  ctaHref="https://github.com/sponsors/ada-dev"',
    props: [
      {
        name: "sponsors",
        type: '{ name; tier: "platinum" | "gold" | "backer"; url? }[]',
        description: "Tier decides size; url makes the name a link.",
      },
      V,
      {
        name: "ctaHref",
        type: "string",
        description: "Become-a-sponsor link. Hidden when left out.",
      },
      { name: "ctaLabel", type: "string", description: "Link text.", default: "Become a sponsor" },
      CL,
    ],
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
      {
        name: "min / max",
        type: "number",
        description: "The range of values.",
        default: "0 / 100",
      },
      {
        name: "onValueChange",
        type: "(value: number) => void",
        description: "Fires while turning.",
      },
      { name: "label", type: "string", description: "Accessible name, printed on the dial." },
      CL,
    ],
  },
  {
    slug: "developer-id-card",
    name: "Developer ID Card",
    tech: "SVG · Motion for React (hover)",
    description: "An identity card for a developer: name, role, stack, availability and a QR code.",
    exportName: "DeveloperIdCard",
    usage:
      '  name="Ada Park"\n  title="Senior Software Engineer"\n  stack={["React", "TypeScript", "Node"]}\n  github="ada-dev"\n  available',
    props: [
      { name: "name", type: "string", description: "Printed name." },
      V,
      { name: "title", type: "string", description: "Job title." },
      { name: "stack", type: "string[]", description: "Technologies, most important first." },
      {
        name: "github",
        type: "string",
        description: "GitHub handle without the @. The QR code opens this profile.",
      },
      { name: "url", type: "string", description: "What the QR code opens instead." },
      { name: "website", type: "string", description: "Personal site, printed without https." },
      { name: "location", type: "string", description: 'For example "Chennai, India".' },
      {
        name: "available",
        type: "boolean",
        description: "Open to work. The status is hidden when left out.",
      },
      { name: "avatarUrl", type: "string", description: "Photo. Initials show without it." },
      { name: "serial", type: "string", description: 'Card number, e.g. "024".' },
      { name: "since", type: "number", description: "Year they started, printed in Craft." },
      CL,
    ],
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
    data: {
      lib: "npm",
      helper: "getBundleSizes(packageName, versions?)",
      source:
        "bundlephobia, an unofficial service: minified and gzipped sizes. It doesn't measure brotli.",
      auth: "None.",
      limits:
        "bundlephobia answers 429 after a few quick requests. Leave out versions to read its history in one request; each listed version costs one.",
    },
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
      {
        name: "commits",
        type: "{ id; branch; message; author; date; parents?; tag? }[]",
        description: "History, oldest first. Two parents make a merge; tag draws a release label.",
      },
      V,
      {
        name: "head",
        type: "string",
        description: "Checked-out branch. Defaults to the first commit's branch.",
      },
      { name: "repo", type: "string", description: 'Header label, e.g. "ada-dev/lumen".' },
      {
        name: "value / defaultValue",
        type: "string",
        description: "Selected commit id, controlled or not. Defaults to the newest.",
      },
      {
        name: "onValueChange",
        type: "(id: string, commit) => void",
        description: "Fires when the selected commit changes.",
      },
      {
        name: "actions",
        type: "boolean",
        description: "Shows Merge, Branch from and Reset, played out locally.",
        default: "true",
      },
      { name: "onMerge", type: "(commit) => void", description: "Fires with the merge commit." },
      {
        name: "onBranch",
        type: "(branch: string, from) => void",
        description: "Fires with the new branch and the commit it starts from.",
      },
      CL,
    ],
    data: {
      lib: "github",
      helper: 'getCommitGraph("owner/name", { limit })',
      source:
        "GitHub's GraphQL API: the default branch's last 100 commits with their parents. The newest merges are kept with every commit their branch brought in, up to limit (14); commits pushed straight to the default branch between them are skipped so the branches fit. Merged branches keep the name their merge commit records.",
      auth: "Required. GraphQL rejects anonymous requests; any GITHUB_TOKEN works.",
      limits: "One query per refresh, against 5,000 points an hour per token.",
    },
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
    data: {
      lib: "github",
      helper: 'getReleases("owner/name")',
      source:
        "GitHub's REST API: the 30 latest releases. Bullet lines become notes, tagged added, fixed or changed by their heading or first word.",
      auth: TOKEN_OPTIONAL,
      limits: "One request per refresh.",
    },
  },
  {
    slug: "now-playing",
    name: "Now Playing",
    tech: "CSS · Motion for React",
    description: "What you're listening to, live. Play, pause, seek and turn it up.",
    exportName: "NowPlaying",
    usage: "  track={track}",
    props: [
      {
        name: "track",
        type: "{ title; artist; album?; duration; artwork? }",
        description: "Current track. duration in seconds; artwork is a cover image URL.",
      },
      V,
      {
        name: "playing / defaultPlaying",
        type: "boolean",
        description: "Playing state, controlled or not.",
        default: "true",
      },
      {
        name: "onPlayingChange",
        type: "(playing: boolean) => void",
        description: "Play or pause.",
      },
      {
        name: "progress / defaultProgress",
        type: "number",
        description: "Seconds elapsed. Ticks once a second while playing.",
      },
      {
        name: "onProgressChange",
        type: "(progress: number) => void",
        description: "Fires on each tick and seek.",
      },
      {
        name: "volume / defaultVolume",
        type: "number",
        description: "0–10. Turned with the Toy knob.",
        default: "6",
      },
      { name: "onVolumeChange", type: "(volume: number) => void", description: "Volume changed." },
      {
        name: "onPrevious / onNext",
        type: "() => void",
        description: "Transport keys. onNext also fires when the track ends.",
      },
      CL,
    ],
    data: {
      lib: "music",
      helper: "getNowPlaying([spotify(), lastfm()])",
      source:
        "Any music service: the first attached one answers with what's playing, or what played last. Spotify and Last.fm come ready-made; musicService({ name, url, map }) adapts any other JSON API.",
      auth: "Per service, read from the environment. Spotify: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN. Last.fm: LASTFM_API_KEY and LASTFM_USER. A service without them is skipped.",
      limits:
        "Spotify: a token and one or two calls per refresh, with the token reused for 50 minutes. Last.fm: two calls.",
      caching:
        "Cached for 30 seconds by default, since what's playing changes by the minute. A spent limit throws RateLimitError with the time it resets.",
    },
  },
  {
    slug: "toast",
    name: "Toast",
    tech: "Sonner · CSS (Toy: spring keys)",
    description:
      "Notifications in every world: a clean card, a taped note, a terminal line, a plastic slab. Call ovioToast from anywhere.",
    exportName: "OvioToaster",
    usage: '  position="bottom-right"',
    props: [
      V,
      {
        name: "position",
        type: '"top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"',
        description: "Corner the toasts stack in.",
        default: "bottom-right",
      },
      {
        name: "ovioToast.success / error / info",
        type: "(title, { description?, action?, duration?, id? }) => id",
        description:
          "Shows a toast in the toaster's world. Errors stay 8s, others 4s. Pressing the action also dismisses it; reusing an id replaces that toast.",
      },
      {
        name: "ovioToast.dismiss",
        type: "(id?) => void",
        description: "Dismisses one toast, or all of them.",
      },
      {
        name: "…ToasterProps",
        type: "Sonner",
        description:
          "Other Sonner Toaster props (duration, gap, offset, expand, hotkey) pass through.",
      },
    ],
  },
];

export const getComponent = (slug: string) => COMPONENTS.find((c) => c.slug === slug);

/** Where "Docs" links land: the first component. /docs redirects here too. */
export const DOCS_HREF = `/docs/${COMPONENTS[0].slug}`;

/** Where the site is served, for links that leave it (README embeds, share images). */
export const SITE_URL = "https://ovioui.vercel.app";

/** The GitHub repository that serves as the shadcn registry. */
export const REPO = "JanaSundar/ovio";

/** Where the code lives, and who made it. */
export const GITHUB_URL = `https://github.com/${REPO}`;
export const AUTHOR_URL = "https://github.com/JanaSundar";

export const installCommand = (slug: string) => `npx shadcn add ${REPO}/${slug}`;

/** "07": catalogue numbers and counts are printed two digits wide. */
export const pad2 = (n: number) => String(n).padStart(2, "0");

/** The sections of a component's docs page, in order, for the page and its "On this page" list. */
export const DOC_SECTIONS = [
  { id: "preview", label: "Preview" },
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Usage" },
  { id: "data", label: "Data" },
  { id: "embed", label: "Readme embed" },
  { id: "props", label: "Props" },
] as const;

export type DocSectionId = (typeof DOC_SECTIONS)[number]["id"];

/** A page's sections: Data only on components that fetch real data, README embed where one exists. */
export const docSections = (slug: string) =>
  DOC_SECTIONS.filter(
    (s) => (s.id !== "data" || getComponent(slug)?.data) && (s.id !== "embed" || slug in EMBEDS),
  );
