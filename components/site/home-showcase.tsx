"use client";

import { useWorld } from "@/components/shared/world-provider";
import { worldInfo } from "@/content/worlds";
import { Demo, DEMOS } from "./demos";
import { PreviewFrame } from "./preview-frame";

/** The homepage stage: the Contribution Graph in the selected world, as in the mockup. */
export function HomeShowcase() {
  const world = useWorld();
  return (
    <>
      <PreviewFrame minHeight={DEMOS["contribution-graph"].minHeight}>
        <Demo slug="contribution-graph" />
      </PreviewFrame>
      <div className="flex flex-wrap justify-between gap-4 px-0.5 pt-3.5 text-xs text-muted">
        <span>
          &lt;ContributionGraph variant=&quot;{world}&quot; /&gt;, {worldInfo(world).note}
        </span>
        <span className="font-mono">Press 1–4 to switch</span>
      </div>
    </>
  );
}
