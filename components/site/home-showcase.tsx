"use client";

import { useWorld } from "@/components/shared/world-provider";
import { worldInfo } from "@/content/worlds";
import { Demo, DEMOS } from "./demos";
import { PreviewFrame } from "./preview-frame";
import { WorldSwitcher } from "./world-switcher";

/** The homepage specimen: the Event Ticket in the selected world. */
export function HomeShowcase() {
  const world = useWorld();
  return (
    <div className="sample-wrap">
      <div className="sample-top">
        <span>Event ticket / live renderer</span>
        <WorldSwitcher />
      </div>
      <PreviewFrame minHeight={DEMOS["event-ticket"].minHeight}>
        <Demo slug="event-ticket" />
      </PreviewFrame>
      <div className="specimen-caption">
        <span>
          &lt;EventTicket variant=&quot;<strong>{world}</strong>&quot; /&gt;
        </span>
        <span>{worldInfo(world).tagline}</span>
      </div>
    </div>
  );
}
