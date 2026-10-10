import "server-only";

import type { ReactElement } from "react";
import { render, renderSvg } from "takumi-js";
import type { Repository } from "@/components/ovio/repository-card/repository-card";
import { SAMPLE_REPOSITORY } from "@/content/samples";
import { getRepository } from "@/lib/github";
import { HttpError, RateLimitError } from "@/lib/ovio-fetch";
import { embedFonts } from "./fonts";
import {
  PROBLEM_HEADER,
  type EmbedFormat,
  type EmbedProblem,
  type EmbedRequest,
  type EmbedSlug,
} from "./params";
import { col } from "./parts";
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

/** An embed's data, fetched for a live image or taken from the site's samples. */
type EmbedData = { repo: Repository };

const draw = ({ repo }: EmbedData, world: World): ReactElement => (
  <RepositoryCardEmbed world={world} repo={repo} />
);

const fetchData = async ({ subject }: EmbedRequest): Promise<EmbedData> => ({
  repo: await getRepository(subject),
});

/** The site's sample data, the same that its demos fall back to. */
const SAMPLES: Record<EmbedSlug, EmbedData> = {
  "repository-card": { repo: SAMPLE_REPOSITORY },
};

/** What went wrong, in words a README visitor can act on. */
function problemOf(e: unknown, subject: string) {
  if (e instanceof RateLimitError) return "GitHub is busy right now. This image will be back soon.";
  if (e instanceof HttpError && e.status === 404)
    return `GitHub has no public repository "${subject}"`;
  return "Couldn't reach GitHub. This image will be back soon.";
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
  let data: EmbedData;
  try {
    data = await fetchData(request);
  } catch (e) {
    console.warn(
      `/embed/${request.slug}?${request.subject}: ${e instanceof Error ? e.message : e}`,
    );
    return problemImage(problemOf(e, request.subject), request.format);
  }
  return image(draw(data, request.world), request.world, request.format, {
    "Cache-Control": CACHE_OK,
  });
}

/** An embed of the site's sample data, for the docs preview when GitHub can't answer. */
export const sampleResponse = (slug: EmbedSlug, world: World) =>
  image(draw(SAMPLES[slug], world), world, "svg", { "Cache-Control": CACHE_SAMPLE });
