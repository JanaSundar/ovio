import { notFound } from "next/navigation";
import { isLiveSlug } from "@/content/demo-sources";
import { demoResponse } from "@/lib/demo-data";

// DEFAULT_REVALIDATE, written out because Next reads segment config statically.
export const revalidate = 3600;

// None at build time, so the build never calls an API; each is cached on its first request.
export const generateStaticParams = () => [];

export async function GET(_request: Request, { params }: RouteContext<"/api/demo/[slug]">) {
  const { slug } = await params;
  if (!isLiveSlug(slug) || slug === "now-playing") notFound();
  return demoResponse(slug);
}
