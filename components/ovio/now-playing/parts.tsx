"use client";

import { useAnimate, type Transition } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motionTokens, steps, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Volume runs 0–10. */
export const VOLUME_STEPS = 11;

/** 134 → "2:14". */
export const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

/** m:ss in fixed-width digits, so the clock doesn't jitter as it ticks. */
export function Time({ seconds, className }: { seconds: number; className?: string }) {
  return (
    <span className={cn("whitespace-nowrap tabular-nums", className)}>{formatTime(seconds)}</span>
  );
}

/**
 * How a progress fill moves: a clock tick glides linearly over the next second so the bar never
 * stops, a seek snaps quickly, and a stepped world jumps in frames.
 */
export function useFillTransition(ticking: boolean, stepped = false): Transition {
  return useOvioTransition(
    ticking
      ? { duration: 1, ease: stepped ? steps(4) : "linear" }
      : stepped
        ? motionTokens.retro.frames(2, 0.12)
        : motionTokens.minimal.base,
  );
}

/** Deterministic per-bar timing, so bars never move in lockstep. */
const BARS = Array.from({ length: 12 }, (_, i) => ({
  duration: 0.6 + ((i * 37) % 10) / 14,
  delay: ((i * 53) % 17) / 10,
  rest: (40 + ((i * 13) % 40)) / 100,
}));

/**
 * Equaliser bars that bounce while playing and settle at staggered heights when paused.
 * Loops run from an effect so a parent `AnimatePresence initial={false}` cannot skip them.
 */
export function EqBars({
  count,
  playing,
  stepped = false,
  className,
  barClassName,
}: {
  count: number;
  playing: boolean;
  stepped?: boolean;
  className?: string;
  barClassName?: string;
}) {
  const reduced = useReducedMotionSafe();
  const [scope, run] = useAnimate<HTMLSpanElement>();

  useEffect(() => {
    const bars = BARS.slice(0, count);
    const els = [...scope.current.children] as HTMLElement[];
    if (!playing || reduced) {
      const settle = els.map((el, i) =>
        run(el, { scaleY: bars[i].rest }, reduced ? { duration: 0 } : motionTokens.minimal.slow),
      );
      return () => settle.forEach((a) => a.stop());
    }
    const loops = els.map((el, i) =>
      run(
        el,
        { scaleY: [bars[i].rest, 1, 0.25, bars[i].rest] },
        {
          duration: bars[i].duration * 1.5,
          ease: stepped ? steps(3) : "easeInOut",
          repeat: Infinity,
          delay: bars[i].delay / 4,
        },
      ),
    );
    return () => loops.forEach((a) => a.stop());
  }, [count, playing, reduced, stepped, run, scope]);

  return (
    <span ref={scope} aria-hidden className={cn("flex items-end", className)}>
      {BARS.slice(0, count).map((b, i) => (
        <span
          key={i}
          className={cn("h-full origin-bottom", barClassName)}
          style={{ transform: `scaleY(${b.rest})` }}
        />
      ))}
    </span>
  );
}

/** Scales fixed-size art down to fit its container's width. */
export function useFit(width: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w) setFit(Math.min(1, w / width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return [ref, fit] as const;
}

/** Cover art filling its (positioned) parent. */
export function Artwork({ src }: { src: string }) {
  return (
    // A plain img: covers come from any host, and next/image would need each one configured.
    // oxlint-disable-next-line next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      className="absolute inset-0 size-full object-cover"
    />
  );
}
