"use client";

import { type ComponentType, useState } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { MinimalKnob } from "./worlds/minimal";
import { CraftKnob } from "./worlds/craft";
import { RetroKnob } from "./worlds/retro";
import { ToyKnob } from "./worlds/toy";

export type PhysicalKnobProps = {
  variant?: World;
  value?: number;
  defaultValue?: number;
  /** Range, default 0–100. */
  min?: number;
  max?: number;
  /** Fires while turning. */
  onValueChange?: (value: number) => void;
  /** Accessible name, also printed on the knob. */
  label?: string;
  disabled?: boolean;
  className?: string;
};

export type KnobWorldProps = {
  value: number;
  min: number;
  max: number;
  /** Value as 0–100. */
  percent: number;
  setValue: (value: number) => void;
  label: string;
  disabled?: boolean;
  className?: string;
};

/** Converts between a value and a detent index for a world's number of steps. */
export function detents(min: number, max: number, steps: number) {
  const span = max - min || 1;
  return {
    toIndex: (value: number) => Math.round(((value - min) / span) * (steps - 1)),
    toValue: (index: number) => {
      const v = min + (index * span) / (steps - 1);
      return Math.round(v * 1000) / 1000;
    },
  };
}

type TickStyle = {
  /** Radius of the tick ring in px; the ring is 2R square. */
  R: number;
  count: number;
  /** Every nth tick is major. */
  major: number;
  majorH: number;
  minorH: number;
  majorW: string;
  minorW: string;
  on: string;
  off: string;
  top?: number;
  rounded?: boolean;
};

/** Tick marks around the dial, lit up to the current value. */
export function KnobTicks({ s, percent }: { s: TickStyle; percent: number }) {
  return (
    <>
      {Array.from({ length: s.count }, (_, i) => {
        const major = i % s.major === 0;
        const lit = (i / (s.count - 1)) * 100 <= percent + 0.01;
        return (
          <span
            key={i}
            aria-hidden
            className="absolute"
            style={{
              left: s.R - (major ? 1.5 : 0.5),
              top: s.top ?? 0,
              width: major ? s.majorW : s.minorW,
              height: major ? s.majorH : s.minorH,
              marginLeft: s.rounded && major ? -1 : 0,
              borderRadius: s.rounded ? 1 : 0,
              background: lit ? s.on : s.off,
              transformOrigin: `50% ${s.R}px`,
              transform: `rotate(${(-135 + (i * 270) / (s.count - 1)).toFixed(2)}deg)`,
            }}
          />
        );
      })}
    </>
  );
}

const VIEWS = {
  minimal: MinimalKnob,
  craft: CraftKnob,
  retro: RetroKnob,
  toy: ToyKnob,
} satisfies Record<World, ComponentType<KnobWorldProps>>;

export function PhysicalKnob({
  variant,
  value: valueProp,
  defaultValue = 72,
  min = 0,
  max = 100,
  onValueChange,
  label = "Level",
  disabled,
  className,
}: PhysicalKnobProps) {
  const world = useWorld(variant);
  const [inner, setInner] = useState(defaultValue);
  const value = Math.max(min, Math.min(max, valueProp ?? inner));

  const setValue = (next: number) => {
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };

  const props: KnobWorldProps = {
    value,
    min,
    max,
    percent: ((value - min) / (max - min || 1)) * 100,
    setValue,
    label,
    disabled,
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
