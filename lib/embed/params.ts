import { WORLDS, type World } from "../world";

// GitHub's own rules: logins are 1–39 letters, digits or single hyphens; repo names add . and _.
const LOGIN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const REPO = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}\/[\w.-]{1,100}$/i;
// npm's: lowercase, URL-safe, an optional @scope/, 214 characters at most.
const PACKAGE = /^(?=.{1,214}$)(?:@[a-z\d~-][\w.~-]*\/)?[a-z\d~-][\w.~-]*$/;

type EmbedDef = {
  /** The query parameter that names the subject. */
  param: string;
  example: string;
  /** The docs page's label for the subject field. */
  field: string;
  /** What a subject must look like, and what to call one that doesn't. */
  pattern: RegExp;
  noun: string;
  /** Where the image links to in a README. */
  href: (subject: string) => string;
};

/**
 * The components with a README embed. Only those whose data a public API gives for anyone, with
 * no token of theirs: a user's contributions need GitHub's GraphQL API and a token, so the
 * Contribution Graph has none.
 */
export const EMBEDS = {
  "repository-card": {
    param: "repo",
    example: "JanaSundar/ovio",
    field: "Repository",
    pattern: REPO,
    noun: "GitHub owner/name",
    href: (repo) => `https://github.com/${repo}`,
  },
  "npm-downloads": {
    param: "package",
    example: "hono",
    field: "npm package",
    pattern: PACKAGE,
    noun: "npm package name",
    href: (name) => `https://www.npmjs.com/package/${name}`,
  },
  "developer-id-card": {
    param: "user",
    example: "JanaSundar",
    field: "GitHub username",
    pattern: LOGIN,
    noun: "GitHub username",
    href: (login) => `https://github.com/${login}`,
  },
} as const satisfies Record<string, EmbedDef>;

export type EmbedSlug = keyof typeof EMBEDS;
export type EmbedFormat = "svg" | "png";

export type EmbedRequest = { slug: EmbedSlug; subject: string; world: World; format: EmbedFormat };

/** A query that doesn't make sense, said as a sentence, in the format the image was asked for. */
export type EmbedProblem = { problem: string; format: EmbedFormat };

// Own keys only: "constructor" or "toString" are in every object, and aren't embeds.
export const isEmbedSlug = (slug: string): slug is EmbedSlug => Object.hasOwn(EMBEDS, slug);

/**
 * Reads an embed URL's query: the subject (?repo=, ?package= or ?user=), the world (default minimal) and
 * the format (default svg). Says what's wrong when the query doesn't make sense.
 */
export function parseEmbed(slug: EmbedSlug, query: URLSearchParams): EmbedRequest | EmbedProblem {
  const { param, example, pattern, noun } = EMBEDS[slug];
  const asked = query.get("format") ?? "svg";
  const format: EmbedFormat = asked === "png" ? "png" : "svg";
  const problem = (text: string): EmbedProblem => ({ problem: text, format });

  if (asked !== "svg" && asked !== "png") return problem("format must be svg or png");
  const subject = query.get(param)?.trim() ?? "";
  if (!subject) return problem(`Add ?${param}=${example} to the URL`);
  if (!pattern.test(subject)) return problem(`"${subject.slice(0, 60)}" is not a ${noun}`);
  const world = query.get("world") ?? "minimal";
  if (!(WORLDS as readonly string[]).includes(world))
    return problem(`world must be one of ${WORLDS.join(", ")}`);

  return { slug, subject, world: world as World, format };
}

/** An embed's path and query, "/embed/repository-card?repo=owner/name&world=toy". */
export function embedPath(slug: EmbedSlug, subject: string, world: World) {
  const query = new URLSearchParams({ [EMBEDS[slug].param]: subject });
  if (world !== "minimal") query.set("world", world);
  // A slash and an @ are safe in a query, and owner/name and @scope/name read better unescaped.
  return `/embed/${slug}?${query.toString().replace("%2F", "/").replace("%40", "@")}`;
}

/** Problem cards say so in this header, so the docs preview can show the sample in their place. */
export const PROBLEM_HEADER = "X-Ovio-Embed-Problem";

/** The embed drawn from the site's sample data, prerendered for every world. */
export const samplePath = (slug: EmbedSlug, world: World) => `/embed/${slug}/sample/${world}`;

/** The Markdown that puts an embed in a README, linked to its subject on GitHub or npm. */
export const embedMarkdown = (origin: string, slug: EmbedSlug, subject: string, world: World) =>
  `[![${subject}](${origin}${embedPath(slug, subject, world)})](${EMBEDS[slug].href(subject)})`;
