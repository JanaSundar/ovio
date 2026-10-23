import { motion, useTransform } from "motion/react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ScratchPad } from "../parts";
import { seeded } from "../scratch";
import type { ScratchWorldProps } from "../scratch-to-reveal";
import { useScratchWorld, type ScratchFeel } from "../use-scratch";

/** Minimal: a fine matte coating, a soft round brush; the rest fades the moment it's enough. */
const feel: ScratchFeel = {
  paint(g, w, h) {
    const fill = g.createLinearGradient(0, 0, w, h);
    fill.addColorStop(0, "#dcdad4");
    fill.addColorStop(0.5, "#eae9e4");
    fill.addColorStop(1, "#d3d1ca");
    g.fillStyle = fill;
    g.fillRect(0, 0, w, h);
    const rnd = seeded(3);
    for (let i = 0; i < (w * h) / 10; i++) {
      g.fillStyle =
        rnd() < 0.5 ? `rgba(0,0,0,${rnd() * 0.08})` : `rgba(255,255,255,${rnd() * 0.12})`;
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  },
  brush: 18,
  cell: 6,
  finish: { duration: 0.45, ease: ease.minimal },
};

export default function MinimalScratch(props: ScratchWorldProps) {
  const scratch = useScratchWorld(props, feel);
  const readout = useTransform(() => `${scratch.percent.get()}%`);

  return (
    <div
      data-ovio-world="minimal"
      className={cn(
        "flex w-80 max-w-full flex-col gap-3 rounded-[20px] border border-(--ovio-line) bg-(--ovio-surface) p-4 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[0_1px_2px_rgba(0,0,0,.04),0_24px_44px_-28px_rgba(0,0,0,.3)]",
        props.className,
      )}
    >
      <div className="flex justify-between gap-3 font-(family-name:--ovio-mono) text-[11px] tracking-widest text-(--ovio-muted) uppercase">
        <span className="min-w-0 truncate">{props.label}</span>
        <motion.span aria-hidden className="shrink-0 text-(--ovio-ink) tabular-nums">
          {readout}
        </motion.span>
      </div>
      <ScratchPad
        world={props}
        scratch={scratch}
        className="rounded-xl bg-(--ovio-stage) shadow-[inset_0_0_0_1px_var(--ovio-line)]"
        coatClassName="bg-[#e0ded8]"
        clear={{ to: { opacity: 0 }, transition: { duration: 0.45, ease: ease.minimal } }}
        land={{ duration: 0.45, ease: ease.minimal }}
        hint={
          <span className="rounded-full bg-white/90 px-3.5 py-1.75 text-xs font-medium text-(--ovio-ink-2) shadow-[0_1px_2px_rgba(0,0,0,.1)]">
            {props.hint}
          </span>
        }
      />
      <div aria-hidden className="h-0.5 overflow-hidden rounded-full bg-(--ovio-track)">
        <motion.div
          className="h-full origin-left bg-(--ovio-ink)"
          style={{ scaleX: scratch.progress }}
        />
      </div>
    </div>
  );
}
