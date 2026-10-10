export type ContributorPeriod = "30d" | "90d" | "all";

export type Contributor = {
  /** GitHub handle, without the @. */
  login: string;
  /** Display name. Falls back to the login. */
  name?: string;
  /** Avatar image. Leave out (or let it fail) and initials are shown instead. */
  avatarUrl?: string;
  /** Commit count, used for any period missing from `byPeriod`. */
  commits: number;
  /** Commit counts per time window, e.g. `{ "30d": 96, "90d": 312, all: 1248 }`. */
  byPeriod?: Partial<Record<ContributorPeriod, number>>;
};
