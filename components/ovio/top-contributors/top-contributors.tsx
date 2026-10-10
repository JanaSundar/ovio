"use client";

import { type ComponentType, useState } from "react";
import { initialsOf } from "@/components/shared/avatar";
import { useWorld, type World } from "@/components/shared/world-provider";
import { MinimalTopContributors } from "./worlds/minimal";
import { CraftTopContributors } from "./worlds/craft";
import { RetroTopContributors } from "./worlds/retro";
import { ToyTopContributors } from "./worlds/toy";

export type ContributorPeriod = "30d" | "90d" | "all";

export type Contributor = {
  /** GitHub handle, without the @. */
  login: string;
  /** Display name. Falls back to the login. */
  name?: string;
  /** Avatar image. Leave out (or let it fail) and initials are shown instead. */
  avatarUrl?: string;
  /** Commit count, used for any period missing from `byPeriod`. */
  commits: number;
  /** Commit counts per time window, e.g. `{ "30d": 96, "90d": 312, all: 1248 }`. */
  byPeriod?: Partial<Record<ContributorPeriod, number>>;
};

export type TopContributorsProps = {
  contributors: Contributor[];
  variant?: World;
  /** Project label shown in the header, e.g. "ada-dev/lumen". */
  repo?: string;
  /** Max people shown. */
  limit?: number;
  period?: ContributorPeriod;
  defaultPeriod?: ContributorPeriod;
  onPeriodChange?: (period: ContributorPeriod) => void;
  /** Which windows the switcher offers, in order. An empty list hides the switcher. */
  periods?: ContributorPeriod[];
  className?: string;
};

export type RankedContributor = {
  login: string;
  name: string;
  first: string;
  initials: string;
  avatarUrl?: string;
  /** 1-based rank. */
  rank: number;
  commits: number;
  /** Commits relative to the top contributor, 0–1 (bar length, podium height). */
  ratio: number;
};

/** Everything a world needs to draw the board. Worlds only render; state lives here. */
export type TopContributorsWorldProps = {
  people: RankedContributor[];
  /** Commits by everyone in the window, not only the people shown. */
  total: number;
  repo?: string;
  period: ContributorPeriod;
  periods: ContributorPeriod[];
  setPeriod: (period: ContributorPeriod) => void;
  className?: string;
};

export const PERIOD_LABEL: Record<ContributorPeriod, string> = {
  "30d": "30 days",
  "90d": "90 days",
  all: "All time",
};

export const PERIOD_SHORT: Record<ContributorPeriod, string> = {
  "30d": "30d",
  "90d": "90d",
  all: "All",
};

const PERIODS: ContributorPeriod[] = ["30d", "90d", "all"];

/** Ranks contributors by commits in a window: highest first, ties by login so the order is stable. */
function rankContributors(
  contributors: Contributor[],
  period: ContributorPeriod,
  limit: number,
): { people: RankedContributor[]; total: number } {
  const counted = contributors
    .map((c) => ({ c, commits: Math.max(0, c.byPeriod?.[period] ?? c.commits) }))
    .filter((x) => x.commits > 0)
    .sort((a, b) => b.commits - a.commits || a.c.login.localeCompare(b.c.login));
  const total = counted.reduce((sum, x) => sum + x.commits, 0);
  const top = counted[0]?.commits ?? 1;

  const people = counted.slice(0, Math.max(0, limit)).map(({ c, commits }, i) => {
    const name = c.name?.trim() || c.login;
    return {
      login: c.login,
      name,
      first: name.split(/\s+/)[0],
      initials: initialsOf(name),
      avatarUrl: c.avatarUrl,
      rank: i + 1,
      commits,
      ratio: commits / top,
    };
  });
  return { people, total };
}

const VIEWS = {
  minimal: MinimalTopContributors,
  craft: CraftTopContributors,
  retro: RetroTopContributors,
  toy: ToyTopContributors,
} satisfies Record<World, ComponentType<TopContributorsWorldProps>>;

export function TopContributors({
  contributors,
  variant,
  repo,
  limit = 6,
  period: periodProp,
  defaultPeriod = "90d",
  onPeriodChange,
  periods: periodsProp = PERIODS,
  className,
}: TopContributorsProps) {
  const world = useWorld(variant);
  const [inner, setInner] = useState(defaultPeriod);
  // A window nobody has a count for would show all-time commits under "30 days" (GitHub's stats
  // aren't always ready), so only the windows the data covers are offered. All time always is.
  const periods = periodsProp.filter(
    (p) => p === "all" || contributors.some((c) => c.byPeriod?.[p] !== undefined),
  );
  const asked = periodProp ?? inner;
  const period = periods.includes(asked) ? asked : (periods[periods.length - 1] ?? "all");

  const setPeriod = (next: ContributorPeriod) => {
    if (next === period) return;
    if (periodProp === undefined) setInner(next);
    onPeriodChange?.(next);
  };

  const { people, total } = rankContributors(contributors, period, limit);
  const props: TopContributorsWorldProps = {
    people,
    total,
    repo,
    period,
    periods,
    setPeriod,
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
