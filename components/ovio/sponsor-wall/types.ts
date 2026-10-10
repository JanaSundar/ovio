/** Platinum sponsors get the biggest spot, backers the smallest. */
export type SponsorTier = "platinum" | "gold" | "backer";

export type Sponsor = {
  /** Shown as the sponsor's wordmark, e.g. "Northwind" or "@kiran". */
  name: string;
  tier: SponsorTier;
  /** Where the sponsor links to. Leave out for plain text. */
  url?: string;
};
