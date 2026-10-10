import { notFound } from "next/navigation";
import { embedResponse } from "@/lib/embed/render";
import { isEmbedSlug, parseEmbed } from "@/lib/embed/params";

/**
 * /embed/<slug>?user=… or ?repo=…: a component as an image for a GitHub README, in any world
 * (&world=craft) as SVG or PNG (&format=png). The GitHub data is cached for an hour.
 */
export async function GET(request: Request, { params }: RouteContext<"/embed/[slug]">) {
  const { slug } = await params;
  if (!isEmbedSlug(slug)) notFound();
  return embedResponse(parseEmbed(slug, new URL(request.url).searchParams));
}
