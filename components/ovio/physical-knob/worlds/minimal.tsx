"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { cn } from "@/lib/utils";
import { detents, KnobTicks, type KnobWorldProps } from "../physical-knob";
import { useKnob, type KnobFeel } from "../use-knob";

/** Minimal: precise and quick, no overshoot (about 250ms to settle). */
const feel: KnobFeel = { steps: 101, follow: { stiffness: 380, damping: 40 }, wheel: 2 };

const TICKS = {
  R: 120,
  count: 41,
  major: 10,
  majorH: 12,
  minorH: 6,
  majorW: "1.5px",
  minorW: "1px",
  on: "#161614",
  off: "#d6d3cc",
};

export function MinimalKnob({
  value,
  min,
  max,
  percent,
  setValue,
  label,
  disabled,
  className,
}: KnobWorldProps) {
  const d = detents(min, max, feel.steps);
  const ref = useRef<HTMLDivElement>(null);
  const { angle, handlers } = useKnob({
    ...feel,
    ref,
    index: d.toIndex(value),
    onIndex: (i) => setValue(d.toValue(i)),
    disabled,
  });

  return (
    <div
      data-ovio-world="minimal"
      className={cn(
        "flex flex-col items-center gap-3.5 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="text-[11px] tracking-[0.12em] text-(--ovio-muted) uppercase">{label}</div>
      <div className="relative size-60">
        <div
          ref={ref}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${Math.round(percent)}%`}
          aria-disabled={disabled || undefined}
          {...handlers}
          className="absolute inset-0 cursor-grab touch-none rounded-full outline-offset-[6px] active:cursor-grabbing"
        >
          <KnobTicks s={TICKS} percent={percent} />
          <div className="absolute inset-[26px] rounded-full border border-(--ovio-line) bg-(--ovio-surface) shadow-[0_1px_2px_rgba(0,0,0,.04),0_10px_24px_-14px_rgba(0,0,0,.22)]" />
          <motion.div className="absolute inset-[26px] rounded-full" style={{ rotate: angle }}>
            <span className="absolute top-3 left-1/2 -ml-px h-[26px] w-0.5 rounded-[1px] bg-(--ovio-ink)" />
          </motion.div>
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <RollingNumber
          className="text-5xl leading-none tracking-[-0.045em]"
          value={Math.round(percent)}
        />
        <span className="text-base text-(--ovio-muted)">%</span>
      </div>
      <div className="flex w-[200px] justify-between font-(family-name:--ovio-mono) text-[11px] text-(--ovio-faint)">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
