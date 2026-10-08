"use client";

import { motion } from "motion/react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { formatMonth } from "../shape";
import type { StarHistoryWorldProps } from "../star-history";
import { useMonthScrubber } from "../use-scrubber";

/** Bricks in the tallest column. */
const STACK = 14;

export function ToyStarHistory({
  shape,
  name,
  label,
  animation,
  entered,
  dataKey,
  className,
}: StarHistoryWorldProps) {
  const scrub = useMonthScrubber(shape, label);
  const active = scrub.index === null ? null : shape.months[scrub.index];
  const lift = useOvioTransition(motionTokens.toy.piece);
  const drop = useOvioTransition(motionTokens.toy.slide);
  const first = shape.months[0];
  const last = shape.months.at(-1);

  return (
    <figure
      data-ovio-world="toy"
      className={cn(
        "m-0 flex w-full max-w-[680px] flex-col gap-3.5 rounded-[22px] bg-(--ovio-surface) px-[22px] pt-5 pb-[18px] font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_1px_0_#fff,0_7px_0_#d2ccbf,0_22px_30px_-16px_rgba(40,28,10,.45)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-(family-name:--ovio-mono) text-[11px] tracking-[0.08em] text-(--ovio-muted) uppercase">
            Star history · {name}
          </div>
          <div
            className="text-2xl font-extrabold tracking-[-0.02em]"
            style={{ fontStretch: "118%" }}
          >
            Stacked month by month
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-[10px] bg-[#2a2925] p-1.5 shadow-[inset_0_2px_5px_rgba(0,0,0,.6)]">
          {animation === "always" && (
            <motion.span
              aria-hidden
              className="ml-1 size-2 rounded-full bg-(--ovio-red) shadow-[0_0_6px_var(--ovio-red)]"
              animate={{ opacity: [1, 0.25] }}
              transition={{ duration: 0.9, repeat: Infinity, repeatType: "reverse" }}
            />
          )}
          <RollingNumber
            className="rounded-[4px] bg-(--ovio-surface) px-3 py-0.5 font-(family-name:--ovio-mono) text-[22px] leading-8 font-semibold shadow-[inset_0_-7px_6px_-5px_rgba(0,0,0,.25),inset_0_7px_6px_-5px_rgba(0,0,0,.25)]"
            value={active?.stars ?? (entered ? shape.total : 0)}
          />
        </div>
      </div>
      <div className="relative flex min-h-[220px] flex-1 items-end gap-1 rounded-xl bg-[#ebe6db] p-2 shadow-[inset_0_3px_6px_rgba(40,28,10,.2)]">
        {shape.months.map((m, i) => {
          const color = m.notes.length ? "var(--ovio-red)" : "var(--ovio-accent)";
          return (
            <motion.div
              key={`${dataKey}-${m.year}-${m.month}`}
              aria-hidden
              className="flex flex-1 flex-col-reverse gap-0.5"
              initial={false}
              animate={{ y: i === scrub.index ? -8 : 0 }}
              transition={lift}
            >
              {Array.from({ length: Math.max(1, Math.round(m.h * STACK)) }, (_, j) => (
                <motion.div
                  key={j}
                  className="h-[13px] rounded-[3px] shadow-[inset_0_-3px_0_rgba(0,0,0,.2),inset_0_1px_0_rgba(255,255,255,.35)]"
                  style={{ background: color }}
                  initial={animation === "none" ? false : { y: -48, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ ...drop, delay: i * 0.022 + j * 0.018 }}
                />
              ))}
            </motion.div>
          );
        })}
        <div {...scrub.props} className="absolute inset-0 cursor-pointer touch-pan-y rounded-xl" />
      </div>
      <div
        aria-hidden
        className="flex justify-between gap-3 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted) uppercase"
      >
        <span>{first && formatMonth(first)}</span>
        {active ? (
          <span className="text-(--ovio-ink)">
            {formatMonth(active)} +{formatNumber(active.gain)}
          </span>
        ) : (
          <span className="truncate text-(--ovio-red-deep)">
            {shape.annotations.map((a) => `■ ${a.label}`).join("  ")}
          </span>
        )}
        <span>{last && formatMonth(last)}</span>
      </div>
      <figcaption className="sr-only">{shape.summary}</figcaption>
    </figure>
  );
}
