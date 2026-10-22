import { motion } from "motion/react";
import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { MagnifierWorldProps } from "../liquid-magnifier";
import { clampZoom, zoomAtFraction } from "../magnifier";
import { MagnifierView } from "../parts";
import { useMagnifierWorld, type MagnifierFeel } from "../use-magnifier";

/** Toy: a squishy jelly bubble on a bouncy spring. It overshoots, wobbles and squashes as it flies. */
const feel: MagnifierFeel = {
  follow: { stiffness: 220, damping: 11 },
  wobble: 5,
  squash: 0.00035,
  maxSquash: 0.3,
  pop: motionTokens.toy.piece,
  zoom: motionTokens.toy.slide,
};

export default function ToyMagnifier(props: MagnifierWorldProps) {
  const lens = useMagnifierWorld(props, feel);
  const { zoom, setZoom, minZoom, maxZoom, disabled } = props;
  const [held, setHeld] = useState(false);

  const slideTo = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom(zoomAtFraction((e.clientX - r.left) / r.width, minZoom, maxZoom));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 0.25, ArrowUp: 0.25, ArrowLeft: -0.25, ArrowDown: -0.25 }[e.key];
    if (disabled || step === undefined) return;
    e.preventDefault();
    setZoom(clampZoom(zoom + step, minZoom, maxZoom));
  };

  return (
    <div
      data-ovio-world="toy"
      className={cn(
        "flex w-108 max-w-full flex-col gap-3.5 rounded-[30px] bg-(--ovio-accent) px-4.5 pt-4 pb-4.5 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_4px_0_rgba(255,255,255,.25),0_9px_0_var(--ovio-accent-deep),0_28px_30px_-12px_rgba(40,28,10,.45)]",
        props.className,
      )}
    >
      <MagnifierView
        world={props}
        lens={lens}
        className="rounded-[18px] bg-(--ovio-surface)"
        glassClassName="bg-white/40"
        rimClassName="-inset-2.5 border-10 border-(--ovio-yellow) bg-[radial-gradient(34%_24%_at_28%_20%,rgba(255,255,255,.85),transparent_75%)] shadow-[inset_0_3px_0_rgba(255,255,255,.55),inset_0_-4px_0_rgba(0,0,0,.15),0_7px_0_var(--ovio-yellow-deep),0_24px_24px_-8px_rgba(0,0,0,.35)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] shadow-[inset_0_4px_8px_rgba(0,0,0,.28)]"
        />
      </MagnifierView>
      {/* The zoom as a knob in a groove: drag it or click along it; a pinch and + / - slide it too. */}
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Zoom"
        aria-valuemin={minZoom}
        aria-valuemax={maxZoom}
        aria-valuenow={Number(zoom.toFixed(1))}
        aria-valuetext={`${zoom.toFixed(1)} times`}
        aria-disabled={disabled || undefined}
        className="relative h-5.5 cursor-grab touch-none rounded-full bg-(--ovio-accent-deep) shadow-[inset_0_3px_5px_rgba(0,0,0,.35)] select-none active:cursor-grabbing"
        onPointerDown={(e) => {
          if (disabled || !e.isPrimary) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setHeld(true);
          slideTo(e);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) slideTo(e);
        }}
        onPointerUp={() => setHeld(false)}
        onPointerCancel={() => setHeld(false)}
        onKeyDown={onKeyDown}
      >
        <motion.span
          className="absolute top-1/2 -mt-4.75 -ml-4.5 h-8.5 w-9 rounded-xl bg-(--ovio-red) shadow-[inset_0_3px_0_rgba(255,255,255,.3),inset_0_-4px_0_rgba(0,0,0,.14),0_5px_0_var(--ovio-red-deep)]"
          style={{ left: lens.zoomAt }}
          animate={{ y: held ? 3 : 0, scaleX: held ? 1.08 : 1 }}
          transition={motionTokens.toy.key}
        />
      </div>
      <div className="flex justify-between gap-3 text-xs font-extrabold tracking-[0.12em] text-white/85">
        <span className="min-w-0 truncate uppercase">{props.label}</span>
        <motion.b className="shrink-0 text-white">{lens.readout}</motion.b>
      </div>
    </div>
  );
}
