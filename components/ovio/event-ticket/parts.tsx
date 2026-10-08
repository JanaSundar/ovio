"use client";

import { motion, type Transition } from "motion/react";
import { useMemo } from "react";
import { useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { hashString, random } from "./seed";

/** Bars for the stub, drawn from the ticket number, with a laser sweeping across them. */
export function Barcode({
  value,
  laser,
  sweep,
  className,
}: {
  value: string;
  /** Laser colour. */
  laser: string;
  sweep: Transition;
  className?: string;
}) {
  const reduced = useReducedMotionSafe();
  const { d, width } = useMemo(() => {
    const r = random(hashString(value));
    let x = 0;
    let path = "";
    while (x < 230) {
      const w = [1, 1, 2, 3, 2, 4][Math.floor(r() * 6)];
      path += `M${x} 0h${w}v1h-${w}z`;
      x += w + [1, 2, 2, 3][Math.floor(r() * 4)];
    }
    return { d: path, width: x };
  }, [value]);

  return (
    <div className={cn("relative h-16 overflow-hidden", className)}>
      <svg
        aria-hidden
        viewBox={`0 0 ${width} 1`}
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        className="block size-full"
      >
        <path d={d} fill="currentColor" />
      </svg>
      {!reduced && (
        <motion.span
          aria-hidden
          className="absolute inset-y-0 -ml-px w-[3px]"
          style={{ background: laser, boxShadow: `0 0 12px 2px ${laser}` }}
          initial={{ left: "0%" }}
          animate={{ left: ["0%", "100%", "0%"] }}
          transition={{ ...sweep, repeat: Infinity }}
        />
      )}
    </div>
  );
}
