"use client";

import { motion } from "motion/react";
import { motionTokens, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { formatDelta, type NpmDownloadsWorldProps } from "../npm-downloads";

/** Cells in the text progress bar. */
const CELLS = 20;

const bar = (color: string) => `repeating-linear-gradient(0deg,${color} 0 5px,transparent 5px 7px)`;

export function RetroNpmDownloads({
  packageName,
  points,
  selected,
  current,
  currentText,
  select,
  reset,
  onKeyDown,
  peak,
  goal,
  goalProgress,
  summary,
  className,
}: NpmDownloadsWorldProps) {
  const reduced = useReducedMotionSafe();
  const filled = Math.round(goalProgress * CELLS);

  // Bars switch on one after another in single hard frames.
  const frame = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { ...motionTokens.retro.frames(1, 0.01), delay: i * 0.05 },
        };

  return (
    <section
      data-ovio-world="retro"
      aria-label={`${packageName} weekly downloads`}
      className={cn(
        "relative flex w-full max-w-[640px] flex-col gap-5 bg-(--ovio-stage) p-8 font-(family-name:--ovio-font) text-(--ovio-ink) [text-shadow:var(--ovio-glow)]",
        className,
      )}
    >
      <div className="flex justify-between gap-4 text-[22px]">
        <span className="min-w-0 [overflow-wrap:anywhere]">NPM://{packageName.toUpperCase()}</span>
        <span className="shrink-0 text-(--ovio-ink-2)">
          {current.ago === 0 ? "DL/WK" : `${current.label.toUpperCase()} · -${current.ago}WK`}
        </span>
      </div>
      <div className="flex">
        <span className="border-2 border-(--ovio-faint) bg-(--ovio-surface) px-3.5 text-[clamp(40px,13vw,66px)] leading-[1.1] text-[#c9ffd2]">
          <span className="tabular-nums">{formatNumber(current.downloads)}</span>
        </span>
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
        className="flex h-[120px] items-end gap-[3px]"
      >
        {points.map((p, i) => (
          <div
            key={p.week}
            className="flex h-full flex-1 items-end"
            onPointerEnter={() => select(i)}
          >
            <motion.div
              className="w-full"
              style={{
                height: `${(p.height * 100).toFixed(1)}%`,
                background: bar(i === selected ? "#c9ffd2" : "var(--ovio-accent)"),
              }}
              {...frame(i)}
            />
          </div>
        ))}
      </div>

      <div className="text-xl leading-tight text-(--ovio-ink-2)">
        <div>
          &gt; {formatDelta(current.delta)} WOW · PEAK {formatNumber(peak)}
          <motion.span
            aria-hidden
            animate={reduced ? undefined : { opacity: [1, 0] }}
            transition={motionTokens.retro.blink}
          >
            _
          </motion.span>
        </div>
        {goal !== undefined && (
          <div>
            &gt; GOAL {formatNumber(goal)}{" "}
            <span aria-hidden>
              [{"█".repeat(filled)}
              {"░".repeat(CELLS - filled)}]
            </span>{" "}
            {formatNumber(goalProgress, { style: "percent" })}
          </div>
        )}
      </div>
      <div aria-hidden className="ovio-scanlines" />
    </section>
  );
}
