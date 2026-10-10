"use client";

import { MotionConfig } from "motion/react";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { OvioProvider, useWorld, type World } from "@/components/shared/world-provider";
import { WORLDS } from "@/lib/world";
import { worldInfo } from "@/content/worlds";
import { CodeBlock } from "./code-block";
import { CodeExplorer, type SourceFile } from "./code-explorer";
import { useCopy } from "./copy-command";
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
  const [compare, setCompare] = useState(false);
  const [reduced, setReduced] = useState(false);
  const world = useWorld();
  const demo = DEMOS[slug];
  const minHeight = demo?.minHeight ?? 400;

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
      {tab === "preview" && (
        <div className="preview-tools">
          <button
            type="button"
            aria-pressed={compare}
            onClick={() => {
              const enabled = !compare;
              setCompare(enabled);
              track("preview_compare_toggled", { component_slug: slug, enabled });
            }}
          >
            {compare ? "Single world" : "Compare four worlds"}
          </button>
          <button
            type="button"
            aria-pressed={reduced}
            onClick={() => {
              const next = !reduced;
              setReduced(next);
              track("preview_motion_toggled", { component_slug: slug, reduced: next });
            }}
          >
            {reduced ? "Motion follows system" : "Reduce motion"}
          </button>
        </div>
      )}
      <MotionConfig reducedMotion={reduced ? "always" : "user"}>
        {tab === "preview" ? (
          compare ? (
            <div className="world-compare">
              {WORLDS.map((w) => (
                <figure key={w}>
                  <figcaption>{worldInfo(w).label}</figcaption>
                  <OvioProvider world={w}>
                    <PreviewFrame minHeight={Math.min(minHeight, 380)}>
                      <Demo slug={slug} />
                    </PreviewFrame>
                  </OvioProvider>
                </figure>
              ))}
            </div>
          ) : (
            <PreviewFrame minHeight={minHeight}>
              <Demo slug={slug} />
            </PreviewFrame>
          )
        ) : (
          <CodeExplorer files={files} />
        )}
      </MotionConfig>
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
export function UsageSnippet({
  slug,
  html,
  source,
}: {
  slug: string;
  html: Record<World, string>;
  source: Record<World, string>;
}) {
  const world = useWorld();
  const { copied, copy } = useCopy();
  return (
    <>
      <div className="snippet-tabs">
        <span className="active">TSX</span>
        <span className="spacer">variant=&quot;{world}&quot;</span>
        <button
          type="button"
          onClick={() => {
            copy(source[world]);
            track("usage_snippet_copied", { component_slug: slug, design_world: world });
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
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
