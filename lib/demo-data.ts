import "server-only";

import { DEMO_TARGETS as T, DEMO_WEEKS, type LiveSlug } from "@/content/demo-sources";
import {
  getCommitGraph,
  getContributions,
  getContributors,
  getReleases,
  getRepository,
} from "@/lib/github";
import { getNowPlaying, lastfm, spotify } from "@/lib/music";
import { getBundleSizes, getWeeklyDownloads } from "@/lib/npm";

// Trimmed to what the demos show, so each response stays a few kilobytes.
export const DEMO_LOADERS = {
  "repository-card": () => getRepository(T["repository-card"]),
  "top-contributors": async () => (await getContributors(T["top-contributors"])).slice(0, 20),
  changelog: async () =>
    (await getReleases(T.changelog)).slice(0, 4).map((r) => ({ ...r, items: r.items.slice(0, 2) })),
  "contribution-graph": () => getContributions(T["contribution-graph"]),
  "npm-downloads": () => getWeeklyDownloads(T["npm-downloads"], DEMO_WEEKS),
  "bundle-size": async () => (await getBundleSizes(T["bundle-size"])).slice(0, 3),
  "git-branch-visualizer": () => getCommitGraph(T["git-branch-visualizer"]),
  // Whichever service has credentials in the environment.
  "now-playing": async () => {
    const now = await getNowPlaying([spotify(), lastfm()]);
    if (!now) throw new Error("Nothing played yet");
    return now;
  },
} satisfies Record<LiveSlug, () => Promise<unknown>>;

export type DemoData = { [S in LiveSlug]: Awaited<ReturnType<(typeof DEMO_LOADERS)[S]>> };

/**
 * A demo's data as a response. A failure answers null, cached like data, so a failing API is asked
 * once per cache window rather than on every visit, and the demo shows its sample meanwhile.
 */
export async function demoResponse(slug: LiveSlug) {
  try {
    return Response.json(await DEMO_LOADERS[slug]());
  } catch (e) {
    console.warn(`/api/demo/${slug}: ${e instanceof Error ? e.message : e}`);
    return Response.json(null);
  }
}
