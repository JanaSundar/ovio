"use client";

import { useId } from "react";
import type { Control, ControlValue, Values } from "@/lib/registry/controls";
import { cn } from "@/lib/utils";

/** One row per control, each a native input so keyboard and screen readers work as expected. */
export function ControlsPanel({
  controls,
  values,
  onChange,
}: {
  controls: Control[];
  values: Values;
  onChange: (prop: string, value: ControlValue) => void;
}) {
  return (
    <div className="flex flex-col divide-y divide-seam">
      {controls.map((c) => (
        <ControlRow
          key={c.prop}
          control={c}
          value={values[c.prop]}
          onChange={(v) => onChange(c.prop, v)}
        />
      ))}
    </div>
  );
}

const FIELD =
  "rounded-md border border-seam bg-void text-[13px] text-snow focus:border-seam-2 focus:outline-none";

function ControlRow({
  control: c,
  value,
  onChange,
}: {
  control: Control;
  value: ControlValue;
  onChange: (v: ControlValue) => void;
}) {
  const id = useId();
  const label = (
    <label htmlFor={id} className="text-[13px] text-mist">
      {c.label}
    </label>
  );

  switch (c.kind) {
    case "range":
      return (
        <div className="flex flex-col gap-2 py-3">
          <div className="flex items-center justify-between">
            {label}
            <output htmlFor={id} className="font-mono text-xs text-snow tabular-nums">
              {Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}
              {c.unit ? ` ${c.unit}` : ""}
            </output>
          </div>
          <input
            id={id}
            type="range"
            min={c.min}
            max={c.max}
            step={c.step}
            value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-violet"
          />
        </div>
      );
    case "toggle":
      return (
        <div className="flex items-center justify-between py-3">
          {label}
          <button
            id={id}
            type="button"
            role="switch"
            aria-label={c.label}
            aria-checked={value === true}
            onClick={() => onChange(!value)}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              value ? "bg-violet" : "bg-seam-2",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform",
                value && "translate-x-4",
              )}
            />
          </button>
        </div>
      );
    case "text":
      return (
        <div className="flex flex-col gap-2 py-3">
          {label}
          <input
            id={id}
            type="text"
            value={String(value)}
            maxLength={c.maxLength ?? 60}
            onChange={(e) => onChange(e.target.value)}
            className={cn(FIELD, "h-8 px-2.5")}
          />
        </div>
      );
    case "color":
      return (
        <fieldset className="flex items-center justify-between py-3">
          <legend className="float-left text-[13px] text-mist">{c.label}</legend>
          <div className="flex gap-1.5">
            {c.options.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-label={o.label}
                aria-pressed={value === o.value}
                onClick={() => onChange(o.value)}
                className={cn(
                  "size-6 rounded-full ring-offset-2 ring-offset-deck",
                  value === o.value && "ring-2 ring-snow",
                )}
                style={{ background: o.value }}
              />
            ))}
          </div>
        </fieldset>
      );
    case "select":
      return c.options.length <= 4 ? (
        <fieldset className="flex flex-col gap-2 py-3">
          <legend className="mb-2 text-[13px] text-mist">{c.label}</legend>
          <div className="flex flex-wrap gap-1 rounded-lg bg-void p-0.5">
            {c.options.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={value === o.value}
                onClick={() => onChange(o.value)}
                className={cn(
                  "h-7 flex-1 rounded-md px-2 text-xs whitespace-nowrap transition-colors",
                  value === o.value ? "bg-lift text-snow" : "text-haze hover:text-snow",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <div className="flex flex-col gap-2 py-3">
          {label}
          <select
            id={id}
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className={cn(FIELD, "h-8 px-2")}
          >
            {c.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
  }
}
