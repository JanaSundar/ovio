"use client";

import { Changelog, type Release } from "./changelog";

/** Recent lumen releases, newest first. */
const RELEASES: Release[] = [
  {
    version: "2.4.0",
    date: "2026-09-30",
    title: "Parallel states",
    hash: "a3f9c21",
    items: [
      { type: "added", text: "Parallel regions with independent transitions" },
      { type: "changed", text: "send() returns the next snapshot" },
    ],
  },
  {
    version: "2.3.1",
    date: "2026-09-12",
    title: "Fixes",
    hash: "7be04d8",
    items: [
      { type: "fixed", text: "Exit animations no longer skip on fast re-entry" },
      { type: "fixed", text: "Guards see the latest context" },
    ],
  },
  {
    version: "2.3.0",
    date: "2026-08-21",
    title: "Spring timelines",
    hash: "e1c5a90",
    items: [
      { type: "added", text: "Spring-driven transitions with interruption" },
      { type: "added", text: "Shared spring presets" },
    ],
  },
  {
    version: "2.2.0",
    date: "2026-07-28",
    title: "Typed events",
    hash: "4d2b7f3",
    items: [
      { type: "added", text: "Event payloads inferred from the machine" },
      { type: "changed", text: "Devtools panel moved to lumen/devtools" },
    ],
  },
];

export function ChangelogDemo() {
  return <Changelog releases={RELEASES} />;
}
