import { motion } from "motion/react";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { CompareWorldProps } from "../compare-slider";
import { CompareScreen } from "../parts";
import { useCompareWorld, type CompareFeel } from "../use-compare";

/** Craft: a weighty cut line that runs a touch past the pointer, then settles. */
const feel: CompareFeel = { follow: { stiffness: 260, damping: 22 } };

const STICKER =
  "top-3 rounded-[4px] border-[1.5px] border-(--ovio-ink) px-1.75 py-0.75 font-(family-name:--ovio-mono) text-[10px] font-semibold tracking-[0.14em] uppercase";

export default function CraftCompare(props: CompareWorldProps) {
  const compare = useCompareWorld(props, feel);
  const tilt = useOvioTransition(motionTokens.craft.base);

  return (
    <div
      data-ovio-world="craft"
      className={cn(
        "flex w-84 max-w-full -rotate-1 flex-col gap-2.5 rounded-lg bg-(--ovio-surface) p-3.5 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-(--ovio-shadow)",
        props.className,
      )}
    >
      <CompareScreen
        world={props}
        compare={compare}
        className="rounded-md border-2 border-(--ovio-ink) bg-(--ovio-surface)"
        backClassName="bg-(--ovio-surface-2)"
        beforeLabelClassName={cn(STICKER, "left-3 bg-(--ovio-surface)")}
        afterLabelClassName={cn(STICKER, "right-3 bg-(--ovio-ink) text-(--ovio-surface)")}
        dividerClassName="w-0 border-l-2 border-dashed border-(--ovio-ink)"
        handle={
          <motion.span
            className="absolute top-1/2 left-0 -mt-5.75 -ml-3.25 flex h-11.5 w-6.5 flex-col items-center justify-center gap-0.75 rounded-md border-2 border-(--ovio-ink) bg-(--ovio-accent)"
            animate={{
              rotate: compare.dragging ? -6 : 0,
              boxShadow: compare.dragging
                ? "0 6px 8px rgba(70,45,20,.35)"
                : "0 3px 0 var(--ovio-ink)",
            }}
            transition={tilt}
          >
            {[0, 1, 2].map((i) => (
              <i key={i} className="h-0.5 w-2.5 rounded-[1px] bg-(--ovio-ink)" />
            ))}
          </motion.span>
        }
      />
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate font-(family-name:--ovio-mono) text-[11px] tracking-widest text-(--ovio-muted) uppercase">
          {props.label}
        </span>
        <span className="shrink-0 text-sm font-extrabold tracking-[-0.01em]">
          {props.beforeLabel} → {props.afterLabel}
        </span>
      </div>
    </div>
  );
}
