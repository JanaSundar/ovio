import { WORLDS, type World } from "../world";

/**
 * The components with a README embed, and the query parameter that names their subject. Only
 * those whose data a public API gives for anyone, with no token of theirs: a user's
 * contributions need GitHub's GraphQL API and a token, so the Contribution Graph has none.
 */
export const EMBEDS = {
  "repository-card": { param: "repo", example: "JanaSundar/ovio" },
} as const;

export type EmbedSlug = keyof typeof EMBEDS;
export type EmbedFormat = "svg" | "png";

export type EmbedRequest = { slug: EmbedSlug; subject: string; world: World; format: EmbedFormat };

/** A query that doesn't make sense, said as a sentence, in the format the image was asked for. */
export type EmbedProblem = { problem: string; format: EmbedFormat };

export const isEmbedSlug = (slug: string): slug is EmbedSlug => slug in EMBEDS;

// GitHub's own rules: owners are 1–39 letters, digits or single hyphens; repo names add . and _.
const REPO = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}\/[\w.-]{1,100}$/i;

/**
 * Reads an embed URL's query: the subject (?repo=owner/name), the world (default minimal) and
 * the format (default svg). Says what's wrong when the query doesn't make sense.
 */
export function parseEmbed(slug: EmbedSlug, query: URLSearchParams): EmbedRequest | EmbedProblem {
  const { param, example } = EMBEDS[slug];
  const asked = query.get("format") ?? "svg";
  const format: EmbedFormat = asked === "png" ? "png" : "svg";
  const problem = (text: string): EmbedProblem => ({ problem: text, format });

  if (asked !== "svg" && asked !== "png") return problem("format must be svg or png");
  const subject = query.get(param)?.trim() ?? "";
  if (!subject) return problem(`Add ?${param}=${example} to the URL`);
  if (!REPO.test(subject)) return problem(`"${subject.slice(0, 60)}" is not a GitHub owner/name`);
  const world = query.get("world") ?? "minimal";
  if (!(WORLDS as readonly string[]).includes(world))
    return problem(`world must be one of ${WORLDS.join(", ")}`);

  return { slug, subject, world: world as World, format };
}

/** An embed's path and query, "/embed/repository-card?repo=owner/name&world=toy". */
export function embedPath(slug: EmbedSlug, subject: string, world: World) {
  const query = new URLSearchParams({ [EMBEDS[slug].param]: subject });
  if (world !== "minimal") query.set("world", world);
  // A slash is safe in a query, and owner/name reads better unescaped.
  return `/embed/${slug}?${query.toString().replace("%2F", "/")}`;
}

/** Problem cards say so in this header, so the docs preview can show the sample in their place. */
export const PROBLEM_HEADER = "X-Ovio-Embed-Problem";

/** The embed drawn from the site's sample data, prerendered for every world. */
export const samplePath = (slug: EmbedSlug, world: World) => `/embed/${slug}/sample/${world}`;

/** The Markdown that puts an embed in a README, linked to the repo on GitHub. */
export const embedMarkdown = (origin: string, slug: EmbedSlug, subject: string, world: World) =>
  `[![${subject}](${origin}${embedPath(slug, subject, world)})](https://github.com/${subject})`;
