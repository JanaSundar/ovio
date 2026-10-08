"use client";

import { useState } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { worldInfo } from "@/content/worlds";
import { CodeBlock } from "./code-block";
import { CodeExplorer, type SourceFile } from "./code-explorer";
import { Demo, DEMOS } from "./demos";
import { PreviewFrame } from "./preview-frame";
import { WorldSwitcher } from "./world-switcher";

/** Preview and Code tabs over a component's demo and its installed source, with the world tabs. */
export function ComponentPreview({
  slug,
  name,
  exportName,
  phase,
  files,
}: {
  slug: string;
  name: string;
  exportName: string;
  phase: number;
  files: SourceFile[];
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const world = useWorld();
  const demo = DEMOS[slug];

  return (
    <>
      <div className="section-kicker">
        {files.length > 0 ? (
          <div role="tablist" aria-label="View" className="snippet-tabs border-b-0!">
            {(["preview", "code"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
              >
                {t === "preview" ? "Live specimen" : "Source"}
              </button>
            ))}
          </div>
        ) : (
          <p className="eyebrow">Live specimen</p>
        )}
        <WorldSwitcher />
      </div>
      {tab === "preview" ? (
        <PreviewFrame minHeight={demo?.minHeight ?? 400}>
          {demo ? (
            <Demo slug={slug} />
          ) : (
            <div className="empty-stage">
              <span className="text-lg">{name}</span>
              <span className="text-sm opacity-60">Lands in phase {phase} of the build.</span>
            </div>
          )}
        </PreviewFrame>
      ) : (
        <CodeExplorer files={files} />
      )}
      <div className="preview-caption">
        <span>
          &lt;{exportName} variant=&quot;<b>{world}</b>&quot; /&gt;
        </span>
        <span>{worldInfo(world).tagline}</span>
      </div>
    </>
  );
}

/** The usage snippet in the selected world, highlighted per world on the server. */
export function UsageSnippet({ html }: { html: Record<World, string> }) {
  const world = useWorld();
  return (
    <>
      <div className="snippet-tabs">
        <span className="active">TSX</span>
        <span className="spacer">variant=&quot;{world}&quot;</span>
      </div>
      <CodeBlock html={html[world]} className="px-4 py-4 text-[13px] leading-[1.7]" />
    </>
  );
}

export function MotionInfo({ tech }: { tech: string }) {
  const info = worldInfo(useWorld());
  return (
    <p className="motion-line">
      <b>Built with:</b> {tech}
      <br />
      <b>Motion in {info.label[0] + info.label.slice(1).toLowerCase()}:</b> {info.motion}
    </p>
  );
}
