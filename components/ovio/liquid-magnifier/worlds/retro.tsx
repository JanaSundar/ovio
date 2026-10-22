import { motion } from "motion/react";
import { steps } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { MagnifierWorldProps } from "../liquid-magnifier";
import { MagnifierView } from "../parts";
import { useMagnifierWorld, type MagnifierFeel } from "../use-magnifier";

const GRID = 8;

/** Retro: a square scope that jumps cell to cell on an 8 px grid. No easing, no stretch. */
const feel: MagnifierFeel = {
  follow: "step",
  grid: GRID,
  wobble: 0,
  squash: 0,
  maxSquash: 0,
  pop: { duration: 0.3, ease: steps(4) },
  zoom: { duration: 0.15, ease: steps(3) },
  wholeZoom: true,
};

const INSET = "border-2 border-[#1c2a1d] bg-(--ovio-stage)";

export default function RetroMagnifier(props: MagnifierWorldProps) {
  const lens = useMagnifierWorld(props, feel);

  return (
    <div
      data-ovio-world="retro"
      className={cn(
        "flex w-108 max-w-full flex-col gap-2.5 border-2 border-[#4a4e48] bg-[#2b2e2a] p-3.5 font-(family-name:--ovio-font) shadow-[inset_0_2px_0_#5c6159,inset_0_-2px_0_#1a1c19]",
        props.className,
      )}
    >
      <div className="flex justify-between gap-3 text-lg text-[#c9c9c0] uppercase">
        <span title={props.label} className="min-w-0 truncate">
          {props.label}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span aria-hidden className="size-2 bg-(--ovio-accent) shadow-[0_0_6px_#4fdc68]" />
          LENS ON
        </span>
      </div>
      <MagnifierView
        world={props}
        lens={lens}
        className={cn(INSET, "cursor-crosshair")}
        lensClassName="shadow-[0_0_0_2px_var(--ovio-ink),0_0_16px_rgba(80,255,120,.7)]"
        glassClassName="bg-(--ovio-stage)"
        rimClassName="bg-[linear-gradient(var(--ovio-ink),var(--ovio-ink)),linear-gradient(var(--ovio-ink),var(--ovio-ink))] bg-[length:1px_100%,100%_1px] bg-center bg-no-repeat opacity-50"
      >
        <div aria-hidden className="ovio-scanlines z-20" />
      </MagnifierView>
      <div
        className={cn(
          INSET,
          "flex justify-between gap-3 px-2.5 text-2xl leading-tight text-(--ovio-ink) text-shadow-(--ovio-glow)",
        )}
      >
        <span className="shrink-0">
          ZOOM <motion.span>{lens.readout}</motion.span>
        </span>
        <motion.span aria-hidden className="min-w-0 truncate">
          {lens.coords}
        </motion.span>
        <span aria-hidden className="shrink-0">
          GRID {GRID}PX
        </span>
      </div>
    </div>
  );
}
