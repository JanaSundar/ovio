"use client";

import dynamic from "next/dynamic";
import { useState, type ComponentType } from "react";
import { Canvas, type CanvasTone } from "../playables/stage";

const Loading = () => (
  <div
    role="status"
    aria-label="Loading recipe"
    className="h-64 w-full max-w-3xl animate-pulse rounded-2xl bg-black/10"
  />
);

/** Each recipe's section, loaded when its page opens. */
const VIEWS: Record<string, ComponentType> = {
  "repository-activity": dynamic(
    () => import("./repository-activity").then((m) => m.RepositoryActivity),
    { loading: Loading },
  ),
  "contextual-actions": dynamic(
    () => import("./contextual-actions").then((m) => m.ContextualActions),
    { loading: Loading },
  ),
  "launch-announcement": dynamic(
    () => import("./launch-announcement").then((m) => m.LaunchAnnouncement),
    { loading: Loading },
  ),
};

/** A recipe running on a page-like canvas, light by default with a dark check. */
export function RecipeStage({ slug }: { slug: string }) {
  const [tone, setTone] = useState<CanvasTone>("light");
  const View = VIEWS[slug];
  return (
    <div className="overflow-hidden rounded-2xl border border-seam bg-deck">
      <div className="flex items-center justify-between gap-3 border-b border-seam px-3 py-2">
        <span className="font-mono text-[11px] text-haze">Live recipe · sample data</span>
        <div role="group" aria-label="Canvas" className="flex rounded-md border border-seam p-0.5">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tone === t}
              onClick={() => setTone(t)}
              className={`h-6 rounded px-2 font-mono text-[11px] capitalize ${tone === t ? "bg-lift text-snow" : "text-haze hover:text-snow"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <Canvas tone={tone} variant="minimal" className="min-h-[420px] px-4 py-10 sm:px-8">
        {View ? <View /> : <p className="text-sm text-haze">This recipe has no preview.</p>}
      </Canvas>
    </div>
  );
}
