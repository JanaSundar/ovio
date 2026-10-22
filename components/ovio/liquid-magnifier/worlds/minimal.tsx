import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { MagnifierWorldProps } from "../liquid-magnifier";
import { MagnifierView } from "../parts";
import { useMagnifierWorld, type MagnifierFeel } from "../use-magnifier";

/** Minimal: a clear drop that trails the pointer on a soft spring and stretches a little as it goes. */
const feel: MagnifierFeel = {
  follow: { stiffness: 160, damping: 18 },
  wobble: 3,
  squash: 0.0002,
  maxSquash: 0.24,
  pop: { type: "spring", stiffness: 260, damping: 16 },
  zoom: { type: "spring", stiffness: 300, damping: 30 },
};

const META =
  "flex justify-between gap-3 font-(family-name:--ovio-mono) text-[11px] tracking-[0.08em] text-(--ovio-muted) uppercase";

export default function MinimalMagnifier(props: MagnifierWorldProps) {
  const lens = useMagnifierWorld(props, feel);

  return (
    <div
      data-ovio-world="minimal"
      className={cn(
        "flex w-108 max-w-full flex-col gap-3 rounded-[20px] border border-(--ovio-line) bg-(--ovio-surface) p-4 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[0_1px_2px_rgba(0,0,0,.04),0_30px_60px_-34px_rgba(0,0,0,.3)]",
        props.className,
      )}
    >
      <div className={META}>
        <span className="min-w-0 truncate">{props.label}</span>
        <span className="shrink-0">
          Zoom <motion.b className="font-medium text-(--ovio-ink)">{lens.readout}</motion.b>
        </span>
      </div>
      <MagnifierView
        world={props}
        lens={lens}
        className="cursor-none rounded-[10px] bg-(--ovio-stage)"
        lensClassName="shadow-[0_22px_36px_-14px_rgba(20,20,20,.45),0_0_0_1.5px_rgba(255,255,255,.95),0_0_0_2.5px_rgba(22,22,20,.1)]"
        glassClassName="bg-(--ovio-surface)"
        rimClassName="bg-[radial-gradient(55%_38%_at_30%_16%,rgba(255,255,255,.8),transparent_72%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.7),inset_0_10px_18px_rgba(255,255,255,.3),inset_0_-12px_20px_rgba(20,20,20,.08),inset_2px_0_4px_rgba(255,70,90,.16),inset_-2px_0_4px_rgba(70,120,255,.16)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]"
        />
      </MagnifierView>
      <div className={META}>
        <span>Move to magnify</span>
        <span>Pinch to zoom</span>
      </div>
    </div>
  );
}
