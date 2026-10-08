"use client";

import { GooeyTabs } from "@/components/ovio/gooey-tabs/gooey-tabs";
import { WORLD_INFO } from "@/content/worlds";
import { useSiteWorld } from "./site-world";

const LABELS = WORLD_INFO.map((w) => w.id[0].toUpperCase() + w.id.slice(1));

/** The site's world picker over the live specimens: Ovio's own Gooey Tabs, in Minimal. */
export function WorldSwitcher() {
  const { world, setWorld } = useSiteWorld();
  return (
    <GooeyTabs
      variant="minimal"
      className="world-gooey"
      label="Design world"
      tabs={LABELS}
      value={WORLD_INFO.findIndex((w) => w.id === world)}
      onValueChange={(i) => setWorld(WORLD_INFO[i].id)}
    />
  );
}
