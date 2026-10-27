import { COMPONENTS, type ComponentDoc } from "../components";
import { NEW_DOCS } from "./new-docs";
import type { CategoryId, CollectionId, Distribution, InteractionDefinition } from "./types";

export * from "./types";

/** What the registry adds to a component's docs: purpose, tags, collections and reach. */
type Listing = {
  categories: CategoryId[];
  tags: string[];
  collections: Exclude<CollectionId, "new">[];
  added: string;
  featured?: boolean;
};

const REGISTRY: Distribution = { kind: "registry" };

/** Source-only interactions: their files and the packages those files import. */
const source = (slug: string, files: string[]): Distribution => ({
  kind: "source",
  files: [...files.map((f) => `components/interactions/${slug}/${f}`), "lib/utils.ts"],
  dependencies: ["motion", "clsx", "tailwind-merge"],
});

/**
 * Every interaction, in Recommended order. Dates are from the commit that added each one.
 * Every implementation here is web only: none has an Expo version yet.
 */
const LISTINGS: [slug: string, listing: Listing, distribution?: Distribution][] = [
  [
    "fluid-range-slider",
    {
      categories: ["selection", "direct-manipulation"],
      tags: ["slider", "range", "spring"],
      collections: ["essential", "showcase"],
      added: "2026-10-27",
      featured: true,
    },
    source("fluid-range-slider", ["fluid-range-slider.tsx", "range.ts"]),
  ],
  [
    "liquid-magnifier",
    {
      categories: ["reveal-explore", "direct-manipulation"],
      tags: ["lens", "zoom", "drag"],
      collections: ["showcase"],
      added: "2026-10-22",
      featured: true,
    },
  ],
  [
    "context-menu",
    {
      categories: ["contextual-actions"],
      tags: ["menu", "right-click", "keyboard"],
      collections: ["essential"],
      added: "2026-10-27",
      featured: true,
    },
    source("context-menu", ["context-menu.tsx", "menu.ts"]),
  ],
  [
    "contribution-graph",
    {
      categories: ["data-visualization"],
      tags: ["github", "heatmap", "activity"],
      collections: ["developer-tools"],
      added: "2026-10-07",
      featured: true,
    },
  ],
  [
    "peel-to-reveal",
    {
      categories: ["reveal-explore", "direct-manipulation"],
      tags: ["sticker", "drag", "reveal"],
      collections: ["showcase"],
      added: "2026-10-27",
      featured: true,
    },
    source("peel-to-reveal", ["peel-to-reveal.tsx", "peel.ts"]),
  ],
  [
    "physical-knob",
    {
      categories: ["direct-manipulation", "selection"],
      tags: ["knob", "rotary", "inertia"],
      collections: ["essential", "showcase"],
      added: "2026-10-07",
      featured: true,
    },
  ],
  [
    "repository-card",
    {
      categories: ["surfaces-layout", "feedback"],
      tags: ["github", "card", "stars"],
      collections: ["developer-tools"],
      added: "2026-10-07",
    },
  ],
  [
    "event-ticket",
    {
      categories: ["surfaces-layout", "feedback"],
      tags: ["ticket", "tear", "flip"],
      collections: ["showcase"],
      added: "2026-10-08",
      featured: true,
    },
  ],
  [
    "changelog",
    {
      categories: ["surfaces-layout"],
      tags: ["releases", "timeline", "github"],
      collections: ["developer-tools"],
      added: "2026-10-07",
    },
  ],
  [
    "top-contributors",
    {
      categories: ["data-visualization", "surfaces-layout"],
      tags: ["github", "people", "ranking"],
      collections: ["developer-tools"],
      added: "2026-10-07",
    },
  ],
  [
    "star-history",
    {
      categories: ["data-visualization"],
      tags: ["github", "chart", "scrub"],
      collections: ["developer-tools"],
      added: "2026-10-07",
    },
  ],
  [
    "npm-downloads",
    {
      categories: ["data-visualization"],
      tags: ["npm", "chart", "weekly"],
      collections: ["developer-tools"],
      added: "2026-10-07",
    },
  ],
  [
    "sponsor-wall",
    {
      categories: ["surfaces-layout"],
      tags: ["sponsors", "tiers", "grid"],
      collections: ["developer-tools"],
      added: "2026-10-08",
    },
  ],
  [
    "testimonials",
    {
      categories: ["surfaces-layout", "navigation"],
      tags: ["carousel", "swipe", "quotes"],
      collections: ["essential"],
      added: "2026-10-27",
    },
    source("testimonials", ["testimonials.tsx"]),
  ],
  [
    "dial-menu",
    {
      categories: ["contextual-actions", "navigation"],
      tags: ["radial", "right-click", "menu"],
      collections: ["showcase"],
      added: "2026-10-24",
      featured: true,
    },
  ],
  [
    "scratch-to-reveal",
    {
      categories: ["reveal-explore", "direct-manipulation"],
      tags: ["scratch", "canvas", "reveal"],
      collections: ["showcase"],
      added: "2026-10-23",
    },
  ],
  [
    "compare-slider",
    {
      categories: ["reveal-explore", "direct-manipulation"],
      tags: ["before-after", "drag", "compare"],
      collections: ["essential"],
      added: "2026-10-14",
    },
  ],
  [
    "liquid-tabs",
    {
      categories: ["navigation", "selection"],
      tags: ["tabs", "goo", "status"],
      collections: ["essential"],
      added: "2026-10-11",
    },
  ],
  [
    "letter",
    {
      categories: ["surfaces-layout", "feedback"],
      tags: ["newsletter", "subscribe", "form"],
      collections: ["showcase"],
      added: "2026-10-12",
    },
  ],
  [
    "toast",
    {
      categories: ["feedback"],
      tags: ["toast", "notification", "sonner"],
      collections: ["essential"],
      added: "2026-10-09",
    },
  ],
  [
    "now-playing",
    {
      categories: ["surfaces-layout", "direct-manipulation"],
      tags: ["music", "player", "scrub"],
      collections: ["showcase"],
      added: "2026-10-08",
    },
  ],
  [
    "developer-id-card",
    {
      categories: ["surfaces-layout"],
      tags: ["profile", "qr", "card"],
      collections: ["showcase"],
      added: "2026-10-08",
    },
  ],
  [
    "git-branch-visualizer",
    {
      categories: ["data-visualization", "navigation"],
      tags: ["git", "graph", "commits"],
      collections: ["developer-tools"],
      added: "2026-10-08",
    },
  ],
  [
    "bundle-size",
    {
      categories: ["data-visualization"],
      tags: ["npm", "size", "budget"],
      collections: ["developer-tools"],
      added: "2026-10-07",
    },
  ],
];

const DOCS = new Map<string, ComponentDoc>([...COMPONENTS, ...NEW_DOCS].map((d) => [d.slug, d]));

export type Interaction = InteractionDefinition & { doc: ComponentDoc };

export const INTERACTIONS: Interaction[] = LISTINGS.map(
  ([slug, listing, distribution = REGISTRY], rank) => {
    const doc = DOCS.get(slug);
    if (!doc) throw new Error(`No docs for interaction "${slug}"`);
    return {
      slug,
      name: doc.name,
      description: doc.description,
      exportName: doc.exportName,
      tech: doc.tech,
      platforms: ["web"],
      rank,
      styles: distribution.kind === "registry",
      distribution,
      isNew: !!doc.isNew,
      ...listing,
      doc,
    };
  },
);

export const getInteraction = (slug: string) => INTERACTIONS.find((i) => i.slug === slug);

/** Where an interaction's page is. */
export const interactionHref = (slug: string) => `/registry/components/${slug}`;

/** Where the component file lands in a project: the registry's folder, or this repo's for source-only ones. */
export const importPathOf = (item: InteractionDefinition) =>
  `@/components/${item.distribution.kind === "registry" ? "ovio" : "interactions"}/${item.slug}/${item.slug}`;
