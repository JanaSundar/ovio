"use client";

import { ContributionGraph } from "@/components/ovio/contribution-graph/contribution-graph";
import type { ContributionDay } from "@/components/ovio/contribution-graph/types";
import { RepositoryCard, type Repository } from "@/components/ovio/repository-card/repository-card";
import { StarHistory } from "@/components/ovio/star-history/star-history";
import type { StarHistoryPoint } from "@/components/ovio/star-history/types";
import {
  TopContributors,
  type Contributor,
} from "@/components/ovio/top-contributors/top-contributors";

/*
 * A project's pulse: who it is, how it grew, how often it ships and who ships it.
 * Replace the sample data with lib/github.ts: getRepository, getContributions, getContributors.
 */

const REPOSITORY: Repository = {
  owner: "ada-dev",
  name: "lumen",
  description: "A tiny, typed state machine for interface animation.",
  language: "TypeScript",
  stars: 10945,
  forks: 812,
  issues: 37,
  updatedAt: "2026-10-07T06:00:00Z",
};

/** Two years of stars, one point a week, with a launch spike. */
const STARS: StarHistoryPoint[] = Array.from({ length: 104 }, (_, week) => {
  const date = new Date(Date.UTC(2024, 9, 7) + week * 7 * 86_400_000).toISOString().slice(0, 10);
  const launch = week >= 40 ? 2400 : 0;
  return { date, stars: Math.round(week * week * 0.62 + week * 18 + launch) };
});

/** A year of commits: busier on weekdays, quiet for three weeks in spring. */
const CONTRIBUTIONS: ContributionDay[] = Array.from({ length: 365 }, (_, day) => {
  const time = Date.UTC(2025, 9, 8) + day * 86_400_000;
  const weekday = new Date(time).getUTCDay();
  const quiet = day > 190 && day < 212;
  const count = quiet
    ? 0
    : Math.max(0, Math.round(((day * 7919) % 13) - (weekday % 6 === 0 ? 8 : 3)));
  return { date: new Date(time).toISOString().slice(0, 10), count };
});

const CONTRIBUTORS: Contributor[] = [
  { login: "ada-dev", name: "Ada Okafor", commits: 1248, byPeriod: { "30d": 61, "90d": 212 } },
  { login: "meitanaka", name: "Mei Tanaka", commits: 812, byPeriod: { "30d": 74, "90d": 168 } },
  { login: "priyar", name: "Priya Raman", commits: 451, byPeriod: { "30d": 33, "90d": 131 } },
  { login: "jweber", name: "Jonas Weber", commits: 604, byPeriod: { "30d": 18, "90d": 97 } },
  { login: "samk", name: "Sam Kim", commits: 174, byPeriod: { "30d": 39, "90d": 64 } },
];

export function RepositoryActivity() {
  return (
    <section
      aria-label="Project activity"
      className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2"
    >
      <div className="flex flex-col gap-6">
        <RepositoryCard repository={REPOSITORY} />
        <TopContributors repo="ada-dev/lumen" contributors={CONTRIBUTORS} limit={5} />
      </div>
      <StarHistory
        repo="ada-dev/lumen"
        data={STARS}
        annotations={[{ date: "2025-07-14", label: "Launch day" }]}
      />
      <div className="lg:col-span-2">
        <ContributionGraph data={CONTRIBUTIONS} compactMonths={6} />
      </div>
    </section>
  );
}
