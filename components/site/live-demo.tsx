"use client";

import { useEffect, type ReactNode } from "react";
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
  children,
}: {
  slug: S;
  fallback: DemoData[S];
  children: (data: DemoData[S], live: boolean) => ReactNode;
}) {
  const { status, data } = useLiveData(demoUrl(slug), fallback);
  useEffect(() => {
    if (status === "error") track("demo_data_failed", { component_slug: slug });
  }, [status, slug]);

  if (status === "idle" || status === "loading")
    return <div role="status" aria-label="Loading live data" className="demo-skeleton" />;

  const live = status === "live";
  return (
    <>
      <span className="demo-source" data-live={live || undefined}>
        {live ? `Live · ${DEMO_TARGETS[slug]}` : "Sample data"}
      </span>
      {children(data, live)}
    </>
  );
}
