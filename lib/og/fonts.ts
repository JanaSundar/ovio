import { googleFonts } from "takumi-js/helpers";

/**
 * The OG images' typefaces, fetched once per build from Google Fonts: Archivo at its narrowest
 * and heaviest for headlines, DM Mono for labels, DM Sans for body text. Takumi registers only
 * the subsets an image actually uses.
 */
export const ogFonts = googleFonts([
  { name: "Archivo", weight: 900, axes: { wdth: 62 } },
  { name: "DM Mono", weight: [400, 500] },
  { name: "DM Sans", weight: [400, 500] },
]);
