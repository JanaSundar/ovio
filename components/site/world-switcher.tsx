"use client";

import { LiquidTabs } from "@/components/ovio/liquid-tabs/liquid-tabs";
import { WORLD_INFO } from "@/content/worlds";
import { useSiteWorld } from "./site-world";

const LABELS = WORLD_INFO.map((w) => w.id[0].toUpperCase() + w.id.slice(1));

/** The site's world picker over the live specimens: Ovio's own Liquid Tabs, in Minimal. */
export function WorldSwitcher() {
  const { world, setWorld } = useSiteWorld();
  return (
    <LiquidTabs
      variant="minimal"
      className="world-tabs"
      label="Design world"
      tabs={LABELS}
      value={WORLD_INFO.findIndex((w) => w.id === world)}
      onValueChange={(i) => setWorld(WORLD_INFO[i].id)}
    />
  );
}
