import "server-only";

import { DEMO_TARGETS as T, DEMO_WEEKS, type LiveSlug } from "@/content/demo-sources";
import {
  getContributions,
  getContributors,
  getReleases,
  getRepository,
  getStarHistory,
} from "@/lib/github";
import { getBundleSizes, getWeeklyDownloads } from "@/lib/npm";

// Trimmed to what the demos show, so each response stays a few kilobytes.
export const DEMO_LOADERS = {
  "repository-card": () => getRepository(T["repository-card"]),
  "star-history": () => getStarHistory(T["star-history"]),
  "top-contributors": async () => (await getContributors(T["top-contributors"])).slice(0, 20),
  changelog: async () =>
    (await getReleases(T.changelog)).slice(0, 4).map((r) => ({ ...r, items: r.items.slice(0, 2) })),
  "contribution-graph": () => getContributions(T["contribution-graph"]),
  "npm-downloads": () => getWeeklyDownloads(T["npm-downloads"], DEMO_WEEKS),
  "bundle-size": async () => (await getBundleSizes(T["bundle-size"])).slice(0, 3),
} satisfies Record<LiveSlug, () => Promise<unknown>>;

export type DemoData = { [S in LiveSlug]: Awaited<ReturnType<(typeof DEMO_LOADERS)[S]>> };
