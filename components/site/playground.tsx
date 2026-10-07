"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  getComponent,
  type Control,
  type ControlValue,
  type ControlValues,
} from "@/content/components";
import { cn } from "@/lib/utils";

export type Playground = {
  controls: Control[];
  values: ControlValues;
  set: (prop: string, value: ControlValue) => void;
};

const PlaygroundContext = createContext<Playground>({ controls: [], values: {}, set: () => {} });

export const usePlayground = () => useContext(PlaygroundContext);

/** Resolves a range bound that names another control. */
const bound = (b: number | string, values: ControlValues) =>
  typeof b === "number" ? b : Number(values[b]);

/** Keeps every range value inside its (possibly moving) bounds. */
function clampRanges(controls: Control[], values: ControlValues): ControlValues {
  const out = { ...values };
  for (const c of controls) {
    if (c.type !== "range") continue;
    const v = Number(out[c.prop]);
    out[c.prop] = Math.min(Math.max(v, bound(c.min, out)), bound(c.max, out));
  }
  return out;
}

/** Holds a component page's playground values, shared by its preview, controls and usage snippet. */
export function PlaygroundProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const controls = getComponent(slug)?.controls ?? [];
  const [values, setValues] = useState<ControlValues>(() =>
    Object.fromEntries(controls.map((c) => [c.prop, c.default])),
  );
  const set = (prop: string, value: ControlValue) =>
    setValues((v) => clampRanges(controls, { ...v, [prop]: value }));
  return (
    <PlaygroundContext.Provider value={{ controls, values, set }}>
      {children}
    </PlaygroundContext.Provider>
  );
}

/** The playground's props as JSX attribute lines, for the usage snippet. */
export function propLines({ controls, values }: Playground) {
  return controls.map(({ prop }) => {
    const v = values[prop];
    if (typeof v === "string") return `  ${prop}="${v}"`;
    const expr = typeof v === "number" ? v : `[${v.map((s) => `"${s}"`).join(", ")}]`;
    return `  ${prop}={${expr}}`;
  });
}

const chip = (on: boolean) =>
  cn(
    "cursor-pointer rounded-md border-0 px-2.5 py-1 font-mono text-xs",
    on ? "bg-ink text-paper" : "bg-paper-2 text-ink-2 hover:text-ink",
  );

/** One row of controls per prop, under the preview. */
export function PlaygroundControls() {
  const { controls, values, set } = usePlayground();
  if (!controls.length) return null;
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3.5 rounded-[10px] border border-line bg-white/50 px-4 py-3.5">
      {controls.map((c) => {
        const v = values[c.prop];
        return (
          <div key={c.prop} className="flex min-w-0 flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs text-muted">{c.prop}</span>
            {c.type === "range" ? (
              <label className="flex items-center gap-2.5">
                <input
                  type="range"
                  aria-label={c.prop}
                  min={bound(c.min, values)}
                  max={bound(c.max, values)}
                  step={c.step}
                  value={Number(v)}
                  onChange={(e) => set(c.prop, Number(e.target.value))}
                  className="w-32 accent-ink"
                />
                <span className="w-12 font-mono text-xs tabular-nums">
                  {Number(v).toLocaleString("en-US")}
                </span>
              </label>
            ) : (
              <div role="group" aria-label={c.prop} className="flex flex-wrap gap-1">
                {c.options.map((o) => {
                  const on = c.type === "select" ? v === o : (v as string[]).includes(o);
                  const toggle = () =>
                    set(
                      c.prop,
                      c.type === "select"
                        ? o
                        : c.options.filter((x) => (x === o ? !on : (v as string[]).includes(x))),
                    );
                  return (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={on}
                      onClick={toggle}
                      className={chip(on)}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
