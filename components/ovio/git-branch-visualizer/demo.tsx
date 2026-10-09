"use client";

import { LiveDemo } from "@/components/site/live-demo";
import { DEMO_TARGETS } from "@/content/demo-sources";
import { GitBranchVisualizer, type GitCommit } from "./git-branch-visualizer";

/**
 * The sample: lumen's last few weeks, a login feature, a parser fix branched off it, and the
 * 1.0 release.
 */
const COMMITS: GitCommit[] = [
  {
    id: "3c1e9a0d27f4b18e6a52c9d03e7b4f1a8c6d2e90",
    branch: "main",
    message: "init: project scaffold",
    author: "Ada Park",
    date: "2026-09-08T09:12:00Z",
  },
  {
    id: "9d41b72c5e8a03f6d1b947e2a0c38f5d6b2e7a14",
    branch: "main",
    message: "feat: add parser core",
    author: "Mei Tanaka",
    date: "2026-09-10T14:40:00Z",
    parents: ["3c1e9a0d27f4b18e6a52c9d03e7b4f1a8c6d2e90"],
  },
  {
    id: "e07f3d9a1b6c24e8f5d03a7b9c1e6f2d8a4b5c37",
    branch: "feature/login",
    message: "feat: login form",
    author: "Leo Duarte",
    date: "2026-09-14T11:05:00Z",
    parents: ["9d41b72c5e8a03f6d1b947e2a0c38f5d6b2e7a14"],
  },
  {
    id: "51aa07c3e9d2f8b14a6c0e57d3b9f2a1c8e4d6b0",
    branch: "main",
    message: "chore: bump deps",
    author: "Ada Park",
    date: "2026-09-15T08:30:00Z",
    parents: ["9d41b72c5e8a03f6d1b947e2a0c38f5d6b2e7a14"],
  },
  {
    id: "7b2c614f0a8e3d59c2b17e6a4f9d0c3b8e5a2d71",
    branch: "feature/login",
    message: "feat: session cookies",
    author: "Leo Duarte",
    date: "2026-09-17T16:22:00Z",
    parents: ["e07f3d9a1b6c24e8f5d03a7b9c1e6f2d8a4b5c37"],
  },
  {
    id: "2f93e5a8c1d04b7e9f6a23c5d8b1e0f4a7c9d362",
    branch: "main",
    message: "feat: cli flags",
    author: "Ada Park",
    date: "2026-09-19T10:48:00Z",
    parents: ["51aa07c3e9d2f8b14a6c0e57d3b9f2a1c8e4d6b0"],
  },
  {
    id: "c84d2f1b7e3a90c6d5f28b4e1a7c3d9f0b6e2a58",
    branch: "fix/parser",
    message: "fix: tokenizer edge case",
    author: "Mei Tanaka",
    date: "2026-09-20T13:15:00Z",
    parents: ["7b2c614f0a8e3d59c2b17e6a4f9d0c3b8e5a2d71"],
  },
  {
    id: "6e10d88a2c5f4b91e7d03c6a8b2f5e1d9c4a7b03",
    branch: "feature/login",
    message: "test: login flow",
    author: "Leo Duarte",
    date: "2026-09-23T09:40:00Z",
    parents: ["7b2c614f0a8e3d59c2b17e6a4f9d0c3b8e5a2d71"],
  },
  {
    id: "a83f21b6d9c0e47f2a5b8d1c3e6f90a4b7d2c5e8",
    branch: "fix/parser",
    message: "fix: resolve parser issue",
    author: "Mei Tanaka",
    date: "2026-09-24T17:02:00Z",
    parents: ["c84d2f1b7e3a90c6d5f28b4e1a7c3d9f0b6e2a58"],
  },
  {
    id: "b5a9c03e7f1d28a6c4b90e3d5f7a2c8b1e6d4f09",
    branch: "main",
    message: "release 1.0.0",
    author: "Ada Park",
    date: "2026-09-26T12:00:00Z",
    parents: ["2f93e5a8c1d04b7e9f6a23c5d8b1e0f4a7c9d362"],
    tag: "v1.0.0",
  },
  {
    id: "08de7f4c2b9a51e3d6f07c8a4b2e9d1f5a3c6b72",
    branch: "main",
    message: "docs: write the readme",
    author: "Ada Park",
    date: "2026-09-29T15:31:00Z",
    parents: ["b5a9c03e7f1d28a6c4b90e3d5f7a2c8b1e6d4f09"],
  },
];

export function GitBranchVisualizerDemo() {
  return (
    <LiveDemo slug="git-branch-visualizer" fallback={COMMITS}>
      {(commits, live) =>
        live ? (
          <GitBranchVisualizer
            repo={DEMO_TARGETS["git-branch-visualizer"]}
            commits={commits}
            head="main"
          />
        ) : (
          <GitBranchVisualizer
            repo="ada-dev/lumen"
            commits={commits}
            head="main"
            defaultValue="6e10d88a2c5f4b91e7d03c6a8b2f5e1d9c4a7b03"
          />
        )
      }
    </LiveDemo>
  );
}
