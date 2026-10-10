import type { Repository } from "./repository-card";

/**
 * A repository's language as the worlds draw it: its name, a two-letter short form and GitHub's
 * colour. Kept out of the component so server code (the README embeds) can use it too.
 */
export type RepoLanguage = {
  name: string;
  short: string;
  color: string;
  /** Text that reads on `color`: ink on JavaScript's yellow, white on TypeScript's blue. */
  ink: string;
};

/** Dark ink on a light colour, white on a dark one, by relative luminance. */
function inkOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? "#2a1f14" : "#ffffff";
}

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
  const color = repo.languageColor ?? LANGUAGE_COLORS[repo.language] ?? "#8d8b83";
  return {
    name: repo.language,
    short: LANGUAGE_SHORT[repo.language] ?? repo.language.slice(0, 2).toUpperCase(),
    color,
    ink: /^#[\da-f]{6}$/i.test(color) ? inkOn(color) : "#ffffff",
  };
}
