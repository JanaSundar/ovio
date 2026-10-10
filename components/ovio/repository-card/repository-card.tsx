"use client";

import { type ComponentType, useState, useSyncExternalStore } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { formatShortDate } from "@/lib/format";
import { repoLanguage, type RepoLanguage } from "./language";
import { MinimalRepositoryCard } from "./worlds/minimal";
import { CraftRepositoryCard } from "./worlds/craft";
import { RetroRepositoryCard } from "./worlds/retro";
import { ToyRepositoryCard } from "./worlds/toy";

export type Repository = {
  owner: string;
  name: string;
  description?: string;
  /** Primary language, as GitHub names it ("TypeScript"). */
  language?: string;
  /** Language colour; defaults to GitHub's colour for common languages. */
  languageColor?: string;
  stars: number;
  forks: number;
  issues?: number;
  /** Last push, ISO 8601. */
  updatedAt?: string;
  url?: string;
};

export type RepositoryStat = "stars" | "forks" | "issues";

export type RepositoryCardProps = {
  repository: Repository;
  variant?: World;
  /** Which counts to show, in order. Defaults to stars and forks (and issues in Craft). */
  stats?: RepositoryStat[];
  /** Controlled star state (the Toy star key toggles it). */
  starred?: boolean;
  defaultStarred?: boolean;
  onStarredChange?: (starred: boolean) => void;
  className?: string;
};

/** Everything a world needs to draw the card. Worlds only render; state lives here. */
export type RepositoryCardWorldProps = {
  repo: Repository;
  stats: RepositoryStat[];
  starred: boolean;
  /** Star count including the viewer's own star. */
  starCount: number;
  toggleStar: () => void;
  language?: RepoLanguage;
  updated?: string;
  className?: string;
};

/** "2h ago", "3d ago". */
export function relativeTime(iso: string, now = Date.now()): string {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  // Each unit, and how many of it make the next one.
  const units: [string, number][] = [
    ["m", 60],
    ["h", 24],
    ["d", 30],
    ["mo", 12],
    ["y", Infinity],
  ];
  if (s < 60) return "just now";
  let v = s / 60;
  for (const [unit, next] of units) {
    if (v < next) return `${Math.floor(v)}${unit} ago`;
    v /= next;
  }
  return "just now";
}

const noop = () => () => {};
const yes = () => true;
const no = () => false;

const VIEWS = {
  minimal: MinimalRepositoryCard,
  craft: CraftRepositoryCard,
  retro: RetroRepositoryCard,
  toy: ToyRepositoryCard,
} satisfies Record<World, ComponentType<RepositoryCardWorldProps>>;

export function RepositoryCard({
  repository: repo,
  variant,
  stats,
  starred: starredProp,
  defaultStarred = false,
  onStarredChange,
  className,
}: RepositoryCardProps) {
  const world = useWorld(variant);
  // "2h ago" depends on when it is read, so the server and hydration print the date instead
  // and the browser switches to the relative time before the first paint. Reading the clock while
  // prerendering froze the build's "2d ago" into the page for good.
  const painted = useSyncExternalStore(noop, yes, no);
  const [starredState, setStarredState] = useState(defaultStarred);
  const starred = starredProp ?? starredState;

  const toggleStar = () => {
    const next = !starred;
    if (starredProp === undefined) setStarredState(next);
    onStarredChange?.(next);
  };

  const props: RepositoryCardWorldProps = {
    repo,
    stats: stats ?? (world === "craft" ? ["stars", "forks", "issues"] : ["stars", "forks"]),
    starred,
    starCount: repo.stars + (starred ? 1 : 0),
    toggleStar,
    language: repoLanguage(repo),
    updated: repo.updatedAt
      ? painted
        ? relativeTime(repo.updatedAt)
        : formatShortDate(repo.updatedAt)
      : undefined,
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
