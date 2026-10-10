"use client";

import { motion } from "motion/react";
import { motionTokens, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { formatDelta, type NpmDownloadsWorldProps } from "../npm-downloads";

export function MinimalNpmDownloads({
  packageName,
  points,
  latest,
  selected,
  current,
  currentText,
  select,
  reset,
  onKeyDown,
  total,
  goal,
  goalProgress,
  goalHeight,
  summary,
  className,
}: NpmDownloadsWorldProps) {
  const reduced = useReducedMotionSafe();
  const fast = reduced ? { duration: 0 } : motionTokens.minimal.fast;
  const up = (current.delta ?? 0) >= 0;

  return (
    <section
      data-ovio-world="minimal"
      aria-label={`${packageName} weekly downloads`}
      className={cn(
        "flex w-full max-w-[640px] flex-col gap-6 rounded-(--ovio-radius) border border-(--ovio-line) bg-(--ovio-surface) px-10 py-9 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2.5 text-[11px] tracking-[0.12em] text-(--ovio-muted) uppercase [overflow-wrap:anywhere]">
            {current.ago === 0 ? "Weekly downloads" : `Week of ${current.label}`} · {packageName}
          </div>
          <span className="text-[clamp(34px,11vw,52px)] leading-none tracking-[-0.045em] tabular-nums">
            {formatNumber(current.downloads)}
          </span>
        </div>
        {current.delta !== null && (
          <div className={cn("text-[13px]", up ? "text-[#2f7a45]" : "text-[#b5311a]")}>
            {formatDelta(current.delta, ["↑ ", "↓ "])}{" "}
            <span className="text-(--ovio-muted)">vs week before</span>
          </div>
        )}
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label={summary}
        aria-valuemin={0}
        aria-valuemax={points.length - 1}
        aria-valuenow={selected}
        aria-valuetext={currentText}
        onKeyDown={onKeyDown}
        onPointerLeave={reset}
        onBlur={reset}
        className="relative flex h-[150px] items-end gap-1 border-b border-(--ovio-line)"
      >
        {points.map((p, i) => (
          <div
            key={p.week}
            className="flex h-full flex-1 items-end"
            onPointerEnter={() => select(i)}
          >
            <motion.div
              className="w-full origin-bottom"
              style={{ height: `${(p.height * 100).toFixed(1)}%` }}
              initial={reduced ? false : { scaleY: 0 }}
              animate={{
                scaleY: 1,
                backgroundColor: i === selected ? "#161614" : "#d6d3cc",
              }}
              transition={{
                scaleY: reduced
                  ? { duration: 0 }
                  : { ...motionTokens.minimal.slow, delay: i * 0.016 },
                backgroundColor: fast,
              }}
            />
          </div>
        ))}
        {goal !== undefined && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-(--ovio-faint)"
            style={{ bottom: `${(goalHeight * 100).toFixed(1)}%` }}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? { duration: 0 } : { ...motionTokens.minimal.slow, delay: 0.2 }}
          >
            <span className="absolute -top-[18px] right-0 bg-(--ovio-surface) pl-1.5 text-[11px] text-(--ovio-muted)">
              Goal {formatNumber(goal)}
            </span>
          </motion.div>
        )}
      </div>

      <div className="-mt-3 flex justify-between text-[11px] text-(--ovio-muted)">
        <span>{points[0]?.label}</span>
        <span>{latest.label}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-(--ovio-line-2) pt-4 text-[13px] text-(--ovio-ink-2)">
        <span>
          {points.length}-week total{" "}
          <span className="font-(family-name:--ovio-mono)">{formatNumber(total)}</span>
        </span>
        {goal !== undefined && (
          <span className="ml-auto flex items-center gap-2.5">
            <span aria-hidden className="h-1 w-24 overflow-hidden rounded-full bg-(--ovio-track)">
              <motion.span
                className="block h-full origin-left rounded-full bg-(--ovio-accent)"
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: goalProgress }}
                transition={reduced ? { duration: 0 } : motionTokens.minimal.slow}
              />
            </span>
            <span className="font-(family-name:--ovio-mono)">
              {formatNumber(goalProgress, { style: "percent" })}
            </span>
            of goal
          </span>
        )}
      </div>
    </section>
  );
}
