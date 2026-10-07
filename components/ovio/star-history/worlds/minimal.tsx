"use client";

import { motion } from "motion/react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { LinePlot, type LineLook } from "../line-plot";
import { formatDate } from "@/lib/format";
import { formatMonth, monthTicks } from "../shape";
import type { StarHistoryWorldProps } from "../star-history";
import { usePointScrubber } from "../use-scrubber";

const DRAW = 1.6;

const look: LineLook = {
  curve: "line",
  stroke: "var(--ovio-ink)",
  strokeWidth: 1.5,
  draw: { duration: DRAW, ease: [0.4, 0, 0.2, 1] },
  follow: motionTokens.minimal.fast,
  marker: "var(--ovio-ink)",
  rule: "var(--ovio-faint)",
};

export function MinimalStarHistory({
  shape,
  name,
  label,
  animation,
  entered,
  dataKey,
  className,
}: StarHistoryWorldProps) {
  const scrub = usePointScrubber(shape, label);
  const active = scrub.index === null ? null : shape.points[scrub.index];
  const fade = useOvioTransition(motionTokens.minimal.slow);

  return (
    <figure
      data-ovio-world="minimal"
      className={cn(
        "m-0 flex w-full max-w-[680px] flex-col gap-[18px] rounded-(--ovio-radius) border border-(--ovio-line) bg-(--ovio-surface) px-9 py-8 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[11px] tracking-[0.12em] text-(--ovio-muted) uppercase">
          Star history · {name}
        </span>
        <span className="flex items-baseline gap-2.5">
          {active && <span className="text-xs text-(--ovio-muted)">{formatDate(active.time)}</span>}
          <RollingNumber
            className="text-2xl tracking-[-0.03em]"
            value={active?.stars ?? (entered ? shape.total : 0)}
          />
        </span>
      </div>
      <LinePlot
        shape={shape}
        scrub={scrub}
        look={look}
        animation={animation}
        dataKey={dataKey}
        className="min-h-60 flex-1 bg-[repeating-linear-gradient(180deg,var(--ovio-line-2)_0_1px,transparent_1px_25%)]"
      >
        {(at) =>
          shape.annotations.map((a) => {
            const { x, y } = at(a.point);
            return (
              <motion.div
                key={`${a.date}-${a.label}`}
                aria-hidden
                className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-full flex-col items-center pb-1.5 text-[11px] whitespace-nowrap text-(--ovio-ink-2)"
                style={{ left: x, top: y }}
                initial={animation === "none" ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...fade, delay: DRAW * a.point.x }}
              >
                {a.label}
                <span className="mt-1 h-3 w-px bg-(--ovio-faint)" />
              </motion.div>
            );
          })
        }
      </LinePlot>
      <figcaption className="sr-only">{shape.summary}</figcaption>
      <div aria-hidden className="flex justify-between text-[11px] text-(--ovio-muted)">
        {monthTicks(shape).map((m) => (
          <span key={`${m.year}-${m.month}`}>{formatMonth(m)}</span>
        ))}
      </div>
    </figure>
  );
}
