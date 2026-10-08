"use client";

import type { ComponentType } from "react";
import { initialsOf } from "@/components/shared/avatar";
import { useWorld, type World } from "@/components/shared/world-provider";
import { MinimalDeveloperIdCard } from "./worlds/minimal";
import { CraftDeveloperIdCard } from "./worlds/craft";
import { RetroDeveloperIdCard } from "./worlds/retro";
import { ToyDeveloperIdCard } from "./worlds/toy";

export type DeveloperIdCardProps = {
  /** Printed name. */
  name: string;
  variant?: World;
  /** Job title. */
  title?: string;
  /** Technologies, most important first. */
  stack?: string[];
  /** GitHub handle, without the @. The QR code opens this profile unless `url` is set. */
  github?: string;
  /** What the QR code opens. Defaults to the GitHub profile. */
  url?: string;
  /** Personal site, printed without the protocol ("jana.dev"). */
  website?: string;
  /** "Chennai, India". */
  location?: string;
  /** Open to work. Leave out to hide the status. */
  available?: boolean;
  /** Photo. Leave out (or let it fail) and initials are shown instead. */
  avatarUrl?: string;
  /** Card number, e.g. "024". */
  serial?: string;
  /** Year the developer started, printed in Craft ("Est. 2019"). */
  since?: number;
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

/** Square cells as one path: `M x y h1v1h-1z` per dark cell. */
export function cellsPath(cells: boolean[][]): string {
  let d = "";
  cells.forEach((row, y) =>
    row.forEach((on, x) => {
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }),
  );
  return d;
}

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

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
    name,
    initials: initialsOf(name),
    title,
    shortTitle: title?.replace(/^Senior\b/i, "Sr."),
    stack,
    profile: github ? `github.com/${github}` : undefined,
    website: website ? stripProtocol(website) : undefined,
    location,
    available,
    avatarUrl,
    serial,
    since,
    qrUrl: url ?? (github ? `https://github.com/${github}` : undefined),
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
