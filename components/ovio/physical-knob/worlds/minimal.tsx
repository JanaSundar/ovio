import { motion } from "motion/react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { KnobTicks } from "../parts";
import type { KnobWorldProps } from "../physical-knob";
import { useKnobWorld, type KnobFeel } from "../use-knob";

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

export default function MinimalKnob(props: KnobWorldProps) {
  const { min, max, percent, label, className } = props;
  const { angle, slider } = useKnobWorld(props, feel);

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
          {...slider}
          className="absolute inset-0 cursor-grab touch-none rounded-full active:cursor-grabbing"
        >
          <KnobTicks s={TICKS} percent={percent} />
          <div className="absolute inset-6.5 rounded-full border border-(--ovio-line) bg-(--ovio-surface) shadow-[0_1px_2px_rgba(0,0,0,.04),0_10px_24px_-14px_rgba(0,0,0,.22)]" />
          <motion.div className="absolute inset-6.5 rounded-full" style={{ rotate: angle }}>
            <span className="absolute top-3 left-1/2 -ml-px h-6.5 w-0.5 rounded-[1px] bg-(--ovio-ink)" />
          </motion.div>
        </div>
        {[
          [min, -135],
          [max, 135],
        ].map(([n, a]) => (
          <span
            key={a}
            aria-hidden
            className="absolute top-1/2 left-1/2 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-faint)"
            style={{
              transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-136px) rotate(${-a}deg)`,
            }}
          >
            {formatNumber(n)}
          </span>
        ))}
      </div>
      <div className="flex items-baseline gap-1">
        <RollingNumber
          timing="quick"
          className="text-5xl leading-none tracking-[-0.045em]"
          value={Math.round(percent)}
        />
        <span className="text-base text-(--ovio-muted)">%</span>
      </div>
    </div>
  );
}
