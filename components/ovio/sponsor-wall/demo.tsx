"use client";

import { SponsorWall, type Sponsor } from "./sponsor-wall";

/** Where every link in the demo goes. */
const SITE = "https://janasundar.vercel.app";

/** Who keeps lumen going. The companies are fictional, so their links go to the author's site. */
const SPONSORS: Sponsor[] = [
  { name: "Northwind", tier: "platinum", url: SITE },
  { name: "Kestrel Cloud", tier: "platinum", url: SITE },
  { name: "Orbit", tier: "gold", url: SITE },
  { name: "Hexa", tier: "gold", url: SITE },
  { name: "Tidal", tier: "gold", url: SITE },
  { name: "Quill", tier: "gold", url: SITE },
  { name: "@kiran", tier: "backer" },
  { name: "@sofia.dev", tier: "backer" },
  { name: "@tomasz", tier: "backer" },
  { name: "@noor", tier: "backer" },
  { name: "@amaru", tier: "backer" },
  { name: "@lin", tier: "backer" },
  { name: "@ezra", tier: "backer" },
  { name: "@bea", tier: "backer" },
];

export function SponsorWallDemo() {
  return <SponsorWall sponsors={SPONSORS} ctaHref={SITE} />;
}
