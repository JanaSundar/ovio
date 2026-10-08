"use client";

import { useWorld } from "@/components/shared/world-provider";
import { worldInfo } from "@/content/worlds";
import { PreviewFrame } from "../preview-frame";
import { WorldSwitcher } from "../world-switcher";
import { CraftNotFound } from "./craft";
import { MinimalNotFound } from "./minimal";
import { RetroNotFound } from "./retro";
import { ToyNotFound } from "./toy";

/** The missing page, drawn by the world on stage. */
function Art() {
  switch (useWorld()) {
    case "craft":
      return <CraftNotFound />;
    case "retro":
      return <RetroNotFound />;
    case "toy":
      return <ToyNotFound />;
    default:
      return <MinimalNotFound />;
  }
}

/** The 404 stage: world tabs, the world's take on the missing page, and its caption. */
export function NotFoundStage() {
  const world = useWorld();
  return (
    <>
      <div className="section-kicker">
        <p className="eyebrow">Live specimen</p>
        <WorldSwitcher />
      </div>
      <PreviewFrame minHeight={470}>
        <Art />
      </PreviewFrame>
      <div className="preview-caption">
        <span>
          &lt;NotFound variant=&quot;<b>{world}</b>&quot; /&gt;
        </span>
        <span>{worldInfo(world).tagline}</span>
      </div>
    </>
  );
}
