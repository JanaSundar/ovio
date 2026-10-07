"use client";

import { useState } from "react";
import { useWorld } from "@/components/shared/world-provider";
import { worldInfo } from "@/content/worlds";
import { cn } from "@/lib/utils";
import { Demo, DEMOS } from "./demos";
import { highlight } from "./highlight";
import { PlaygroundControls, propLines, usePlayground } from "./playground";
import { PreviewFrame } from "./preview-frame";

/** A source file with its highlighted markup, made on the server. */
export type SourceFile = { path: string; html: string };

/** A dark code block over highlighted token markup (see highlight.ts). */
export function CodeBlock({ html, className }: { html: string; className?: string }) {
  return (
    <pre
      className={cn(
        "m-0 overflow-auto bg-ink px-5 py-[18px] font-mono text-[13px] leading-[1.7] text-[#e6e4dd]",
        className,
      )}
    >
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}

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
  const [file, setFile] = useState(0);
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
        <>
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
          <PlaygroundControls />
        </>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-ink">
          <div className="flex gap-1 overflow-x-auto border-b border-[#2c2b28] px-2 pt-2">
            {files.map((f, i) => (
              <button
                key={f.path}
                type="button"
                onClick={() => setFile(i)}
                aria-pressed={file === i}
                className={cn(
                  "flex-none cursor-pointer rounded-t-md border-0 px-3 py-2 font-mono text-xs",
                  file === i
                    ? "bg-[#2c2b28] text-paper"
                    : "bg-transparent text-code-muted hover:text-paper",
                )}
              >
                {f.path.split("/").slice(-2).join("/")}
              </button>
            ))}
          </div>
          <CodeBlock html={files[file]?.html ?? ""} className="max-h-[560px] text-[12.5px]" />
        </div>
      )}
    </div>
  );
}

export function UsageSnippet({
  exportName,
  slug,
  usage,
}: {
  exportName: string;
  slug: string;
  usage: string;
}) {
  const world = useWorld();
  const code = [
    `import { ${exportName} } from "@/components/ovio/${slug}/${slug}"\n`,
    `<${exportName}`,
    `  variant="${world}"`,
    usage,
    ...propLines(usePlayground()),
    "/>",
  ].join("\n");
  return <CodeBlock html={highlight(code)} className="rounded-[10px]" />;
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
