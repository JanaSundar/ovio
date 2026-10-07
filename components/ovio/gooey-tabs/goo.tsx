"use client";

import { motion, type Transition } from "motion/react";
import type { CSSProperties } from "react";
import { useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { STATUS_INDEX, type GooeyTabsWorldProps } from "./gooey-tabs";

/** How a world draws the goo tab bar. Minimal, Craft and Retro share the renderer and differ here. */
export type GooLook = {
  world: "minimal" | "craft" | "retro";
  track: CSSProperties;
  blob: string;
  blobRadius: string;
  /** Text colour on and off the indicator. */
  on: string;
  off: string;
  tab: string;
  label: string;
  statusText: string;
  /** One transition per blob: the trailing blobs arrive later, which stretches the goo. */
  trail: [Transition, Transition, Transition];
  /** Status dot colours: offline, building, online. */
  dots: [string, string, string];
  /** Easing for the building orbit. */
  orbitEase: Transition["ease"];
  colorDelay: number;
};

/** The goo filter: blur the blobs together, then cut the alpha back to a hard edge. */
export function GooFilter({ id, blur }: { id: string; blur: number }) {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="b" />
          <feColorMatrix
            in="b"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function GooTabs({ look, ...p }: GooeyTabsWorldProps & { look: GooLook }) {
  const reduced = useReducedMotionSafe();
  const n = p.tabs.length;
  const w = 100 / n;
  const left = `${p.index * w}%`;
  const blobs = [
    { top: "0%", width: w, ml: 0, radius: look.blobRadius },
    { top: "10%", width: w * 0.8, ml: w * 0.1, radius: "999px" },
    { top: "24%", width: w * 0.48, ml: w * 0.26, radius: "999px" },
  ];
  const s = p.status ? STATUS_INDEX[p.status] : 0;
  const dot = look.dots[s];
  const loop = (t: Transition): Transition => (reduced ? { duration: 0 } : t);

  return (
    <div
      data-ovio-world={look.world}
      className={cn(
        "flex w-full flex-col items-center gap-10 font-(family-name:--ovio-font) text-(--ovio-ink)",
        p.className,
      )}
    >
      <GooFilter id={p.filterId} blur={p.goo} />
      <div className="relative w-full max-w-[540px] p-1.5" style={look.track}>
        <div aria-hidden className="absolute inset-1.5" style={{ filter: `url(#${p.filterId})` }}>
          {blobs.map((b, j) => (
            <motion.div
              key={j}
              className="absolute"
              initial={false}
              animate={{ left }}
              transition={reduced ? { duration: 0 } : look.trail[j]}
              style={{
                top: b.top,
                bottom: b.top,
                width: `${b.width}%`,
                marginLeft: `${b.ml}%`,
                background: look.blob,
                borderRadius: b.radius,
              }}
            />
          ))}
        </div>
        <div
          role="tablist"
          aria-label={p.label}
          onKeyDown={p.onKeyDown}
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {p.tabs.map((tab, i) => {
            const active = i === p.index;
            return (
              <motion.button
                key={tab}
                ref={p.tabRef(i)}
                id={p.tabId(i)}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={p.panelId}
                tabIndex={active ? 0 : -1}
                onClick={() => p.select(i)}
                className={cn("cursor-pointer border-0 bg-transparent font-[inherit]", look.tab)}
                initial={false}
                animate={{ color: active ? look.on : look.off }}
                transition={reduced ? { duration: 0 } : { duration: 0.25, delay: look.colorDelay }}
              >
                {tab}
              </motion.button>
            );
          })}
        </div>
      </div>

      {p.status && (
        <div className="flex flex-wrap items-center justify-center gap-[22px]">
          <div
            aria-hidden
            className="relative h-11 w-[120px]"
            style={{ filter: `url(#${p.filterId})` }}
          >
            {[
              { size: 34, x: 0, delay: 0 },
              { size: 20, x: 38, delay: 0 },
              { size: 16, x: -38, delay: 0.3 },
            ].map((d, j) => (
              <motion.div
                key={j}
                className="absolute top-1/2 left-1/2 rounded-full"
                style={{
                  width: d.size,
                  height: d.size,
                  margin: `${-d.size / 2}px 0 0 ${-d.size / 2}px`,
                }}
                initial={false}
                animate={{
                  backgroundColor: dot,
                  x: j > 0 && s === 1 && !reduced ? [0, d.x, 0] : 0,
                  scale: j === 0 && s === 2 && !reduced ? [1, 1.18, 1] : 1,
                }}
                transition={{
                  backgroundColor: loop({ duration: 0.6 }),
                  x: loop({
                    duration: 1.2,
                    ease: look.orbitEase,
                    delay: d.delay,
                    repeat: Infinity,
                  }),
                  scale: loop({ duration: 2.4, ease: "easeInOut", repeat: Infinity }),
                }}
              />
            ))}
          </div>
          <div className="flex min-w-[150px] flex-col gap-0.5" role="status">
            <span className={cn("opacity-65", look.label)}>Deploy status</span>
            <span className={look.statusText}>{p.statusLabel}</span>
          </div>
        </div>
      )}

      {p.panel !== undefined && (
        <div
          id={p.panelId}
          role="tabpanel"
          aria-labelledby={p.tabId(p.index)}
          className={cn("opacity-60", look.label)}
        >
          {p.panel}
        </div>
      )}
    </div>
  );
}
