"use client";

import { LiveDemo } from "@/components/site/live-demo";
import { SAMPLE_REPOSITORY } from "@/content/samples";
import { RepositoryCard } from "./repository-card";

export function RepositoryCardDemo() {
  return (
    <LiveDemo slug="repository-card" fallback={SAMPLE_REPOSITORY}>
      {(repository) => <RepositoryCard repository={repository} />}
    </LiveDemo>
  );
}
