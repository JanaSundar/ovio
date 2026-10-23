import { motion } from "motion/react";
import { motionTokens, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ScratchPad } from "../parts";
import { burst, seeded } from "../scratch";
import type { ScratchWorldProps } from "../scratch-to-reveal";
import { useScratchWorld, type ScratchFeel } from "../use-scratch";

const SPRINKLES = ["#f4b52a", "#ffffff", "#ef4f2b", "#9fe8ff"];
const CONFETTI = ["bg-(--ovio-yellow)", "bg-(--ovio-red)", "bg-(--ovio-accent)"];
const PIECES = burst(14);

/** Toy: thick blue rubber full of sprinkles and a fat brush. The rest pops off with a bounce. */
const feel: ScratchFeel = {
  paint(g, w, h) {
    const fill = g.createLinearGradient(0, 0, w, h);
    fill.addColorStop(0, "#4470f2");
    fill.addColorStop(1, "#2244c4");
    g.fillStyle = fill;
    g.fillRect(0, 0, w, h);
    const rnd = seeded(11);
    for (let i = 0; i < (w * h) / 700; i++) {
      g.save();
      g.translate(rnd() * w, rnd() * h);
      g.rotate(rnd() * Math.PI);
      g.fillStyle = SPRINKLES[i % SPRINKLES.length];
      g.beginPath();
      g.roundRect(-5, -1.75, 10, 3.5, 1.75);
      g.fill();
      g.restore();
    }
  },
  brush: 24,
  cell: 8,
  finish: motionTokens.toy.slide,
};

export default function ToyScratch(props: ScratchWorldProps) {
  const scratch = useScratchWorld(props, feel);
  const reduced = useReducedMotionSafe();

  return (
    <div
      data-ovio-world="toy"
      className={cn(
        "flex w-80 max-w-full flex-col gap-3.5 rounded-[30px] bg-(--ovio-red) px-4.5 pt-4 pb-4.5 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_4px_0_rgba(255,255,255,.28),0_9px_0_var(--ovio-red-deep),0_28px_30px_-12px_rgba(40,28,10,.45)]",
        props.className,
      )}
    >
      <span className="truncate text-center text-lg font-black tracking-[0.06em] text-white uppercase">
        {props.label}
      </span>
      <ScratchPad
        world={props}
        scratch={scratch}
        className="rounded-[22px] border-[5px] border-white bg-(--ovio-surface) shadow-[0_5px_0_rgba(0,0,0,.18)]"
        coatClassName="bg-(--ovio-accent)"
        clear={{
          to: { opacity: 0, scale: 1.12 },
          transition: { ...motionTokens.toy.piece, opacity: { duration: 0.25, delay: 0.05 } },
        }}
        land={motionTokens.toy.piece}
        hint={
          <motion.span
            className="rounded-[13px] bg-(--ovio-yellow) px-3.5 py-2 text-[13px] font-extrabold tracking-[0.08em] text-(--ovio-ink) uppercase shadow-[0_4px_0_var(--ovio-yellow-deep)]"
            animate={reduced ? undefined : { y: [0, -4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {props.hint}
          </motion.span>
        }
      >
        {scratch.popped &&
          !reduced &&
          PIECES.map((p, i) => (
            <motion.span
              key={i}
              aria-hidden
              className={cn(
                "pointer-events-none absolute -mt-1.25 -ml-1.25 size-2.5 rounded-[3px]",
                CONFETTI[p.tone],
              )}
              initial={{ left: "50%", top: "50%", opacity: 1, scale: 0.4, rotate: 0 }}
              animate={{
                left: `${50 + p.x}%`,
                top: `${50 + p.y}%`,
                opacity: 0,
                scale: 1,
                rotate: p.rotate,
              }}
              transition={{ duration: 0.8, delay: i * 0.012, ease: "easeOut" }}
            />
          ))}
      </ScratchPad>
      <div
        aria-hidden
        className="h-4.5 rounded-full bg-(--ovio-red-deep) p-1 shadow-[inset_0_3px_5px_rgba(0,0,0,.35)]"
      >
        <motion.div
          className="h-full origin-left rounded-full bg-(--ovio-yellow) shadow-[inset_0_2px_0_rgba(255,255,255,.45)]"
          style={{ scaleX: scratch.progress }}
        />
      </div>
    </div>
  );
}
