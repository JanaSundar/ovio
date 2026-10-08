import { ImageResponse } from "takumi-js/response";
import { COMPONENTS } from "@/content/components";
import { ComponentArt } from "@/lib/og/art";
import { OG_SIZE, OgFrame } from "@/lib/og/card";
import { ogFonts } from "@/lib/og/fonts";

/** Rendered once at build time. */
export const dynamic = "force-static";

/** /og: the site's share image. */
export async function GET() {
  return new ImageResponse(
    <OgFrame
      title={["One component.", "Four worlds."]}
      footLeft={`${COMPONENTS.length}  COMPONENTS`}
      footRight="04  WORLDS"
      card={<ComponentArt slug="contribution-graph" />}
    />,
    { ...OG_SIZE, fonts: await ogFonts },
  );
}
