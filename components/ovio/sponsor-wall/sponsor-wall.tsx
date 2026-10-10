"use client";

import type { ComponentType } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { MinimalSponsorWall } from "./worlds/minimal";
import { CraftSponsorWall } from "./worlds/craft";
import { RetroSponsorWall } from "./worlds/retro";
import { ToySponsorWall } from "./worlds/toy";

/** Platinum sponsors get the biggest spot, backers the smallest. */
export type SponsorTier = "platinum" | "gold" | "backer";

export type Sponsor = {
  /** Shown as the sponsor's wordmark, e.g. "Northwind" or "@kiran". */
  name: string;
  tier: SponsorTier;
  /** Where the sponsor links to. Leave out for plain text. */
  url?: string;
};

export type SponsorWallProps = {
  sponsors: Sponsor[];
  variant?: World;
  /** Where "Become a sponsor" points, e.g. a GitHub Sponsors page. Leave out to hide it. */
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
};

export type PlacedSponsor = Sponsor & {
  key: string;
  /** Position across all tiers, biggest first. Worlds pick colours and tilts from it. */
  index: number;
};

export type SponsorGroup = {
  tier: SponsorTier;
  label: string;
  sponsors: PlacedSponsor[];
};

/** Everything a world needs to draw the wall. Worlds only render. */
export type SponsorWallWorldProps = {
  /** Non-empty tiers, platinum first. */
  groups: SponsorGroup[];
  ctaHref?: string;
  ctaLabel: string;
  className?: string;
};

const TIERS: SponsorTier[] = ["platinum", "gold", "backer"];

const TIER_LABEL: Record<SponsorTier, string> = {
  platinum: "Platinum",
  gold: "Gold",
  backer: "Backers",
};

/** Groups sponsors by tier, keeping their order within a tier. */
function groupSponsors(sponsors: Sponsor[]): SponsorGroup[] {
  let index = 0;
  return TIERS.map((tier) => {
    // A blank name would draw an empty sticker, tile or block.
    const members = sponsors.filter((s) => s.tier === tier && s.name.trim());
    return {
      tier,
      // "Backers" for a crowd, "Backer" for one.
      label: tier === "backer" && members.length === 1 ? "Backer" : TIER_LABEL[tier],
      sponsors: members.map((s) => ({ ...s, key: `${tier}:${index}:${s.name}`, index: index++ })),
    };
  }).filter((g) => g.sponsors.length > 0);
}

const VIEWS = {
  minimal: MinimalSponsorWall,
  craft: CraftSponsorWall,
  retro: RetroSponsorWall,
  toy: ToySponsorWall,
} satisfies Record<World, ComponentType<SponsorWallWorldProps>>;

export function SponsorWall({
  sponsors,
  variant,
  ctaHref,
  ctaLabel = "Become a sponsor",
  className,
}: SponsorWallProps) {
  const world = useWorld(variant);
  const props: SponsorWallWorldProps = {
    groups: groupSponsors(sponsors),
    ctaHref,
    ctaLabel,
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
