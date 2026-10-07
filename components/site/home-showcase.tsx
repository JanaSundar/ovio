"use client";

import { useWorld } from "@/components/shared/world-provider";
import { worldInfo } from "@/content/worlds";
import { Demo } from "./demos";
import { PreviewFrame } from "./preview-frame";

/**
 * The homepage stage. The mockup shows the Contribution Graph here; until it lands (Phase 2)
 * the three pilot components fill the stage in the selected world.
 */
export function HomeShowcase() {
  const world = useWorld();
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <PreviewFrame minHeight={420} className="lg:col-span-2">
          <Demo slug="gooey-tabs" />
        </PreviewFrame>
        <PreviewFrame minHeight={460}>
          <Demo slug="repository-card" />
        </PreviewFrame>
        <PreviewFrame minHeight={460}>
          <Demo slug="physical-knob" />
        </PreviewFrame>
      </div>
      <div className="flex flex-wrap justify-between gap-4 px-0.5 pt-3.5 text-xs text-muted">
        <span>
          &lt;GooeyTabs /&gt;, &lt;RepositoryCard /&gt; and &lt;PhysicalKnob /&gt; with
          variant=&quot;
          {world}&quot;, {worldInfo(world).note}
        </span>
        <span className="font-mono">Press 1–4 to switch</span>
      </div>
    </>
  );
}
