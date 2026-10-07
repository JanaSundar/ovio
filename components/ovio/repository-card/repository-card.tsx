"use client";

import { useState } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
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
  repo: Repository;
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
  language?: { name: string; short: string; color: string };
  updated?: string;
  className?: string;
};

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Rust: "#dea584",
  Go: "#00add8",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Ruby: "#701516",
  CSS: "#563d7c",
  HTML: "#e34c26",
};

const LANGUAGE_SHORT: Record<string, string> = {
  TypeScript: "TS",
  JavaScript: "JS",
  Python: "PY",
  Rust: "RS",
  Go: "GO",
  Swift: "SW",
  Kotlin: "KT",
  Ruby: "RB",
};

/** "2h ago", "3d ago". */
function relativeTime(iso: string, now = Date.now()): string {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const units: [number, string][] = [
    [60, "m"],
    [24, "h"],
    [30, "d"],
    [12, "mo"],
  ];
  let v = s / 60;
  let unit = "m";
  for (let i = 1; i < units.length && v >= units[i][0]; i++) {
    v /= units[i][0];
    unit = units[i][1];
  }
  if (unit === "mo" && v >= 12) return `${Math.floor(v / 12)}y ago`;
  return `${Math.floor(v)}${unit} ago`;
}

export function RepositoryCard({
  repo,
  variant,
  stats,
  starred: starredProp,
  defaultStarred = false,
  onStarredChange,
  className,
}: RepositoryCardProps) {
  const world = useWorld(variant);
  const [starredState, setStarredState] = useState(defaultStarred);
  const starred = starredProp ?? starredState;

  const toggleStar = () => {
    const next = !starred;
    if (starredProp === undefined) setStarredState(next);
    onStarredChange?.(next);
  };

  const language = repo.language
    ? {
        name: repo.language,
        short: LANGUAGE_SHORT[repo.language] ?? repo.language.slice(0, 2).toUpperCase(),
        color: repo.languageColor ?? LANGUAGE_COLORS[repo.language] ?? "#8d8b83",
      }
    : undefined;

  const props: RepositoryCardWorldProps = {
    repo,
    stats: stats ?? (world === "craft" ? ["stars", "forks", "issues"] : ["stars", "forks"]),
    starred,
    starCount: repo.stars + (starred ? 1 : 0),
    toggleStar,
    language,
    updated: repo.updatedAt ? relativeTime(repo.updatedAt) : undefined,
    className,
  };

  switch (world) {
    case "craft":
      return <CraftRepositoryCard {...props} />;
    case "retro":
      return <RetroRepositoryCard {...props} />;
    case "toy":
      return <ToyRepositoryCard {...props} />;
    default:
      return <MinimalRepositoryCard {...props} />;
  }
}
