import { notFound } from "next/navigation";
import { isLiveSlug } from "@/content/demo-sources";
import { DEMO_LOADERS } from "@/lib/demo-data";

// DEFAULT_REVALIDATE, written out because Next reads segment config statically.
export const revalidate = 3600;

// None at build time, so the build never calls an API; each is cached on its first request.
export const generateStaticParams = () => [];

export async function GET(_request: Request, { params }: RouteContext<"/api/demo/[slug]">) {
  const { slug } = await params;
  if (!isLiveSlug(slug)) notFound();
  try {
    return Response.json(await DEMO_LOADERS[slug]());
  } catch (e) {
    // null is cached for the hour like data, so a failing API is asked once an hour rather than
    // on every visit, and the demo shows its sample meanwhile.
    console.warn(`/api/demo/${slug}: ${e instanceof Error ? e.message : e}`);
    return Response.json(null);
  }
}
