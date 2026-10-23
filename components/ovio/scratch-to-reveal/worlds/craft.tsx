import { motion, useTransform } from "motion/react";
import { ease, motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ScratchPad } from "../parts";
import { seeded } from "../scratch";
import type { ScratchWorldProps } from "../scratch-to-reveal";
import { useScratchWorld, type ScratchFeel } from "../use-scratch";

/** A four-point sparkle, pressed into the foil. */
function sparkle(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.quadraticCurveTo(x, y, x, y + r);
  g.quadraticCurveTo(x, y, x - r, y);
  g.quadraticCurveTo(x, y, x, y - r);
  g.fill();
}

/** Craft: brushed silver foil on a paper ticket. A coin chips its edges. */
const feel: ScratchFeel = {
  paint(g, w, h) {
    const fill = g.createLinearGradient(0, 0, w, h);
    fill.addColorStop(0, "#a8a8a2");
    fill.addColorStop(0.35, "#e6e6df");
    fill.addColorStop(0.5, "#c2c2bb");
    fill.addColorStop(0.7, "#ecece5");
    fill.addColorStop(1, "#9d9d97");
    g.fillStyle = fill;
    g.fillRect(0, 0, w, h);
    const rnd = seeded(8);
    for (let y = 0; y < h; y += 1.5) {
      g.fillStyle = `rgba(255,255,255,${rnd() * 0.14})`;
      g.fillRect(0, y, w, 0.75);
    }
    for (let y = 14, row = 0; y < h + 10; y += 26, row++)
      for (let x = row % 2 ? 6 : 26; x < w + 10; x += 40) {
        g.fillStyle = "rgba(60,60,55,.3)";
        sparkle(g, x + 0.7, y + 0.7, 5);
        g.fillStyle = "rgba(255,255,255,.6)";
        sparkle(g, x, y, 5);
      }
  },
  brush: 14,
  cell: 6,
  rough: true,
  finish: { duration: 0.6, ease: ease.stage },
};

/** The paper's punched notches, in the stage colour. */
const NOTCHES =
  "radial-gradient(circle at 0 50%, var(--ovio-stage) 9px, transparent 9.5px), radial-gradient(circle at 100% 50%, var(--ovio-stage) 9px, transparent 9.5px)";

export default function CraftScratch(props: ScratchWorldProps) {
  const scratch = useScratchWorld(props, feel);
  const readout = useTransform(() => `${scratch.percent.get()}%`);

  return (
    <div
      data-ovio-world="craft"
      className={cn(
        "relative flex w-84 max-w-full -rotate-1 flex-col gap-3 rounded-md bg-(--ovio-surface) px-5 pt-4.5 pb-3.5 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-(--ovio-shadow)",
        props.className,
      )}
      style={{ backgroundImage: NOTCHES }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-2 rounded-[3px] border-[1.5px] border-dashed border-(--ovio-line)"
      />
      <b className="truncate px-2 text-center text-[22px] leading-tight font-extrabold tracking-[-0.01em]">
        {props.label}
      </b>
      <ScratchPad
        world={props}
        scratch={scratch}
        className="rounded-md border-2 border-(--ovio-ink) bg-(--ovio-surface-2)"
        coatClassName="bg-[#c8c8c1]"
        clear={{ to: { opacity: 0 }, transition: { duration: 0.5, ease: ease.minimal } }}
        land={motionTokens.craft.slow}
        hint={
          <span className="-rotate-6 font-(family-name:--ovio-hand) text-[28px] font-bold text-(--ovio-ink) [text-shadow:0_1px_0_rgba(255,255,255,.6)]">
            {props.hint}
          </span>
        }
      />
      <div className="flex items-baseline justify-between gap-3 px-1">
        <span className="font-(family-name:--ovio-hand) text-[19px] font-bold text-(--ovio-ink-2)">
          {props.revealed ? "there it is ✿" : "scratch with a coin"}
        </span>
        <motion.span
          aria-hidden
          className="font-(family-name:--ovio-mono) text-[11px] tracking-widest text-(--ovio-muted)"
        >
          {readout}
        </motion.span>
      </div>
    </div>
  );
}
