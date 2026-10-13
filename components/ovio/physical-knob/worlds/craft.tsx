import { motion } from "motion/react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { KnobTicks } from "../parts";
import type { KnobWorldProps } from "../physical-knob";
import { useKnobWorld, type KnobFeel } from "../use-knob";

/** Craft: a weighty brass-and-paper dial that overshoots a touch, then settles. */
const feel: KnobFeel = { steps: 101, follow: { stiffness: 240, damping: 21 }, wheel: 2 };

const TICKS = {
  R: 110,
  count: 41,
  major: 10,
  majorH: 14,
  minorH: 7,
  majorW: "2px",
  minorW: "1px",
  on: "#2a1f14",
  off: "rgba(42,31,20,.35)",
};

export default function CraftKnob(props: KnobWorldProps) {
  const { min, max, percent, label, className } = props;
  const { angle, slider } = useKnobWorld(props, feel);

  return (
    <div
      data-ovio-world="craft"
      className={cn(
        "relative flex -rotate-1 flex-col items-center gap-2 rounded-lg bg-(--ovio-surface) px-4 pt-7.5 sm:px-8.5 pb-6.5 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[0_2px_4px_rgba(70,45,20,.12),0_22px_36px_-14px_rgba(70,45,20,.4)]",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 -ml-11.25 h-6 w-22.5 rotate-2 bg-(--ovio-tape)"
      />
      <div className="font-(family-name:--ovio-mono) text-[12px] tracking-[0.14em] text-[#7d6650] uppercase">
        Dial No. 07 · {label}
      </div>
      <div className="relative size-65">
        {[0, 25, 50, 75, 100].map((n, i) => {
          const a = -135 + i * 67.5;
          return (
            <span
              key={n}
              aria-hidden
              className="absolute top-1/2 left-1/2 font-(family-name:--ovio-mono) text-[11px] font-medium text-[#5a4632]"
              style={{
                transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-122px) rotate(${-a}deg)`,
              }}
            >
              {formatNumber(Math.round(min + ((max - min) * n) / 100))}
            </span>
          );
        })}
        <div
          {...slider}
          className="absolute inset-5 cursor-grab touch-none rounded-full active:cursor-grabbing"
        >
          <KnobTicks s={TICKS} percent={percent} />
          <div className="absolute inset-8 rounded-full border-2 border-(--ovio-ink) bg-[#f4ecdd] shadow-[inset_0_0_0_5px_#fbf7ef,inset_0_0_0_6px_rgba(42,31,20,.25),0_3px_6px_rgba(70,45,20,.3),0_14px_18px_-8px_rgba(70,45,20,.45)]" />
          <motion.div className="absolute inset-8 rounded-full" style={{ rotate: angle }}>
            <span className="absolute top-2.5 left-1/2 -ml-1.75 size-0 border-x-[7px] border-b-34 border-x-transparent border-b-(--ovio-accent-deep)" />
            <span className="absolute top-1/2 left-1/2 -mt-3.25 -ml-3.25 size-6.5 rounded-full bg-(--ovio-accent) shadow-[inset_0_-3px_0_rgba(0,0,0,.15),0_2px_3px_rgba(70,45,20,.35)]" />
          </motion.div>
        </div>
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="text-[40px] leading-none font-extrabold tracking-[-0.04em]">
          <RollingNumber timing="quick" value={Math.round(percent)} />%
        </span>
        <span className="inline-block -rotate-4 font-(family-name:--ovio-hand) text-[26px] text-(--ovio-accent-deep)">
          turn me
        </span>
      </div>
    </div>
  );
}
