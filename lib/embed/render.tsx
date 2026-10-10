import "server-only";

import type { ReactElement } from "react";
import { render, renderSvg } from "takumi-js";
import {
  SAMPLE_DEVELOPER,
  SAMPLE_DOWNLOADS,
  SAMPLE_PACKAGE,
  SAMPLE_REPOSITORY,
} from "@/content/samples";
import { getDeveloper, getRepository } from "@/lib/github";
import { getWeeklyDownloads } from "@/lib/npm";
import { fetchOk, HttpError, RateLimitError } from "@/lib/ovio-fetch";
import { DeveloperIdCardEmbed } from "./developer-id-card";
import { embedFonts } from "./fonts";
import {
  PROBLEM_HEADER,
  type EmbedFormat,
  type EmbedProblem,
  type EmbedRequest,
  type EmbedSlug,
} from "./params";
import { col } from "./parts";
import { NpmDownloadsEmbed } from "./npm-downloads";
import { RepositoryCardEmbed } from "./repository-card";
import { MINIMAL } from "./tokens";
import type { World } from "@/lib/world";

/**
 * GitHub's image proxy and the CDN keep a good embed for an hour and serve the old one for a day
 * while it refreshes. A problem is kept five minutes, so a fixed typo shows up soon.
 */
const CACHE_OK = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";
const CACHE_PROBLEM = "public, max-age=300, s-maxage=300";

/** A sample is the same for every request, so it can be cached as long as the site lasts. */
const CACHE_SAMPLE = "public, max-age=86400, s-maxage=31536000";

/** Where an embed's data comes from, how it's drawn, and what to say when the subject is missing. */
type Source = {
  service: "GitHub" | "npm";
  missing: (subject: string) => string;
  live: (subject: string, world: World) => Promise<ReactElement>;
  sample: (world: World) => ReactElement;
};

/** A source from its fetch and drawing, so live and sample images are drawn the same way. */
function source<D>(s: {
  service: Source["service"];
  missing: Source["missing"];
  fetch: (subject: string) => Promise<D>;
  draw: (data: D, world: World) => ReactElement;
  sample: D;
}): Source {
  return {
    service: s.service,
    missing: s.missing,
    live: async (subject, world) => s.draw(await s.fetch(subject), world),
    sample: (world) => s.draw(s.sample, world),
  };
}

/** A remote image as a data URI, or undefined when it can't be read, so a card falls back. */
async function inline(url: string | undefined) {
  if (!url) return undefined;
  try {
    const res = await fetchOk(url, { timeout: 4000 });
    const type = res.headers.get("content-type") ?? "image/png";
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return undefined;
  }
}

/** The npm chart shows 12 weeks; the one before them gives the first week its change. */
const NPM_WEEKS = 13;

const SOURCES: Record<EmbedSlug, Source> = {
  "repository-card": source({
    service: "GitHub",
    missing: (repo) => `GitHub has no public repository "${repo}"`,
    fetch: getRepository,
    draw: (repo, world) => <RepositoryCardEmbed world={world} repo={repo} />,
    sample: SAMPLE_REPOSITORY,
  }),
  "npm-downloads": source({
    service: "npm",
    missing: (name) => `npm has no package "${name}"`,
    fetch: async (name) => ({ name, weeks: await getWeeklyDownloads(name, NPM_WEEKS) }),
    draw: ({ name, weeks }, world) => (
      <NpmDownloadsEmbed world={world} packageName={name} data={weeks} />
    ),
    sample: { name: SAMPLE_PACKAGE, weeks: SAMPLE_DOWNLOADS },
  }),
  "developer-id-card": source({
    service: "GitHub",
    missing: (login) => `GitHub has no user "${login}"`,
    fetch: async (login) => {
      const developer = await getDeveloper(login);
      return { ...developer, avatarUrl: await inline(developer.avatarUrl) };
    },
    draw: (developer, world) => <DeveloperIdCardEmbed world={world} developer={developer} />,
    sample: SAMPLE_DEVELOPER,
  }),
};

/** What went wrong, in words a README visitor can act on. */
function problemOf(e: unknown, { slug, subject }: EmbedRequest) {
  const { service, missing } = SOURCES[slug];
  if (e instanceof RateLimitError)
    return `${service} is busy right now. This image will be back soon.`;
  if (e instanceof HttpError && e.status === 404) return missing(subject);
  if (e instanceof HttpError && e.status === 422)
    return `"${subject}" is an organisation, not a developer`;
  return `Couldn't reach ${service}. This image will be back soon.`;
}

/** A small, quiet card that says what's wrong in place of the embed. */
function Problem({ message }: { message: string }) {
  return (
    <div
      style={{
        ...col,
        width: 420,
        gap: 6,
        padding: "18px 22px",
        background: MINIMAL.surface,
        border: `1px solid ${MINIMAL.line}`,
        borderRadius: 8,
        fontFamily: MINIMAL.font,
      }}
    >
      <span
        style={{ fontFamily: MINIMAL.mono, fontSize: 11, letterSpacing: 1, color: MINIMAL.faint }}
      >
        OVIO EMBED
      </span>
      <span style={{ fontSize: 14, lineHeight: 1.45, color: MINIMAL.ink }}>{message}</span>
    </div>
  );
}

async function image(
  node: ReactElement,
  world: World,
  format: EmbedFormat,
  headers: Record<string, string>,
) {
  const fonts = await embedFonts(world);
  const body =
    format === "svg"
      ? await renderSvg(node, { fonts })
      : await render(node, { fonts, format: "png", devicePixelRatio: 2 });
  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": format === "svg" ? "image/svg+xml; charset=utf-8" : "image/png",
      ...headers,
    },
  });
}

/** A problem card, drawn in Minimal whatever world was asked for. */
const problemImage = (message: string, format: EmbedFormat) =>
  image(<Problem message={message} />, "minimal", format, {
    "Cache-Control": CACHE_PROBLEM,
    [PROBLEM_HEADER]: "1",
  });

/**
 * An embed as an image response. Problems answer 200 with a card that explains them, since
 * GitHub's image proxy shows a broken image for any other status.
 */
export async function embedResponse(request: EmbedRequest | EmbedProblem) {
  if ("problem" in request) return problemImage(request.problem, request.format);
  let node: ReactElement;
  try {
    node = await SOURCES[request.slug].live(request.subject, request.world);
  } catch (e) {
    console.warn(
      `/embed/${request.slug}?${request.subject}: ${e instanceof Error ? e.message : e}`,
    );
    return problemImage(problemOf(e, request), request.format);
  }
  return image(node, request.world, request.format, { "Cache-Control": CACHE_OK });
}

/** An embed of the site's sample data, for the docs preview when the API can't answer. */
export const sampleResponse = (slug: EmbedSlug, world: World) =>
  image(SOURCES[slug].sample(world), world, "svg", { "Cache-Control": CACHE_SAMPLE });
