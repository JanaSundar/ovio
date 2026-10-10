export type Repository = {
  owner: string;
  name: string;
  description?: string;
  /** Primary language, as GitHub names it ("TypeScript"). */
  language?: string;
  /** Language colour; defaults to GitHub's colour for common languages. */
  languageColor?: string;
  stars: number;
  forks: number;
  issues?: number;
  /** Last push, ISO 8601. */
  updatedAt?: string;
  url?: string;
};
