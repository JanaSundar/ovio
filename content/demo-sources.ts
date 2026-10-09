/** What each live demo shows: real repos, people and packages picked for the richest data. */
export const DEMO_TARGETS = {
  "repository-card": "honojs/hono",
  "top-contributors": "withastro/starlight",
  changelog: "tailwindlabs/tailwindcss",
  "contribution-graph": "shadcn",
  "npm-downloads": "hono",
  "bundle-size": "sonner",
} as const;

/** npm Downloads shows 12 weeks, plus the one before them that the first week's change needs. */
export const DEMO_WEEKS = 13;

export type LiveSlug = keyof typeof DEMO_TARGETS;

export const isLiveSlug = (slug: string): slug is LiveSlug => slug in DEMO_TARGETS;

export const demoUrl = (slug: LiveSlug) => `/api/demo/${slug}`;
