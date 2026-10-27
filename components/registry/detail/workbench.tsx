"use client";

import { useState, type ReactNode } from "react";
import { getInteraction, importPathOf } from "@/content/interactions";
import { defaultsOf, sanitize, usageSnippet, type Values } from "@/lib/registry/controls";
import { cn } from "@/lib/utils";
import { propsOf, SPECS } from "../playables/specs";
import { Canvas, PlayableView, Unavailable, type CanvasTone } from "../playables/stage";
import { CodeView } from "../ui/code-view";
import { ControlsPanel } from "./controls-panel";

const VIEWPORTS = [
  { id: "fill", label: "Fill", width: undefined },
  { id: "tablet", label: "768px", width: 768 },
  { id: "mobile", label: "375px", width: 375 },
] as const;

type ViewportId = (typeof VIEWPORTS)[number]["id"];

/**
 * The working interaction with its controls and the snippet they produce. Mount it with a `key`
 * per interaction: its state belongs to one.
 */
export function Workbench({ slug, toolbarStart }: { slug: string; toolbarStart?: ReactNode }) {
  const item = getInteraction(slug);
  const spec = SPECS[slug];
  const [values, setValues] = useState<Values>(() => (spec ? defaultsOf(spec.controls) : {}));
  const [nonce, setNonce] = useState(0);
  const [viewport, setViewport] = useState<ViewportId>("fill");
  const [tone, setTone] = useState<CanvasTone>(spec?.canvas ?? "dark");

  if (!item || !spec) return <Unavailable>This interaction has no preview yet.</Unavailable>;

  const reset = () => {
    setValues(defaultsOf(spec.controls));
    setNonce((n) => n + 1);
  };
  const snippet = usageSnippet({
    exportName: item.exportName,
    importPath: importPathOf(item),
    usage: spec.usage,
    props: propsOf(spec, values),
    defaults: spec.defaults,
  });
  const width = VIEWPORTS.find((v) => v.id === viewport)?.width;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid overflow-hidden rounded-2xl border border-seam bg-deck lg:grid-cols-[minmax(0,1fr)_288px]">
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2 border-b border-seam px-3 py-2">
            {toolbarStart}
            <span className="flex items-center gap-1.5 rounded-md bg-azure/12 px-2 py-1 font-mono text-[11px] text-azure">
              <span aria-hidden className="size-1.5 rounded-full bg-azure" /> Web
            </span>
            <span
              className="font-mono text-[11px] text-haze"
              title="No React Native implementation exists yet"
            >
              No Expo version yet
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <Segmented
                label="Canvas"
                options={[
                  { id: "light", label: item.styles ? "Stage" : "Light" },
                  { id: "dark", label: "Dark" },
                ]}
                value={tone}
                onChange={(t) => setTone(t as CanvasTone)}
              />
              <Segmented
                label="Preview width"
                options={VIEWPORTS}
                value={viewport}
                onChange={(v) => setViewport(v as ViewportId)}
              />
              <button
                type="button"
                onClick={reset}
                className="h-7 rounded-md border border-seam px-2.5 text-xs text-mist transition-colors hover:text-snow"
              >
                Reset
              </button>
            </div>
          </div>
          <Canvas
            tone={tone}
            variant={item.styles ? String(values.variant ?? "minimal") : undefined}
            className="reg-scroll flex-1 overflow-x-auto px-4 py-10"
          >
            <div
              className={cn(
                "flex w-full justify-center transition-[max-width] duration-300",
                width && "rounded-xl outline outline-dashed outline-1 outline-black/15",
              )}
              style={{
                minHeight: spec.height - 80,
                maxWidth: width ?? "100%",
                alignItems: "center",
              }}
            >
              <PlayableView slug={slug} values={values} nonce={nonce} />
            </div>
          </Canvas>
        </div>
        <aside
          aria-label="Customize"
          className="reg-scroll max-h-[640px] overflow-y-auto border-t border-seam px-4 py-3 lg:border-t-0 lg:border-l"
          data-lenis-prevent
        >
          <h2 className="pt-1 pb-2 font-mono text-[10.5px] tracking-[0.14em] text-haze uppercase">
            Customize
          </h2>
          <ControlsPanel
            controls={spec.controls}
            values={values}
            onChange={(prop, v) => {
              const control = spec.controls.find((c) => c.prop === prop)!;
              setValues((prev) => ({ ...prev, [prop]: sanitize(control, v) }));
            }}
          />
          {spec.note && (
            <p className="mt-3 border-t border-seam pt-3 text-xs leading-relaxed text-haze">
              {spec.note}
            </p>
          )}
        </aside>
      </div>
      <CodeView code={snippet} title="Usage · follows your changes" />
    </div>
  );
}

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-md border border-seam p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "h-6 rounded px-2 font-mono text-[11px] transition-colors",
            value === o.id ? "bg-lift text-snow" : "text-haze hover:text-snow",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
