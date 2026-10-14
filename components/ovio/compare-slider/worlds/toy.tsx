import { motion, useTransform, useVelocity } from "motion/react";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { CompareWorldProps } from "../compare-slider";
import { CompareScreen, GRAB } from "../parts";
import { useCompareWorld, type CompareFeel } from "../use-compare";

/** Toy: a plastic knob in a groove drives the divider, on the slide spring (k600 c24). */
const feel: CompareFeel = {
  follow: { stiffness: motionTokens.toy.slide.stiffness, damping: motionTokens.toy.slide.damping },
};

const CHIP =
  "top-3 rounded-[9px] px-2.25 py-1.25 text-[11px] font-extrabold tracking-[0.08em] uppercase";

export default function ToyCompare(props: CompareWorldProps) {
  const compare = useCompareWorld(props, feel);
  // The knob stretches with its speed, then springs back to shape when it stops.
  const speed = useVelocity(compare.split);
  const squash = useTransform(() => Math.min(0.2, Math.abs(speed.get()) / 1500));
  const scaleX = useTransform(() => 1 + squash.get());
  const scaleY = useTransform(() => 1 - squash.get() * 0.6);

  return (
    <div
      data-ovio-world="toy"
      className={cn(
        "flex w-80 max-w-full flex-col items-center gap-4.5 font-(family-name:--ovio-font) text-(--ovio-ink)",
        props.className,
      )}
    >
      <div className="w-full rounded-[26px] bg-(--ovio-accent) px-4.5 pt-3 pb-4 shadow-[inset_0_4px_0_rgba(255,255,255,.25),0_9px_0_var(--ovio-accent-deep),0_26px_30px_-12px_rgba(40,28,10,.45)]">
        {/* The screen and the groove under it are one slider, so the knob drags it too. */}
        <div {...compare.view} className={cn("flex flex-col gap-3.5", GRAB)}>
          <CompareScreen
            world={props}
            compare={compare}
            slider={false}
            className="rounded-2xl bg-(--ovio-surface)"
            backClassName="bg-(--ovio-track)"
            beforeLabelClassName={cn(
              CHIP,
              "left-3 bg-[#2a2925] text-(--ovio-surface) shadow-[0_3px_0_#0d0d0c]",
            )}
            afterLabelClassName={cn(
              CHIP,
              "right-3 bg-(--ovio-yellow) text-(--ovio-ink) shadow-[0_3px_0_var(--ovio-yellow-deep)]",
            )}
            dividerClassName="w-1 bg-white"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_4px_6px_rgba(0,0,0,.2)]"
            />
          </CompareScreen>
          <div
            aria-hidden
            className="relative h-5.5 rounded-full bg-(--ovio-accent-deep) shadow-[inset_0_3px_5px_rgba(0,0,0,.35)]"
          >
            <motion.span
              className="absolute top-1/2 -mt-4.75 -ml-4.5 flex h-8.5 w-9 items-center justify-center gap-1 rounded-xl bg-(--ovio-red) shadow-[inset_0_3px_0_rgba(255,255,255,.3),inset_0_-4px_0_rgba(0,0,0,.14),0_5px_0_var(--ovio-red-deep)]"
              style={{ left: compare.left, scaleX, scaleY }}
            >
              <i className="h-3.5 w-0.75 rounded-sm bg-white/70" />
              <i className="h-3.5 w-0.75 rounded-sm bg-white/70" />
            </motion.span>
          </div>
        </div>
      </div>
      <span className="font-(family-name:--ovio-mono) text-[11px] tracking-widest text-(--ovio-muted)">
        DRAG · TAP · ← →
      </span>
    </div>
  );
}
