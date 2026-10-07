"use client";

import { useState } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { worldInfo } from "@/content/worlds";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";
import { CodeExplorer, type SourceFile } from "./code-explorer";
import { Demo, DEMOS } from "./demos";
import { PreviewFrame } from "./preview-frame";

/** Preview and Code tabs over a component's demo and its installed source. */
export function ComponentPreview({
  slug,
  name,
  phase,
  files,
}: {
  slug: string;
  name: string;
  phase: number;
  files: SourceFile[];
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const demo = DEMOS[slug];

  return (
    <div className="flex flex-col gap-3">
      {files.length > 0 && (
        <div role="tablist" aria-label="View" className="flex gap-1 text-[13px]">
          {(["preview", "code"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "cursor-pointer rounded-md border-0 px-3 py-1.5 capitalize",
                tab === t ? "bg-paper-2 text-ink" : "bg-transparent text-muted hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      {tab === "preview" ? (
        <PreviewFrame minHeight={demo?.minHeight ?? 400}>
          {demo ? (
            <Demo slug={slug} />
          ) : (
            <div className="flex flex-col items-center gap-2 text-center font-(family-name:--ovio-font) text-(--ovio-ink)">
              <span className="text-lg">{name}</span>
              <span className="text-sm opacity-60">Lands in phase {phase} of the build.</span>
            </div>
          )}
        </PreviewFrame>
      ) : (
        <CodeExplorer files={files} />
      )}
    </div>
  );
}

/** The usage snippet in the selected world, highlighted per world on the server. */
export function UsageSnippet({ html }: { html: Record<World, string> }) {
  return <CodeBlock html={html[useWorld()]} className="rounded-[10px]" />;
}

export function MotionInfo({ tech }: { tech: string }) {
  const info = worldInfo(useWorld());
  return (
    <div className="grid grid-cols-2 rounded-[10px] border border-[rgba(22,22,20,.12)] bg-white">
      <div className="border-r border-[rgba(22,22,20,.08)] px-4 py-3.5">
        <div className="mb-1.5 text-[11px] text-muted">Renders with</div>
        <div className="text-[13px]">{tech}</div>
      </div>
      <div className="px-4 py-3.5">
        <div className="mb-1.5 text-[11px] text-muted">Motion in {info.label}</div>
        <div className="text-[13px]">{info.motion}</div>
      </div>
    </div>
  );
}
