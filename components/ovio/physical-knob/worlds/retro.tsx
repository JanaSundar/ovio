"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { cn } from "@/lib/utils";
import { detents, KnobTicks, type KnobWorldProps } from "../physical-knob";
import { useKnob, type KnobFeel } from "../use-knob";

/** Retro: an old amp's volume pot. Eleven hard detents; the cap jumps between them. */
const feel: KnobFeel = { steps: 11, follow: "step", wheel: 1 };

const TICKS = {
  R: 86,
  count: 11,
  major: 1,
  majorH: 12,
  minorH: 12,
  majorW: "3px",
  minorW: "3px",
  on: "#6dff8a",
  off: "#555a52",
  top: -6,
};

export function RetroKnob({
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
  const index = d.toIndex(value);
  const ref = useRef<HTMLDivElement>(null);
  const { angle, handlers } = useKnob({
    ...feel,
    ref,
    index,
    onIndex: (i) => setValue(d.toValue(i)),
    disabled,
  });

  return (
    <div
      data-ovio-world="retro"
      className={cn(
        "relative flex w-[340px] max-w-full flex-col items-center gap-3 border-2 border-[#4a4e48] bg-[#2b2e2a] p-[18px] font-(family-name:--ovio-font) shadow-[inset_0_2px_0_#5c6159,inset_0_-2px_0_#1a1c19]",
        className,
      )}
    >
      <div className="flex w-full justify-between text-xl text-[#c9c9c0]">
        <span>{label.toUpperCase()}</span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-[9px] bg-(--ovio-accent) shadow-[0_0_6px_#4fdc68]" />
          PWR
        </span>
      </div>
      <div className="relative size-60">
        {Array.from({ length: 11 }, (_, i) => {
          const a = -135 + i * 27;
          return (
            <span
              key={i}
              aria-hidden
              className="absolute top-1/2 left-1/2 text-xl text-[#c9c9c0]"
              style={{
                transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-116px) rotate(${-a}deg)`,
              }}
            >
              {i}
            </span>
          );
        })}
        <div
          ref={ref}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${index} of 10`}
          aria-disabled={disabled || undefined}
          {...handlers}
          className="absolute inset-[34px] cursor-grab touch-none rounded-full active:cursor-grabbing"
        >
          <KnobTicks s={TICKS} percent={percent} />
          <div className="absolute inset-3.5 rounded-full bg-[#15171a] shadow-[0_0_0_3px_#3b3f3a,0_8px_10px_rgba(0,0,0,.6),inset_0_2px_0_#3a3d41]" />
          <motion.div
            className="absolute inset-3.5 rounded-full [background:repeating-conic-gradient(#0e0f11_0_5deg,#202226_5deg_10deg)] [mask:radial-gradient(circle,transparent_38%,#000_40%)]"
            style={{ rotate: angle }}
          >
            <span className="absolute top-1 left-1/2 -ml-0.5 h-6 w-1 bg-[#f4f1e6]" />
          </motion.div>
        </div>
      </div>
      <div className="border-2 border-[#1c2a1d] [border-style:inset] bg-(--ovio-stage) px-3.5 py-1 text-[30px] tracking-[0.06em] text-(--ovio-ink) [text-shadow:var(--ovio-glow)]">
        VOL <RollingNumber timing="none" value={index} /> / 10
      </div>
    </div>
  );
}
