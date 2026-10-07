"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { detents, KnobTicks, type KnobWorldProps } from "../physical-knob";
import { useKnob, type KnobFeel } from "../use-knob";

/** Toy: a chunky plastic knob with rotational weight (knob spring, k95 c22). */
const feel: KnobFeel = {
  steps: 101,
  follow: { stiffness: motionTokens.toy.knob.stiffness, damping: motionTokens.toy.knob.damping },
  wheel: 2,
};

const TICKS = {
  R: 120,
  count: 21,
  major: 5,
  majorH: 16,
  minorH: 10,
  majorW: "3px",
  minorW: "2px",
  on: "#ef4f2b",
  off: "#a69e90",
  rounded: true,
};

export function ToyKnob({
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
      data-ovio-world="toy"
      className={cn(
        "flex flex-col items-center gap-1.5 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 rounded-xl bg-[#2a2925] px-[18px] py-2 font-(family-name:--ovio-mono) text-4xl leading-none font-semibold text-(--ovio-surface) shadow-[inset_0_3px_6px_rgba(0,0,0,.6)]">
        <RollingNumber value={Math.round(percent)} />
        <span className="text-lg text-[#bdb6a8]">%</span>
      </div>
      <div className="relative mt-2.5 size-[260px]">
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
          className="absolute inset-2.5 cursor-grab touch-none rounded-full outline-offset-[6px] active:cursor-grabbing"
        >
          <KnobTicks s={TICKS} percent={percent} />
          <div className="absolute inset-[30px] rounded-full bg-(--ovio-surface) shadow-[inset_0_1px_0_#fff,0_10px_0_#d2ccbf,0_26px_30px_-12px_rgba(40,28,10,.5)]" />
          <div className="absolute inset-[52px] rounded-full bg-(--ovio-red) shadow-[inset_0_3px_0_rgba(255,255,255,.28),inset_0_-5px_0_rgba(0,0,0,.14),0_6px_0_var(--ovio-red-deep)]" />
          <motion.div className="absolute inset-[30px] rounded-full" style={{ rotate: angle }}>
            <span className="absolute top-[9px] left-1/2 -ml-[5px] size-2.5 rounded-full bg-(--ovio-red) shadow-[inset_0_1px_1px_rgba(0,0,0,.25)]" />
            <span className="absolute top-[54px] left-1/2 -ml-1 h-[30px] w-2 rounded-[4px] bg-(--ovio-surface) shadow-[inset_0_2px_2px_rgba(0,0,0,.2)]" />
          </motion.div>
        </div>
        <span className="absolute bottom-3.5 left-3.5 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
          {min}
        </span>
        <span className="absolute right-1.5 bottom-3.5 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
          {max}
        </span>
      </div>
      <span className="font-(family-name:--ovio-mono) text-[11px] tracking-[0.1em] text-(--ovio-muted)">
        DRAG · FLICK · SCROLL · ← →
      </span>
    </div>
  );
}
