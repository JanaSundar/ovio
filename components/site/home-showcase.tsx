"use client";

import { useWorld } from "@/components/shared/world-provider";
import { worldInfo } from "@/content/worlds";
import { Demo, DEMOS } from "./demos";
import { PreviewFrame } from "./preview-frame";
import { WorldSwitcher } from "./world-switcher";

/** The homepage specimen: the Contribution Graph in the selected world. */
export function HomeShowcase() {
  const world = useWorld();
  return (
    <div className="sample-wrap">
      <div className="sample-top">
        <span>Contribution graph / live renderer</span>
        <WorldSwitcher />
      </div>
      <PreviewFrame minHeight={DEMOS["contribution-graph"].minHeight}>
        <Demo slug="contribution-graph" />
      </PreviewFrame>
      <div className="specimen-caption">
        <span>
          &lt;ContributionGraph variant=&quot;<strong>{world}</strong>&quot; /&gt;
        </span>
        <span>{worldInfo(world).tagline}</span>
      </div>
    </div>
  );
}
