"use client";

import { useState } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { formatDate } from "@/lib/format";
import { MinimalChangelog } from "./worlds/minimal";
import { CraftChangelog } from "./worlds/craft";
import { RetroChangelog } from "./worlds/retro";
import { ToyChangelog } from "./worlds/toy";

export type ChangeType = "added" | "fixed" | "changed";

/** A note: plain text, or text tagged with the kind of change. */
export type ChangelogItem = string | { type?: ChangeType; text: string };

export type Release = {
  version: string;
  /** Shown as given ("Sep 30, 2026"); an ISO date ("2026-09-30") is formatted for you. */
  date: string;
  title: string;
  items: ChangelogItem[];
  /** Commit hash for the Retro log line. Derived from the version when left out. */
  hash?: string;
};

export type ChangelogProps = {
  /** Newest first. */
  releases: Release[];
  variant?: World;
  /** How many releases to show, from the newest. Shows all when left out. */
  limit?: number;
  className?: string;
};

/** A release shaped for drawing: date formatted, items tagged, hash and commit kind filled in. */
export type ChangelogEntry = {
  version: string;
  date: string;
  /** Machine-readable date for <time>, when the date was given as ISO. */
  dateTime?: string;
  title: string;
  items: { type?: ChangeType; text: string }[];
  hash: string;
  /** Conventional-commit kind for the Retro log: patch releases and fix-only releases are "fix". */
  kind: "feat" | "fix";
};

/** Everything a world needs to draw the changelog. Worlds only render; state lives here. */
export type ChangelogWorldProps = {
  releases: ChangelogEntry[];
  /** Craft: the card on top of the stack. */
  top: number;
  next: () => void;
  /** Toy: the open release, or -1 when all are closed. */
  open: number;
  toggle: (index: number) => void;
  className?: string;
};

export const TYPE_LABEL: Record<ChangeType, string> = {
  added: "Added",
  fixed: "Fixed",
  changed: "Changed",
};

/** A stable 7-character hex hash (FNV-1a), so the same version always prints the same commit. */
function shortHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0).toString(16) + "0000000").slice(0, 7);
}

function toEntry(release: Release): ChangelogEntry {
  const iso = /^\d{4}-\d{2}-\d{2}/.test(release.date) ? release.date : undefined;
  const items = release.items.map((item) => (typeof item === "string" ? { text: item } : item));
  const patch = Number(release.version.split(".")[2] ?? 0) > 0;
  const fixOnly = items.length > 0 && items.every((item) => item.type === "fixed");
  return {
    version: release.version.replace(/^v/, ""),
    date: iso ? formatDate(iso) : release.date,
    dateTime: iso,
    title: release.title,
    items,
    hash: release.hash?.slice(0, 7) ?? shortHash(release.version),
    kind: patch || fixOnly ? "fix" : "feat",
  };
}

export function Changelog({ releases, variant, limit, className }: ChangelogProps) {
  const world = useWorld(variant);
  const [top, setTop] = useState(0);
  const [open, setOpen] = useState(0);
  const entries = releases.slice(0, limit).map(toEntry);

  const props: ChangelogWorldProps = {
    releases: entries,
    top: entries.length ? top % entries.length : 0,
    next: () => setTop((t) => (t + 1) % Math.max(1, entries.length)),
    open,
    toggle: (i) => setOpen((o) => (o === i ? -1 : i)),
    className,
  };

  switch (world) {
    case "craft":
      return <CraftChangelog {...props} />;
    case "retro":
      return <RetroChangelog {...props} />;
    case "toy":
      return <ToyChangelog {...props} />;
    default:
      return <MinimalChangelog {...props} />;
  }
}
