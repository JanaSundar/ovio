import "server-only";

import type { BundleVersion } from "@/components/ovio/bundle-size/types";
import type { DownloadWeek } from "@/components/ovio/npm-downloads/types";
import { isoDate } from "@/lib/format";
import { fetchJson, type FetchOptions } from "@/lib/ovio-fetch";

/**
 * Server-side npm fetchers: download counts from the npm registry API and bundle sizes from
 * bundlephobia. Both are public and keyless; cache the result.
 */

const DAY = 86_400_000;
/** Midnight UTC of the Monday on or before a time. */
const mondayOf = (time: number) =>
  Date.parse(isoDate(time)) - ((new Date(time).getUTCDay() + 6) % 7) * DAY;

type RangeResponse = { downloads: { day: string; downloads: number }[] };

/**
 * Weekly downloads for <NpmDownloads data={...} />, oldest first. Weeks run Monday to Sunday
 * (UTC) and are labelled by their Monday; the current, partial week is left out, as is any
 * week npm has not reported in full yet. npm serves at most 18 months, about 78 weeks.
 */
export async function getWeeklyDownloads(
  packageName: string,
  weeks = 26,
  options?: FetchOptions,
): Promise<DownloadWeek[]> {
  const monday = mondayOf(Date.now());
  const start = isoDate(monday - weeks * 7 * DAY);
  const end = isoDate(monday - DAY);
  const { downloads } = await fetchJson<RangeResponse>(
    `https://api.npmjs.org/downloads/range/${start}:${end}/${packageName}`,
    options,
  );

  const byWeek = new Map<string, { downloads: number; days: number }>();
  for (const { day, downloads: n } of downloads) {
    const week = isoDate(mondayOf(Date.parse(day)));
    const sum = byWeek.get(week) ?? { downloads: 0, days: 0 };
    byWeek.set(week, { downloads: sum.downloads + n, days: sum.days + 1 });
  }
  return [...byWeek]
    .filter(([, w]) => w.days === 7)
    .map(([week, w]) => ({ week, downloads: w.downloads }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

type BundlephobiaSize = {
  version?: string;
  size?: number;
  gzip?: number;
  dependencyCount?: number;
};

const measured = (version: string, s: BundlephobiaSize): BundleVersion[] =>
  s.size && s.gzip ? [{ version, raw: s.size, gzip: s.gzip, dependencies: s.dependencyCount }] : [];

/** Orders "1.10.0" after "1.9.2", and a prerelease before its release. */
function compareVersions(a: string, b: string) {
  const [coreA, preA] = a.split("-", 2);
  const [coreB, preB] = b.split("-", 2);
  const partsA = coreA.split(".").map(Number);
  const partsB = coreB.split(".").map(Number);
  for (let i = 0; i < 3; i++)
    if (partsA[i] !== partsB[i]) return (partsA[i] ?? 0) - (partsB[i] ?? 0);
  if (!preA !== !preB) return preA ? -1 : 1;
  return (preA ?? "").localeCompare(preB ?? "", "en", { numeric: true });
}

type BundlephobiaHistory = { versions?: (BundlephobiaSize & { version: string })[] };

/**
 * Minified and gzipped sizes (bytes) from bundlephobia for <BundleSize versions={...} />, newest
 * first. Pass `versions` to measure those, in that order; leave it out for the versions in
 * bundlephobia's history. Versions bundlephobia could not build are skipped. Bundlephobia does not
 * measure brotli, so that row stays hidden. It allows only a few requests in a burst, and
 * `versions` costs one request each, so the history (one request) is the safer choice.
 */
export async function getBundleSizes(
  packageName: string,
  versions?: string[],
  options?: FetchOptions,
): Promise<BundleVersion[]> {
  const api = "https://bundlephobia.com/api";
  if (versions) {
    const sizes: BundleVersion[] = [];
    for (const v of versions) {
      const s = await fetchJson<BundlephobiaSize>(
        `${api}/size?package=${encodeURIComponent(`${packageName}@${v}`)}`,
        options,
      );
      sizes.push(...measured(v, s));
    }
    return sizes;
  }
  const { versions: history = [] } = await fetchJson<BundlephobiaHistory>(
    `${api}/package-history?package=${encodeURIComponent(packageName)}`,
    options,
  );
  return history
    .sort((a, b) => compareVersions(b.version, a.version))
    .flatMap((s) => measured(s.version, s));
}
