/** What each live demo shows: real repos, people and packages picked for the richest data. */
export const DEMO_TARGETS = {
  "repository-card": "honojs/hono",
  "star-history": "shadcn-ui/ui",
  "top-contributors": "withastro/starlight",
  changelog: "tailwindlabs/tailwindcss",
  "contribution-graph": "yusukebe",
  "npm-downloads": "hono",
  "bundle-size": "sonner",
} as const;

export type LiveSlug = keyof typeof DEMO_TARGETS;

export const isLiveSlug = (slug: string): slug is LiveSlug => slug in DEMO_TARGETS;

export const demoUrl = (slug: LiveSlug) => `/api/demo/${slug}`;
