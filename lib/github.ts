import "server-only";

import type { Repository } from "@/components/ovio/repository-card/repository-card";

/**
 * Server-side GitHub fetchers. Unauthenticated GitHub allows 60 requests an hour per IP,
 * so pass a token (GITHUB_TOKEN) in production and cache the result.
 */

type FetchOptions = { token?: string; revalidate?: number };

async function gh<T>(
  path: string,
  { token = process.env.GITHUB_TOKEN, revalidate = 3600 }: FetchOptions = {},
) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`GitHub ${path} responded ${res.status}`);
  return (await res.json()) as T;
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

/** Repository data for <RepositoryCard repo={...} />, from "owner/name". */
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
