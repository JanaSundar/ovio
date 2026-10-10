/** How the catalogue is grouped on the homepage and in the gallery. */

import { COMPONENTS, type ComponentDoc } from "./components";

export const CATALOG_GROUPS = [
  { id: "activity", label: "Activity", blurb: "Work over time." },
  { id: "metrics", label: "Metrics", blurb: "Stars, installs, and size." },
  { id: "people", label: "People", blurb: "The humans behind a project." },
  { id: "identity", label: "Identity", blurb: "Cards, passes, and sponsors." },
  { id: "interactive", label: "Interactive", blurb: "Controls with real motion." },
  { id: "content", label: "Content", blurb: "Releases, status, and now." },
] as const;

export type CatalogGroupId = (typeof CATALOG_GROUPS)[number]["id"];

type CatalogMeta = { group: CatalogGroupId; glyph: string; pitch: string };

/** One entry per component. The gallery and the homepage both read this. */
export const CATALOG: Record<string, CatalogMeta> = {
  "contribution-graph": {
    group: "activity",
    glyph: "▦",
    pitch: "A year of activity, one cell per day.",
  },
  "git-branch-visualizer": {
    group: "activity",
    glyph: "⎇",
    pitch: "Branches and commits you can select.",
  },
  "star-history": {
    group: "metrics",
    glyph: "↗",
    pitch: "Stargazers over time, with a scrubber.",
  },
  "npm-downloads": {
    group: "metrics",
    glyph: "↓",
    pitch: "Weekly installs with a trend and a goal.",
  },
  "bundle-size": {
    group: "metrics",
    glyph: "▢",
    pitch: "Gzip, brotli, and the change from last version.",
  },
  "top-contributors": {
    group: "people",
    glyph: "◎",
    pitch: "Put project people in the foreground.",
  },
  "sponsor-wall": {
    group: "people",
    glyph: "▥",
    pitch: "Sponsors by tier, from a logo wall to a pegboard.",
  },
  "developer-id-card": {
    group: "identity",
    glyph: "▣",
    pitch: "Name, role, stack, availability, and a QR code.",
  },
  "event-ticket": {
    group: "identity",
    glyph: "✂",
    pitch: "Book it, tear the stub, flip it for the QR code.",
  },
  "gooey-tabs": {
    group: "interactive",
    glyph: "▤",
    pitch: "Tabs with a liquid indicator and a deploy status.",
  },
  "physical-knob": {
    group: "interactive",
    glyph: "◉",
    pitch: "A tactile control with genuine inertia.",
  },
  "repository-card": {
    group: "content",
    glyph: "◈",
    pitch: "The story behind a project at a glance.",
  },
  changelog: {
    group: "content",
    glyph: "≡",
    pitch: "Releases with dates and notes.",
  },
  "now-playing": {
    group: "content",
    glyph: "♪",
    pitch: "What you're listening to, with real controls.",
  },
  toast: {
    group: "content",
    glyph: "※",
    pitch: "Notifications, from a taped note to a terminal line.",
  },
};

export type CatalogItem = ComponentDoc & CatalogMeta;

/** Components in catalogue order, split by group. Groups with nothing in them are dropped. */
export function groupedCatalog() {
  return CATALOG_GROUPS.map((group) => ({
    ...group,
    items: COMPONENTS.filter((c) => CATALOG[c.slug]?.group === group.id).map((c): CatalogItem => ({
      ...c,
      ...CATALOG[c.slug],
    })),
  })).filter((group) => group.items.length > 0);
}
