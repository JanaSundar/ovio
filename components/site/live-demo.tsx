"use client";

import type { ReactNode } from "react";
import { DEMO_TARGETS, demoUrl, type LiveSlug } from "@/content/demo-sources";
import { track } from "@/lib/analytics";
import type { DemoData } from "@/lib/demo-data";
import { useLiveData } from "@/lib/use-live-data";

/**
 * A demo on real data from /api/demo: a skeleton while it loads, the local sample if it fails,
 * and a label in the stage saying which one is showing.
 */
export function LiveDemo<S extends LiveSlug>({
  slug,
  fallback,
  refreshMs,
  source = () => DEMO_TARGETS[slug],
  children,
}: {
  slug: S;
  fallback: DemoData[S];
  refreshMs?: number;
  /** What the live label names; the demo's target by default. */
  source?: (data: DemoData[S]) => string;
  children: (data: DemoData[S], live: boolean) => ReactNode;
}) {
  const { status, data } = useLiveData(demoUrl(slug), fallback, {
    refreshMs,
    onError: () => track("demo_data_failed", { component_slug: slug }),
  });

  if (status === "idle" || status === "loading")
    return <div role="status" aria-label="Loading live data" className="demo-skeleton" />;

  const live = status === "live";
  return (
    <>
      <DemoLabel live={live}>{live ? `Live · ${source(data)}` : "Sample data"}</DemoLabel>
      {children(data, live)}
    </>
  );
}

/** Says in the stage, in the selected world's type, whether the demo is live or a sample. */
export function DemoLabel({ live, children }: { live?: boolean; children: ReactNode }) {
  return (
    <span className="demo-source" data-live={live || undefined}>
      {children}
    </span>
  );
}
