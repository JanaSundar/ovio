export type GitCommit = {
  /** Commit SHA; the first seven characters are shown. */
  id: string;
  branch: string;
  message: string;
  author: string;
  /** ISO 8601. */
  date: string;
  /** Parent ids, first parent first. Two parents make a merge. */
  parents?: string[];
  /** Release tag drawn above the commit, e.g. "v1.0.0". */
  tag?: string;
};
