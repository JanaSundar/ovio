import { ImageResponse } from "takumi-js/response";
import { COMPONENTS } from "@/content/components";
import { ComponentArt } from "@/lib/og/art";
import { OG_SIZE, OgFrame, splitTitle } from "@/lib/og/card";
import { ogFonts } from "@/lib/og/fonts";

/** One image per component, all rendered at build time; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPONENTS.map(({ slug }) => ({ slug }));
}

/** /og/<slug>: a component's share image, with its name, description and a drawing of it. */
export async function GET(_request: Request, { params }: RouteContext<"/og/[slug]">) {
  const { slug } = await params;
  const i = COMPONENTS.findIndex((c) => c.slug === slug);
  const c = COMPONENTS[i];
  const pad = (n: number) => String(n).padStart(2, "0");

  return new ImageResponse(
    <OgFrame
      title={splitTitle(c.name)}
      description={c.description}
      footLeft={`${pad(i + 1)} / ${pad(COMPONENTS.length)}  COMPONENTS`}
      footRight="04  WORLDS"
      card={<ComponentArt slug={c.slug} />}
    />,
    { ...OG_SIZE, fonts: await ogFonts },
  );
}
