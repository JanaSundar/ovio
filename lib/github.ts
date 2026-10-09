import "server-only";

import type { Release, ChangelogItem, ChangeType } from "@/components/ovio/changelog/changelog";
import type { ContributionDay } from "@/components/ovio/contribution-graph/contribution-graph";
import type { Repository } from "@/components/ovio/repository-card/repository-card";
import type { StarHistoryPoint } from "@/components/ovio/star-history/star-history";
import type { Contributor } from "@/components/ovio/top-contributors/top-contributors";
import { isoDate } from "@/lib/format";
import {
  fetchOk,
  HttpError,
  RateLimitError,
  resetTime,
  type FetchOptions as BaseOptions,
  type RequestOptions,
} from "@/lib/ovio-fetch";

/**
 * Server-side GitHub fetchers. Unauthenticated GitHub allows 60 requests an hour per IP,
 * so pass a token (GITHUB_TOKEN) in production and cache the result.
 */

type FetchOptions = BaseOptions & { token?: string };

/** The raw response, for callers that need headers or a 202. Throws on any other status. */
function ghResponse(
  path: string,
  { token = process.env.GITHUB_TOKEN, ...options }: FetchOptions = {},
  { headers, ...init }: RequestOptions = {},
) {
  return fetchOk(`https://api.github.com${path}`, options, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
}

async function gh<T>(path: string, options?: FetchOptions, init?: RequestOptions) {
  return (await (await ghResponse(path, options, init)).json()) as T;
}

type RepoResponse = {
  name: string;
  owner: { login: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  html_url: string;
};

/** Repository data for <RepositoryCard repository={...} />, from "owner/name". */
export async function getRepository(fullName: string, options?: FetchOptions): Promise<Repository> {
  const r = await gh<RepoResponse>(`/repos/${fullName}`, options);
  return {
    owner: r.owner.login,
    name: r.name,
    description: r.description ?? undefined,
    language: r.language ?? undefined,
    stars: r.stargazers_count,
    forks: r.forks_count,
    issues: r.open_issues_count,
    updatedAt: r.pushed_at,
    url: r.html_url,
  };
}

/** GitHub serves at most 400 pages of stargazers; bigger repos are sampled across them. */
const STAR_PAGE_LIMIT = 400;
/** Pages read per repo: every page up to this, an even sample beyond it. */
const STAR_PAGES = 15;
const STAR_HEADERS = { Accept: "application/vnd.github.star+json" };

type Stargazer = { starred_at: string };

/**
 * Cumulative stars by day for <StarHistory data={...} />, from "owner/name". Reads up to 15
 * pages of 100 stargazers, sampled evenly for bigger repos, and ends on today's star count.
 * GitHub lists stargazers only to the repository's owner, so the token must be theirs.
 */
export async function getStarHistory(
  fullName: string,
  options?: FetchOptions,
): Promise<StarHistoryPoint[]> {
  const path = `/repos/${fullName}/stargazers?per_page=100`;
  const [repo, first] = await Promise.all([
    gh<RepoResponse>(`/repos/${fullName}`, options),
    ghResponse(`${path}&page=1`, options, { headers: STAR_HEADERS }).catch((e) => {
      if (e instanceof HttpError && (e.status === 401 || e.status === 404))
        throw new HttpError(`GitHub lists ${fullName}'s stargazers only to its owner`, e.status);
      throw e;
    }),
  ]);
  const last = Math.min(
    Number(first.headers.get("link")?.match(/[?&]page=(\d+)>; rel="last"/)?.[1] ?? 1),
    STAR_PAGE_LIMIT,
  );
  const count = Math.min(last, STAR_PAGES);
  const pages = [
    ...new Set(
      Array.from({ length: count }, (_, i) =>
        Math.round(1 + (i * (last - 1)) / Math.max(count - 1, 1)),
      ),
    ),
  ];
  const results = await Promise.all(
    pages.map((page) =>
      page === 1
        ? (first.json() as Promise<Stargazer[]>)
        : gh<Stargazer[]>(`${path}&page=${page}`, options, { headers: STAR_HEADERS }),
    ),
  );

  // Star n of the repo is item i on page p: n = (p - 1) * 100 + i + 1. Keep each day's last count.
  const byDay = new Map<string, number>();
  results.forEach((stars, k) =>
    stars.forEach((s, i) => byDay.set(isoDate(s.starred_at), (pages[k] - 1) * 100 + i + 1)),
  );
  byDay.set(isoDate(Date.now()), repo.stargazers_count);
  return [...byDay].map(([date, stars]) => ({ date, stars }));
}

type ContributorStats = {
  author: { login: string; avatar_url: string; type: string } | null;
  total: number;
  /** Weeks, `w` in Unix seconds at the week's start, `c` commits. */
  weeks: { w: number; c: number }[];
};

type ContributorResponse = {
  login: string;
  avatar_url: string;
  type: string;
  contributions: number;
};

const DAY = 86_400_000;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const commitsSince = (days: number, weeks: ContributorStats["weeks"]) =>
  weeks.reduce((sum, w) => (w.w * 1000 >= Date.now() - days * DAY ? sum + w.c : sum), 0);

/**
 * Contributors for <TopContributors contributors={...} />, from "owner/name", most commits first.
 * Fills 30d, 90d and all-time counts from GitHub's weekly stats (the windows are whole weeks).
 * GitHub answers 202 while it computes those; after a few retries this falls back to all-time
 * commit counts only. Bot accounts are left out.
 */
export async function getContributors(
  fullName: string,
  options?: FetchOptions,
): Promise<Contributor[]> {
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt) await wait(1500);
    // fetchOk's signal skips Next's per-render memoization, which would replay the 202.
    const res = await ghResponse(`/repos/${fullName}/stats/contributors`, options);
    if (res.status === 202) continue;
    const stats = (await res.json()) as ContributorStats[];
    return stats
      .sort((a, b) => b.total - a.total)
      .flatMap(({ author, total, weeks }) =>
        author && author.type !== "Bot"
          ? [
              {
                login: author.login,
                avatarUrl: author.avatar_url,
                commits: total,
                byPeriod: {
                  "30d": commitsSince(30, weeks),
                  "90d": commitsSince(90, weeks),
                  all: total,
                },
              },
            ]
          : [],
      );
  }
  const list = await gh<ContributorResponse[]>(
    `/repos/${fullName}/contributors?per_page=100`,
    options,
  );
  return list
    .filter((c) => c.type !== "Bot")
    .map((c) => ({ login: c.login, avatarUrl: c.avatar_url, commits: c.contributions }));
}

type ReleaseResponse = {
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  published_at: string | null;
  created_at: string;
  target_commitish: string;
};

/** Words that tag a heading or a note, checked in this order. */
const CHANGE_WORDS: [ChangeType, RegExp][] = [
  ["added", /^(feat(ure)?s?|add(ed|s)?|new)\b/i],
  ["fixed", /^(fix(e[sd])?|bug ?fix(es)?)\b/i],
  ["changed", /^(change[sd]?|improve(d|s|ments?)?|update[sd]?|refactor(ed|s)?|perf|breaking)\b/i],
];
const changeType = (text: string) => CHANGE_WORDS.find(([, re]) => re.test(text))?.[0];

/** Drops markdown links, emphasis and code ticks, and GitHub's " by @user in <url>" credit. */
const plainText = (md: string) =>
  md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/\s+by @\S+ in \S+$/, "")
    .replace(/^[0-9a-f]{7,40}:\s*/, "")
    .trim();

/** Top-level bullets of a release body, tagged by their own first word or by their heading. */
function releaseItems(body: string): ChangelogItem[] {
  const items: ChangelogItem[] = [];
  let section: ChangeType | undefined;
  for (const line of body.split(/\r?\n/)) {
    const heading = line.match(/^#{1,6}\s+(.*)$/) ?? line.match(/^\*\*([^*]+)\*\*:?\s*$/);
    if (heading) {
      section = changeType(plainText(heading[1]).replace(/^\W+/, ""));
      continue;
    }
    const bullet = line.match(/^ ?[-*+]\s+(.*)$/);
    if (!bullet) continue;
    const text = plainText(bullet[1]);
    // "feat(scope)!: x" style prefixes tag the note and are dropped from its text.
    const prefix = text.match(/^(\w+)(\([^)]*\))?!?:\s+(.*)$/);
    const type = changeType(text) ?? section;
    const note = prefix && changeType(prefix[1]) ? prefix[3] : text;
    if (note) items.push(type ? { type, text: note } : note);
  }
  return items;
}

/**
 * Releases for <Changelog releases={...} />, from "owner/name", newest first. Notes are the
 * body's bullet lines, tagged added, fixed or changed when the line or its heading says so.
 */
export async function getReleases(fullName: string, options?: FetchOptions): Promise<Release[]> {
  const list = await gh<ReleaseResponse[]>(`/repos/${fullName}/releases?per_page=30`, options);
  return list
    .filter((r) => !r.draft)
    .map((r) => ({
      version: r.tag_name.replace(/^v(?=\d)/, ""),
      date: isoDate(r.published_at ?? r.created_at),
      title: r.name || r.tag_name,
      items: releaseItems(r.body ?? ""),
      ...(/^[0-9a-f]{7,40}$/.test(r.target_commitish) ? { hash: r.target_commitish } : {}),
    }));
}

type CalendarResponse = {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
        };
      };
    } | null;
  };
  errors?: { type?: string; message: string }[];
};

const CALENDAR_QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar { weeks { contributionDays { date contributionCount } } }
    }
  }
}`;

/**
 * The last year of daily contributions for <ContributionGraph data={...} />, from a login.
 * Uses the GraphQL API, which needs a token (GITHUB_TOKEN or `token`).
 */
export async function getContributions(
  login: string,
  options: FetchOptions = {},
): Promise<ContributionDay[]> {
  const token = options.token ?? process.env.GITHUB_TOKEN;
  if (!token)
    throw new Error(
      "getContributions needs a GitHub token: the GraphQL API rejects anonymous requests. " +
        "Pass { token } or set GITHUB_TOKEN.",
    );
  const raw = await ghResponse(
    "/graphql",
    { ...options, token },
    { method: "POST", body: JSON.stringify({ query: CALENDAR_QUERY, variables: { login } }) },
  );
  const res = (await raw.json()) as CalendarResponse;
  // GraphQL reports a spent limit as a 200 with a RATE_LIMITED error.
  if (res.errors?.some((e) => e.type === "RATE_LIMITED"))
    throw new RateLimitError("github.com", 403, resetTime(raw.headers));
  if (res.errors?.length) throw new Error(`GitHub GraphQL: ${res.errors[0].message}`);
  const user = res.data?.user;
  if (!user) throw new Error(`GitHub user ${login} not found`);
  return user.contributionsCollection.contributionCalendar.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
  );
}
