"use client";

import { motion, useAnimate, type Transition } from "motion/react";
import { useEffect, type CSSProperties } from "react";
import { GooFilter } from "@/components/shared/goo-filter";
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
  colorDelay: number;
};

/**
 * The deploy status: a dot with two satellites under the goo filter. Building swings the satellites
 * out and back (the second a beat late) so they pull away from the dot; Online breathes the dot.
 * Leaving a state snaps back to rest, as a CSS animation does when it is removed.
 */
const STATUS_DOTS = [
  { size: 34, orbit: 0, delay: 0 },
  { size: 20, orbit: 38, delay: 0 },
  { size: 16, orbit: -38, delay: 0.3 },
];
const ORBIT: Transition = { duration: 1.2, ease: [0.5, 0, 0.5, 1], repeat: Infinity };
const BREATHE: Transition = { duration: 2.4, ease: "easeInOut", repeat: Infinity };

/**
 * Runs the loops from an effect rather than as mount animations: a parent `AnimatePresence
 * initial={false}` would otherwise skip them when the bar first renders already building.
 */
function StatusDots({
  status,
  colors,
  filterId,
}: {
  status: number;
  colors: GooLook["dots"];
  filterId: string;
}) {
  const reduced = useReducedMotionSafe();
  const [scope, run] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    if (reduced) return;
    const dots = [...scope.current.children] as HTMLElement[];
    const loops =
      status === 1
        ? STATUS_DOTS.flatMap((d, j) =>
            d.orbit ? [run(dots[j], { x: [0, d.orbit, 0] }, { ...ORBIT, delay: d.delay })] : [],
          )
        : status === 2
          ? [run(dots[0], { scale: [1, 1.18, 1] }, BREATHE)]
          : [];
    return () => {
      loops.forEach((l) => l.stop());
      run(dots, { x: 0, scale: 1 }, { duration: 0 });
    };
  }, [status, reduced, run, scope]);

  return (
    <div
      ref={scope}
      aria-hidden
      className="relative h-11 w-[120px]"
      style={{ filter: `url(#${filterId})` }}
    >
      {STATUS_DOTS.map((d, j) => (
        <div
          key={j}
          className="absolute top-1/2 left-1/2 rounded-full transition-[background-color] duration-600 motion-reduce:transition-none"
          style={{
            width: d.size,
            height: d.size,
            margin: `${-d.size / 2}px 0 0 ${-d.size / 2}px`,
            backgroundColor: colors[status],
          }}
        />
      ))}
    </div>
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
  const st = p.status ? STATUS_INDEX[p.status] : 0;

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
          <StatusDots status={st} colors={look.dots} filterId={p.filterId} />
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
