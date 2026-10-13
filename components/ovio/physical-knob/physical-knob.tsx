"use client";

import { type ComponentType, useState } from "react";
import { useWorld } from "@/components/shared/world-provider";
import { everyWorld, type InstalledWorld } from "@/lib/world";
import * as worlds from "./worlds";

export interface PhysicalKnobProps {
  variant?: InstalledWorld<typeof worlds>;
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
}

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

/** The installed worlds; a single-world install draws its one world for any provider world. */
const VIEWS = everyWorld<ComponentType<KnobWorldProps>>(worlds);

export function PhysicalKnob({
  variant,
  value: valueProp,
  defaultValue,
  min = 0,
  max = 100,
  onValueChange,
  label = "Level",
  disabled,
  className,
}: PhysicalKnobProps) {
  const world = useWorld(variant);
  // 72% of the way round by default, whatever the range: 72 on 0–100, -16.8 on -60–0.
  const [inner, setInner] = useState(defaultValue ?? min + 0.72 * (max - min));
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
