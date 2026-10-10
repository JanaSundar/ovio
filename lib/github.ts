import "server-only";

import type { Release, ChangelogItem, ChangeType } from "@/components/ovio/changelog/types";
import type { ContributionDay } from "@/components/ovio/contribution-graph/types";
import type { Developer } from "@/components/ovio/developer-id-card/types";
import type { GitCommit } from "@/components/ovio/git-branch-visualizer/types";
import type { Repository } from "@/components/ovio/repository-card/types";
import type { StarHistoryPoint } from "@/components/ovio/star-history/types";
import type { Contributor } from "@/components/ovio/top-contributors/types";
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

type UserResponse = {
  login: string;
  id: number;
  type: "User" | "Organization";
  name: string | null;
  bio: string | null;
  blog: string | null;
  location: string | null;
  hireable: boolean | null;
  avatar_url: string;
  created_at: string;
};

type OwnedRepo = { language: string | null; fork: boolean };

/** How many languages a card lists, most used first. */
const STACK_SIZE = 4;

export type { Developer };

/**
 * A developer's public GitHub profile for <DeveloperIdCard {...developer} />, from a login: name,
 * the bio's first line as title, the languages of their own repos as stack, site, location, the
 * year they joined, and "available" when they have marked themselves hireable. Two requests.
 * Organisations aren't developers, so they answer 422.
 */
export async function getDeveloper(login: string, options?: FetchOptions): Promise<Developer> {
  const [user, repos] = await Promise.all([
    gh<UserResponse>(`/users/${login}`, options),
    gh<OwnedRepo[]>(`/users/${login}/repos?type=owner&sort=pushed&per_page=100`, options),
  ]);
  if (user.type !== "User") throw new HttpError(`${user.login} is an organisation`, 422);

  const languages = new Map<string, number>();
  for (const r of repos)
    if (r.language && !r.fork) languages.set(r.language, (languages.get(r.language) ?? 0) + 1);

  return {
    name: user.name?.trim() || user.login,
    title: user.bio?.split(/\r?\n/)[0].trim() || undefined,
    stack: [...languages]
      .sort((a, b) => b[1] - a[1])
      .slice(0, STACK_SIZE)
      .map(([language]) => language),
    github: user.login,
    website: user.blog?.trim() || undefined,
    location: user.location?.trim() || undefined,
    available: user.hireable ? true : undefined,
    avatarUrl: `${user.avatar_url}${user.avatar_url.includes("?") ? "&" : "?"}s=240`,
    serial: String(user.id % 1000).padStart(3, "0"),
    since: new Date(user.created_at).getUTCFullYear(),
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
      // Rate-limit 403s are RateLimitErrors by now, so what's left is GitHub refusing the list.
      if (
        e instanceof HttpError &&
        !(e instanceof RateLimitError) &&
        [401, 403, 404].includes(e.status)
      )
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

type GraphQLResponse<T> = { data?: T; errors?: { type?: string; message: string }[] };

/** A GraphQL query's data. GraphQL rejects anonymous requests, so this needs a token. */
async function graphql<T>(
  query: string,
  variables: Record<string, unknown>,
  { token = process.env.GITHUB_TOKEN, ...options }: FetchOptions = {},
): Promise<T> {
  if (!token)
    throw new Error(
      "GitHub's GraphQL API rejects anonymous requests. Pass { token } or set GITHUB_TOKEN.",
    );
  const raw = await ghResponse(
    "/graphql",
    { ...options, token },
    { method: "POST", body: JSON.stringify({ query, variables }) },
  );
  const res = (await raw.json()) as GraphQLResponse<T>;
  // GraphQL reports a spent limit as a 200 with a RATE_LIMITED error.
  if (res.errors?.some((e) => e.type === "RATE_LIMITED"))
    throw new RateLimitError("github.com", 403, resetTime(raw.headers));
  if (res.errors?.length || !res.data)
    throw new Error(`GitHub GraphQL: ${res.errors?.[0].message ?? "no data"}`);
  return res.data;
}

type CalendarResponse = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
      };
    };
  } | null;
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
  options?: FetchOptions,
): Promise<ContributionDay[]> {
  const { user } = await graphql<CalendarResponse>(CALENDAR_QUERY, { login }, options);
  if (!user) throw new Error(`GitHub user ${login} not found`);
  return user.contributionsCollection.contributionCalendar.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
  );
}

export type HistoryCommit = {
  oid: string;
  messageHeadline: string;
  messageBody: string;
  committedDate: string;
  author: { name: string | null } | null;
  parents: { nodes: { oid: string }[] };
};

type HistoryResponse = {
  repository: {
    defaultBranchRef: {
      name: string;
      target: { history: { nodes: HistoryCommit[] } };
    } | null;
  } | null;
};

const HISTORY_QUERY = `query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    defaultBranchRef {
      name
      target {
        ... on Commit {
          history(first: 100) {
            nodes {
              oid messageHeadline messageBody committedDate
              author { name }
              parents(first: 2) { nodes { oid } }
            }
          }
        }
      }
    }
  }
}`;

/** "Merge pull request #16 from owner/fix/scroll": the PR number and the branch it came from. */
const PULL_MERGE = /^Merge pull request #(\d+) from [^/\s]+\/(\S+)/;

/**
 * Recent history for <GitBranchVisualizer commits={...} />, from "owner/name", oldest first. The
 * newest merges into the default branch come first, each with every commit its branch brought in
 * and the commit it grew from, while the total stays within `limit`. Commits pushed straight to
 * the default branch between them are left out, so a squash- or rebase-merged stretch doesn't use
 * up the room, and any room left goes to the newest of them. Merged branches keep the name their
 * merge commit records, and pull request merges read as "<PR title> (#16)". Uses the GraphQL API,
 * which needs a token (GITHUB_TOKEN or `token`).
 */
export async function getCommitGraph(
  fullName: string,
  { limit = 14, ...options }: FetchOptions & { limit?: number } = {},
): Promise<GitCommit[]> {
  const [owner, name] = fullName.split("/");
  const { repository } = await graphql<HistoryResponse>(HISTORY_QUERY, { owner, name }, options);
  const ref = repository?.defaultBranchRef;
  if (!ref) throw new Error(`GitHub repository ${fullName} not found`);
  return shapeCommitGraph(ref.target.history.nodes, ref.name, limit);
}

/** getCommitGraph's selection, from history newest first. Exported for tests. */
export function shapeCommitGraph(history: HistoryCommit[], main: string, limit = 14): GitCommit[] {
  const byId = new Map(history.map((c) => [c.oid, c]));
  const firstParent = (c: HistoryCommit) => byId.get(c.parents.nodes[0]?.oid ?? "");
  const mainline: HistoryCommit[] = [];
  for (let c: HistoryCommit | undefined = history[0]; c; c = firstParent(c)) mainline.push(c);
  if (!mainline.length) return [];
  const onMain = new Set(mainline.map((c) => c.oid));

  // Kept commits and their branch: the tip, then whole merges, newest first, while they fit.
  const branchOf = new Map([[mainline[0].oid, main]]);
  for (const c of mainline) {
    const branch: HistoryCommit[] = [];
    const merged = byId.get(c.parents.nodes[1]?.oid ?? "");
    for (let b = merged; b && !onMain.has(b.oid); b = firstParent(b)) branch.push(b);
    if (!branch.length) continue;
    const base = firstParent(branch.at(-1)!);
    const added = [c, base, ...branch].filter((b) => b && !branchOf.has(b.oid)).length;
    if (branchOf.size + added > limit) break;
    branchOf.set(c.oid, main);
    if (base) branchOf.set(base.oid, main);
    const label = c.messageHeadline.match(PULL_MERGE)?.[2] ?? `merged-${c.oid.slice(0, 7)}`;
    branch.forEach((b) => branchOf.set(b.oid, label));
  }
  // Room left over, or no merges at all: the newest commits pushed straight to the branch.
  for (const c of mainline) {
    if (branchOf.size >= limit) break;
    branchOf.set(c.oid, main);
  }

  // A parent left out is skipped over: on the default branch, the next kept commit below it.
  const keptParent = (id: string) => {
    let c = byId.get(id);
    while (c && !branchOf.has(c.oid) && onMain.has(c.oid)) c = firstParent(c);
    return c && branchOf.has(c.oid) ? c.oid : undefined;
  };

  // Parents before children: a depth-first walk that emits each commit after its parents.
  const ordered: GitCommit[] = [];
  const seen = new Set<string>();
  const visit = (id: string) => {
    const c = byId.get(id);
    if (!c || seen.has(id) || !branchOf.has(id)) return;
    seen.add(id);
    const parents = [
      ...new Set(c.parents.nodes.map((p) => keptParent(p.oid)).filter((p) => p !== undefined)),
    ];
    parents.forEach(visit);
    const pull = c.messageHeadline.match(PULL_MERGE);
    const title = c.messageBody.split("\n")[0].trim();
    ordered.push({
      id: c.oid,
      branch: branchOf.get(id)!,
      message: pull && title ? `${title} (#${pull[1]})` : c.messageHeadline,
      author: c.author?.name ?? "unknown",
      date: c.committedDate,
      ...(parents.length ? { parents } : {}),
    });
  };
  visit(mainline[0].oid);
  return ordered;
}
