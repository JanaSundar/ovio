import { notFound } from "next/navigation";
import { isLiveSlug } from "@/content/demo-sources";
import { DEMO_LOADERS } from "@/lib/demo-data";

// DEFAULT_REVALIDATE, written out because Next reads segment config statically. A failed refresh
// throws, so Next keeps serving the last good response and the demo falls back only on a cold miss.
export const revalidate = 3600;

// None at build time, so the build never calls an API; each is cached on its first request.
export const generateStaticParams = () => [];

export async function GET(_request: Request, { params }: RouteContext<"/api/demo/[slug]">) {
  const { slug } = await params;
  if (!isLiveSlug(slug)) notFound();
  return Response.json(await DEMO_LOADERS[slug]());
}
