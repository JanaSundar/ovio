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
