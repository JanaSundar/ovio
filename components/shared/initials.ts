/** Two letters for an avatar tile: "Jana Sundar" → "JS", "ada-dev" → "AD", "jana" → "JA". */
export function initialsOf(name: string): string {
  const words = name.split(/[\s._-]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}
