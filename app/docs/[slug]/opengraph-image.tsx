import { notFound } from "next/navigation";
import { ImageResponse } from "takumi-js/response";
import { COMPONENTS } from "@/content/components";
import { ComponentArt } from "@/lib/og/art";
import { OG_SIZE, OgFrame, splitTitle } from "@/lib/og/card";
import { ogFonts } from "@/lib/og/fonts";

export const alt = "An Ovio component: its name, what it does, and a drawing of it";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return COMPONENTS.map(({ slug }) => ({ slug }));
}

/** Each component's card: its name, what it does, and a drawing of it. */
export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = COMPONENTS.findIndex((c) => c.slug === slug);
  if (i < 0) notFound();
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
    { ...size, fonts: await ogFonts },
  );
}
