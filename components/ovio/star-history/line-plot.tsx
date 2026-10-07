"use client";

import { motion, type Transition } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { linePath, smoothPath, type ShapedPoint, type StarHistoryShape } from "./shape";
import type { StarHistoryAnimation } from "./star-history";
import type { Scrubber } from "./use-scrubber";

/** How a world draws its line: stroke, curve, and how the line and marker move. */
export type LineLook = {
  curve: "line" | "smooth";
  stroke: string;
  strokeWidth: number;
  /** The entrance: the line draws in from the first day to the last. */
  draw: Transition;
  /** How the hover marker travels between points. */
  follow: Transition;
  /** Fill of the hover marker and the live marker. */
  marker: string;
  /** Hover crosshair colour. */
  rule: string;
};

/** Pixel position of a point inside the plot. */
type PlotAt = (p: ShapedPoint) => { x: number; y: number };

type LinePlotProps = {
  shape: StarHistoryShape;
  scrub: Scrubber;
  look: LineLook;
  animation: StarHistoryAnimation;
  dataKey: string;
  className?: string;
  /** World overlays (annotations, the hover readout), placed with `at`. */
  children: (at: PlotAt, active: ShapedPoint | null) => ReactNode;
};

/** Plot size before the first measure; the viewBox stretches to fit until then. */
const FALLBACK = { w: 600, h: 240 };
const TOP = 14;
const BOTTOM = 6;

/**
 * The line chart shared by Minimal and Craft: an SVG drawn in pixels of its box (so strokes and
 * dots never stretch), the path drawing in with Motion pathLength, and a focusable scrubber on top.
 */
export function LinePlot({
  shape,
  scrub,
  look,
  animation,
  dataKey,
  className,
  children,
}: LinePlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(FALLBACK);
  const draw = useOvioTransition(look.draw);
  const follow = useOvioTransition(look.follow);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const at: PlotAt = (p) => ({
    x: p.x * size.w,
    y: size.h - BOTTOM - p.y * (size.h - TOP - BOTTOM),
  });
  const xy = shape.points.map((p) => {
    const { x, y } = at(p);
    return [x, y] as [number, number];
  });
  const d = look.curve === "smooth" ? smoothPath(xy) : linePath(xy);
  const active = scrub.index === null ? null : shape.points[scrub.index];
  const last = shape.points.at(-1);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <svg
        aria-hidden
        viewBox={`0 0 ${size.w} ${size.h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
      >
        <motion.path
          key={dataKey}
          d={d}
          fill="none"
          stroke={look.stroke}
          strokeWidth={look.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animation === "none" ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={draw}
        />
        {animation === "always" && last && (
          <motion.circle
            cx={at(last).x}
            cy={at(last).y}
            r={4}
            fill={look.marker}
            animate={{ r: [4, 11], opacity: [0.45, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        {active && (
          <>
            <motion.line
              y1={0}
              y2={size.h}
              stroke={look.rule}
              strokeDasharray="3 3"
              initial={false}
              animate={{ x1: at(active).x, x2: at(active).x }}
              transition={follow}
            />
            <motion.circle
              r={4.5}
              fill={look.marker}
              initial={false}
              animate={{ cx: at(active).x, cy: at(active).y }}
              transition={follow}
            />
          </>
        )}
      </svg>
      {children(at, active)}
      <div
        {...scrub.props}
        className="absolute inset-0 cursor-crosshair touch-pan-y rounded-(--ovio-radius) outline-offset-4 focus-visible:outline-2 focus-visible:outline-(--ovio-accent)"
      />
    </div>
  );
}
