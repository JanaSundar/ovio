/** Name suffixes that aren't a surname: "… Montgomery III" is CM, not CI. */
const SUFFIX = /^(jr|sr|i{1,3}|iv|v|vi{1,3}|phd|md)\.?$/i;

/** The first grapheme of a string, so an emoji or an accented letter is never split in half. */
const firstGrapheme = (s: string) =>
  Array.from(new Intl.Segmenter().segment(s), (g) => g.segment)[0] ?? "";

/**
 * Two letters for an avatar tile: "Jana Sundar" → "JS", "ada-dev" → "AD", "jana" → "JA",
 * "🦊 Fox" → "F", "王秀英" → "王秀". Words without a letter or digit (an emoji, a dash) and
 * suffixes are skipped; letters are read as whole graphemes.
 */
export function initialsOf(name: string): string {
  const words = name
    .split(/[\s._-]+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w))
    .filter((w, i, all) => all.length === 1 || !SUFFIX.test(w));
  if (words.length === 0) return "";
  if (words.length === 1) {
    const letters = Array.from(new Intl.Segmenter().segment(words[0]), (g) => g.segment)
      .filter((g) => /[\p{L}\p{N}]/u.test(g))
      .slice(0, 2);
    return letters.join("").toUpperCase();
  }
  return (firstGrapheme(words[0]) + firstGrapheme(words[words.length - 1])).toUpperCase();
}
