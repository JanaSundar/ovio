"use client";

import type { ComponentType } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { readIdCard } from "./card";
import type { Developer } from "./types";
import { MinimalDeveloperIdCard } from "./worlds/minimal";
import { CraftDeveloperIdCard } from "./worlds/craft";
import { RetroDeveloperIdCard } from "./worlds/retro";
import { ToyDeveloperIdCard } from "./worlds/toy";

export type { Developer } from "./types";

export type DeveloperIdCardProps = Developer & {
  variant?: World;
  /** What the QR code opens. Defaults to the GitHub profile. */
  url?: string;
  className?: string;
};

/** Everything a world needs to draw the card. Worlds only render; data is derived here. */
export type DeveloperIdCardWorldProps = {
  name: string;
  initials: string;
  title?: string;
  /** The title with "Senior" shortened to "Sr.", for the tighter worlds. */
  shortTitle?: string;
  stack: string[];
  /** "github.com/jana". */
  profile?: string;
  website?: string;
  location?: string;
  available?: boolean;
  avatarUrl?: string;
  serial?: string;
  since?: number;
  /** What the QR code encodes. Absent when there is nothing to encode. */
  qrUrl?: string;
  className?: string;
};

const VIEWS = {
  minimal: MinimalDeveloperIdCard,
  craft: CraftDeveloperIdCard,
  retro: RetroDeveloperIdCard,
  toy: ToyDeveloperIdCard,
} satisfies Record<World, ComponentType<DeveloperIdCardWorldProps>>;

export function DeveloperIdCard({
  name,
  variant,
  title,
  stack = [],
  github,
  url,
  website,
  location,
  available,
  avatarUrl,
  serial,
  since,
  className,
}: DeveloperIdCardProps) {
  const world = useWorld(variant);

  const props: DeveloperIdCardWorldProps = {
    ...readIdCard({
      name,
      title,
      stack,
      github,
      url,
      website,
      location,
      available,
      avatarUrl,
      serial,
      since,
    }),
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
