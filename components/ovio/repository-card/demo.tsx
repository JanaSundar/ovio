"use client";

import { LiveDemo } from "@/components/site/live-demo";
import { RepositoryCard, type Repository } from "./repository-card";

/** Shown when the live data can't load: lumen, the fictional project the samples are about. */
const LUMEN: Repository = {
  owner: "ada-dev",
  name: "lumen",
  description: "A tiny, typed state machine for interface animation.",
  language: "TypeScript",
  stars: 10945,
  forks: 812,
  issues: 37,
  updatedAt: "2026-10-07T06:00:00Z",
};

export function RepositoryCardDemo() {
  return (
    <LiveDemo slug="repository-card" fallback={LUMEN}>
      {(repository) => <RepositoryCard repository={repository} />}
    </LiveDemo>
  );
}
