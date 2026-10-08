import { ImageResponse } from "takumi-js/response";
import { COMPONENTS } from "@/content/components";
import { ComponentArt } from "@/lib/og/art";
import { OG_SIZE, OgFrame } from "@/lib/og/card";
import { ogFonts } from "@/lib/og/fonts";

export const alt = "Ovio — One component. Four worlds.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    <OgFrame
      title={["One component.", "Four worlds."]}
      footLeft={`${COMPONENTS.length}  COMPONENTS`}
      footRight="04  WORLDS"
      card={<ComponentArt slug="contribution-graph" />}
    />,
    { ...size, fonts: await ogFonts },
  );
}
