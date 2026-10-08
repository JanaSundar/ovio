"use client";

import { RepositoryCard, type Repository } from "./repository-card";

/** lumen, the fictional project the demos are about. */
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
  return <RepositoryCard repository={LUMEN} />;
}
