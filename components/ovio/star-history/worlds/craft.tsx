"use client";

import { motion } from "motion/react";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { LinePlot, type LineLook } from "../parts";
import { formatDate, formatNumber } from "@/lib/format";
import type { StarHistoryWorldProps } from "../star-history";
import { usePointScrubber } from "../use-scrubber";

/** Ballpoint blue, as if the line were inked onto graph paper. */
const PEN = "#2b4a9b";
const DRAW = 1;

const look: LineLook = {
  curve: "smooth",
  stroke: PEN,
  strokeWidth: 3.5,
  draw: { duration: DRAW, ease: [0.4, 0, 0.2, 1] },
  // The marker tracks the pointer: quick and without overshoot, so it never lags the finger.
  follow: motionTokens.minimal.fast,
  marker: PEN,
  rule: "rgba(43,74,155,.35)",
};

export function CraftStarHistory({
  shape,
  label,
  animation,
  dataKey,
  className,
}: StarHistoryWorldProps) {
  const scrub = usePointScrubber(shape, label);
  const active = scrub.index === null ? null : shape.points[scrub.index];
  const stick = useOvioTransition(motionTokens.craft.slow);

  return (
    // The sheet stays put while hovered: the whole surface is a scrubber, so lifting it would
    // move the chart under the pointer.
    <figure
      data-ovio-world="craft"
      style={{ rotate: "-0.8deg" }}
      className={cn(
        "m-0 flex w-full max-w-[680px] flex-col gap-3 rounded-[4px] bg-[#fdfbf5] bg-[linear-gradient(rgba(49,120,198,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(49,120,198,.12)_1px,transparent_1px)] bg-size-[16px_16px] px-6 py-[22px] font-(family-name:--ovio-font) text-(--ovio-ink) shadow-(--ovio-shadow)",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xl font-extrabold tracking-[-0.02em]">Stars over time</span>
        <span className="flex items-baseline gap-2">
          {active && (
            <span className="font-(family-name:--ovio-mono) text-xs text-(--ovio-muted)">
              {formatDate(active.time)}
            </span>
          )}
          <span
            className="font-(family-name:--ovio-hand) text-[28px] leading-none tabular-nums"
            style={{ color: PEN }}
          >
            {formatNumber(active?.stars ?? shape.total)}
          </span>
        </span>
      </div>
      <LinePlot
        shape={shape}
        scrub={scrub}
        look={look}
        animation={animation}
        dataKey={dataKey}
        className="min-h-[220px] flex-1"
      >
        {(at) =>
          shape.annotations.map((a) => {
            const { x, y } = at(a.point);
            return (
              // A sticky note, slapped on once the pen has passed it.
              <div
                key={`${a.date}-${a.label}`}
                aria-hidden
                className="pointer-events-none absolute -translate-x-[30%] -translate-y-[125%]"
                style={{ left: x, top: y }}
              >
                <motion.div
                  className="bg-[#ffe27a] px-3 py-2 font-(family-name:--ovio-hand) text-[21px] leading-none whitespace-nowrap shadow-[0_5px_10px_-3px_rgba(90,60,0,.35)]"
                  initial={animation === "none" ? false : { opacity: 0, scale: 0.9, rotate: -14 }}
                  animate={{ opacity: 1, scale: 1, rotate: -5 }}
                  transition={{ ...stick, delay: DRAW * a.point.x + 0.1 }}
                >
                  {a.label}
                </motion.div>
              </div>
            );
          })
        }
      </LinePlot>
      <figcaption className="sr-only">{shape.summary}</figcaption>
    </figure>
  );
}
