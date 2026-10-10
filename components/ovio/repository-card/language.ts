import type { Repository } from "./repository-card";

/**
 * A repository's language as the worlds draw it: its name, a two-letter short form and GitHub's
 * colour. Kept out of the component so server code (the README embeds) can use it too.
 */
export type RepoLanguage = { name: string; short: string; color: string };

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Rust: "#dea584",
  Go: "#00add8",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Ruby: "#701516",
  CSS: "#563d7c",
  HTML: "#e34c26",
};

const LANGUAGE_SHORT: Record<string, string> = {
  TypeScript: "TS",
  JavaScript: "JS",
  Python: "PY",
  Rust: "RS",
  Go: "GO",
  Swift: "SW",
  Kotlin: "KT",
  Ruby: "RB",
};

export function repoLanguage(repo: Repository): RepoLanguage | undefined {
  if (!repo.language) return undefined;
  return {
    name: repo.language,
    short: LANGUAGE_SHORT[repo.language] ?? repo.language.slice(0, 2).toUpperCase(),
    color: repo.languageColor ?? LANGUAGE_COLORS[repo.language] ?? "#8d8b83",
  };
}
