"use client";

import { SponsorWall, type Sponsor } from "./sponsor-wall";

/** Who keeps lumen going. The companies are fictional; .example links never resolve. */
const SPONSORS: Sponsor[] = [
  { name: "Northwind", tier: "platinum", url: "https://northwind.example" },
  { name: "Kestrel Cloud", tier: "platinum", url: "https://kestrel.example" },
  { name: "Orbit", tier: "gold", url: "https://orbit.example" },
  { name: "Hexa", tier: "gold", url: "https://hexa.example" },
  { name: "Tidal", tier: "gold", url: "https://tidal.example" },
  { name: "Quill", tier: "gold", url: "https://quill.example" },
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
  return <SponsorWall sponsors={SPONSORS} ctaHref="https://github.com/sponsors/ada-dev" />;
}
