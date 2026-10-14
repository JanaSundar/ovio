import { motion, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { splitMeter } from "../compare";
import type { CompareWorldProps } from "../compare-slider";
import { CompareScreen } from "../parts";
import { useCompareWorld, type CompareFeel } from "../use-compare";

/** Retro: the scan bar jumps in 10% steps, no tween. */
const feel: CompareFeel = { follow: "step", snap: 10 };

const INSET = "border-2 border-[#1c2a1d] [border-style:inset] bg-(--ovio-stage)";
const LABEL = "top-2 bg-(--ovio-stage)/80 px-1 text-lg leading-none uppercase";

export default function RetroCompare(props: CompareWorldProps) {
  const compare = useCompareWorld(props, feel);
  const meter = useTransform(() => splitMeter(compare.split.get()));
  const percent = useTransform(() => `${Math.round(compare.split.get())}%`);

  return (
    <div
      data-ovio-world="retro"
      className={cn(
        "flex w-85 max-w-full flex-col gap-2.5 border-2 border-[#4a4e48] bg-[#2b2e2a] p-3.5 font-(family-name:--ovio-font) shadow-[inset_0_2px_0_#5c6159,inset_0_-2px_0_#1a1c19]",
        props.className,
      )}
    >
      <div className="flex justify-between gap-3 text-lg text-[#c9c9c0] uppercase">
        <span title={props.label} className="min-w-0 truncate">
          {props.label}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span aria-hidden className="size-2 bg-(--ovio-accent) shadow-[0_0_6px_#4fdc68]" />
          A/B
        </span>
      </div>
      <CompareScreen
        world={props}
        compare={compare}
        className={INSET}
        backClassName="bg-(--ovio-stage)"
        beforeLabelClassName={cn(LABEL, "left-2.5 text-(--ovio-ink-2)")}
        afterLabelClassName={cn(LABEL, "right-2.5 text-(--ovio-ink) text-shadow-(--ovio-glow)")}
        dividerClassName="w-0.75 bg-(--ovio-ink) shadow-[0_0_10px_rgba(80,255,120,.8)]"
        handle={
          <span className="absolute top-1/2 left-1/2 -translate-1/2 bg-(--ovio-ink) px-1 text-xl leading-5.5 text-(--ovio-stage) shadow-[0_0_10px_rgba(80,255,120,.6)]">
            ◂▸
          </span>
        }
      >
        <div aria-hidden className="ovio-scanlines" />
      </CompareScreen>
      <div
        className={cn(
          INSET,
          "flex justify-between gap-3 px-2.5 text-2xl tracking-[0.04em] text-(--ovio-ink) text-shadow-(--ovio-glow)",
        )}
      >
        <motion.span aria-hidden className="min-w-0 truncate">
          {meter}
        </motion.span>
        <motion.span className="shrink-0">{percent}</motion.span>
      </div>
    </div>
  );
}
