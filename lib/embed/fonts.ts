import { googleFonts } from "takumi-js/helpers";
import type { World } from "@/lib/world";
import { WORLD_FONTS } from "./tokens";

type Fonts = Awaited<ReturnType<typeof googleFonts>>;

/** The weights the drawings use, by family. */
const WEIGHTS: Record<string, number | number[]> = {
  Geist: [400, 500],
  "Geist Mono": [400, 500],
  "Bricolage Grotesque": [400, 800],
  Caveat: 700,
  "IBM Plex Mono": 500,
  VT323: 400,
  Archivo: [500, 800],
};

const cache = new Map<World, Promise<Fonts>>();

/**
 * A world's typefaces for its embeds, fetched from Google Fonts on its first embed and kept, so
 * a Retro image never waits on Craft's three families. A failed fetch is retried on the next one.
 */
export function embedFonts(world: World): Promise<Fonts> {
  let fonts = cache.get(world);
  if (!fonts) {
    fonts = googleFonts(WORLD_FONTS[world].map((name) => ({ name, weight: WEIGHTS[name] })));
    fonts.catch(() => cache.delete(world));
    cache.set(world, fonts);
  }
  return fonts;
}
