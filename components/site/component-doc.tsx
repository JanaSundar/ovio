"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
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
  exportName,
  files,
}: {
  slug: string;
  exportName: string;
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
                onClick={() => {
                  if (tab === t) return;
                  setTab(t);
                  track("component_view_changed", {
                    component_slug: slug,
                    view: t,
                  });
                }}
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
          <Demo slug={slug} />
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
