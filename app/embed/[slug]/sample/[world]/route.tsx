import { notFound } from "next/navigation";
import { EMBEDS, isEmbedSlug } from "@/lib/embed/params";
import { sampleResponse } from "@/lib/embed/render";
import { WORLDS, type World } from "@/lib/world";

/** Every sample is drawn at build time; there is nothing else to serve here. */
export const dynamicParams = false;

export const generateStaticParams = () =>
  Object.keys(EMBEDS).flatMap((slug) => WORLDS.map((world) => ({ slug, world })));

/** /embed/<slug>/sample/<world>: the embed drawn from the site's sample data, for the docs. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/embed/[slug]/sample/[world]">,
) {
  const { slug, world } = await params;
  if (!isEmbedSlug(slug) || !WORLDS.includes(world as World)) notFound();
  return sampleResponse(slug, world as World);
}
