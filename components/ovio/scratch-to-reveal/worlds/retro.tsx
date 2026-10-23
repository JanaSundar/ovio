import { motion, useTransform } from "motion/react";
import { steps } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ScratchPad } from "../parts";
import { cellBox, gridFor, seeded, shareMeter } from "../scratch";
import type { ScratchWorldProps } from "../scratch-to-reveal";
import { useScratchWorld, type ScratchFeel } from "../use-scratch";

const CELL = 10;
const NOISE = ["#06260f", "#0d4a22", "#2fa650"];

/** Retro: static noise, wiped a whole cell at a time; what's left blinks out in four frames. */
const feel: ScratchFeel = {
  paint(g, w, h) {
    const grid = gridFor(w, h, CELL);
    const rnd = seeded(5);
    for (let i = 0; i < grid.cols * grid.rows; i++) {
      const v = rnd();
      const box = cellBox(i, grid, w, h);
      g.fillStyle = NOISE[v > 0.72 ? 2 : v > 0.38 ? 1 : 0];
      g.fillRect(box.x, box.y, box.w, box.h);
    }
  },
  brush: 14,
  cell: CELL,
  blocky: true,
  finish: { duration: 0.4, ease: steps(4) },
};

const INSET = "border-2 border-[#1c2a1d] bg-(--ovio-stage)";

export default function RetroScratch(props: ScratchWorldProps) {
  const scratch = useScratchWorld(props, feel);
  const meter = useTransform(() => shareMeter(scratch.progress.get()));
  const readout = useTransform(() => `${String(scratch.percent.get()).padStart(3, "0")}%`);

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
          {props.revealed ? "OPEN" : "SEALED"}
        </span>
      </div>
      <ScratchPad
        world={props}
        scratch={scratch}
        className={cn(INSET, "text-(--ovio-ink)")}
        coatClassName="bg-[#0d4a22]"
        clear={{ to: { opacity: 0 }, transition: { duration: 0.4, ease: steps(4) } }}
        land={{ duration: 0.2, ease: steps(2) }}
        hint={
          <span className="border-2 border-(--ovio-line) bg-(--ovio-stage) px-2 text-2xl leading-tight text-(--ovio-ink) uppercase text-shadow-(--ovio-glow)">
            [ {props.hint} ]
          </span>
        }
      >
        <div aria-hidden className="ovio-scanlines" />
      </ScratchPad>
      <div
        aria-hidden
        className={cn(
          INSET,
          "flex justify-between gap-3 px-2.5 text-2xl leading-tight text-(--ovio-ink) text-shadow-(--ovio-glow)",
        )}
      >
        <span className="min-w-0 truncate">
          DECODE <motion.span>{meter}</motion.span>
        </span>
        <motion.span className="shrink-0">{readout}</motion.span>
      </div>
    </div>
  );
}
