import { motion } from "motion/react";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { MagnifierWorldProps } from "../liquid-magnifier";
import { MagnifierView } from "../parts";
import { useMagnifierWorld, type MagnifierFeel } from "../use-magnifier";

/** Craft: a brass loupe, heavy in the hand, drifting after the pointer and settling late. */
const feel: MagnifierFeel = {
  follow: { stiffness: 90, damping: 14, mass: 1.4 },
  wobble: 2,
  squash: 0.0001,
  maxSquash: 0.12,
  pop: { type: "spring", stiffness: 170, damping: 15 },
  zoom: motionTokens.craft.base,
};

const TAPE = "absolute -top-2.5 h-5.5 w-18 bg-(--ovio-tape) shadow-[0_1px_2px_rgba(70,45,20,.2)]";

export default function CraftMagnifier(props: MagnifierWorldProps) {
  const lens = useMagnifierWorld(props, feel);

  return (
    <div
      data-ovio-world="craft"
      className={cn(
        "relative flex w-108 max-w-full -rotate-1 flex-col gap-2.5 rounded-[10px] bg-(--ovio-surface) px-3.5 pt-4 pb-3 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-(--ovio-shadow)",
        props.className,
      )}
    >
      <span aria-hidden className={cn(TAPE, "left-7 -rotate-5")} />
      <span aria-hidden className={cn(TAPE, "right-7 rotate-4")} />
      <MagnifierView
        world={props}
        lens={lens}
        className="cursor-none rounded-md border-2 border-(--ovio-ink) bg-(--ovio-surface-2)"
        glassClassName="bg-(--ovio-surface-2)"
        rimClassName="bg-[radial-gradient(55%_36%_at_30%_15%,rgba(255,255,255,.5),transparent_72%)] shadow-[0_0_0_6px_#c8963e,0_0_0_7.5px_#6a4515,inset_0_0_0_2px_rgba(255,236,190,.7),0_16px_22px_-8px_rgba(50,28,6,.6)]"
        behind={
          // The box turns about the lens centre, so the handle starts at the rim whatever the size.
          <span className="absolute inset-0 -rotate-48">
            <span className="absolute top-full left-1/2 -ml-2.25 h-24 w-4.5 rounded-b-[9px] bg-[linear-gradient(90deg,#4a2a12,#8a5a2a_45%,#3e220e)] shadow-[0_8px_10px_-4px_rgba(40,20,5,.5)]">
              <span className="absolute inset-x-[-2px] top-1.5 h-4 rounded-[3px] bg-[linear-gradient(90deg,#8a5f1f,#e3b765_45%,#7a5018)]" />
            </span>
          </span>
        }
      />
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate font-(family-name:--ovio-mono) text-[11px] tracking-widest text-(--ovio-muted) uppercase">
          {props.label}
        </span>
        <span className="shrink-0 -rotate-3 font-(family-name:--ovio-hand) text-2xl leading-none font-bold text-(--ovio-accent-deep)">
          look closer · <motion.span>{lens.readout}</motion.span>
        </span>
      </div>
    </div>
  );
}
