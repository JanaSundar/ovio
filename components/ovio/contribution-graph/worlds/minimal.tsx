"use client";

import { motion } from "motion/react";
import { memo } from "react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ContributionGraphWorldProps } from "../contribution-graph";
import { dayCellProps, useScrollEnd } from "../grid";
import { unit, type ContributionCell } from "../year";

const SCALE = ["#ebe9e4", "#c9c6bf", "#97938a", "#5d5a53", "#1d1c1a"];
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

type CellProps = { cell: ContributionCell; tabbable: boolean; active: boolean; enter: boolean };

/** A square that fades in by week and takes a thin ink ring when hovered or focused. */
const Cell = memo(function Cell({ cell, tabbable, active, enter }: CellProps) {
  const ring = useOvioTransition(motionTokens.minimal.base);
  const p = dayCellProps(cell, tabbable);
  const fade = { ...motionTokens.minimal.slow, delay: cell.week * 0.009 };

  return (
    <motion.div
      {...p}
      initial={enter ? { opacity: 0, y: 3 } : false}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: active ? "0 0 0 1.5px #161614" : "0 0 0 0px #161614",
      }}
      transition={{ opacity: fade, y: fade, boxShadow: ring }}
      className="rounded-[2px] outline-none"
      style={{ ...p.style, background: SCALE[cell.level] }}
    />
  );
});

/** Minimal: an editorial heatmap. Big total, thin rules, a neutral five-step ramp. */
export function MinimalContributionGraph({
  year,
  active,
  focusIndex,
  animation,
  grid,
  className,
}: ContributionGraphWorldProps) {
  const scroller = useScrollEnd<HTMLDivElement>();
  const enter = animation !== "none";
  const day = active ?? year.best;

  return (
    <section
      data-ovio-world="minimal"
      className={cn(
        "flex w-full min-w-0 flex-col gap-10 rounded-(--ovio-radius) border border-(--ovio-line) bg-(--ovio-surface) px-6 py-8 sm:px-14 sm:pt-[52px] sm:pb-11 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <div className="mb-3.5 text-[11px] tracking-[0.12em] text-(--ovio-muted) uppercase">
            Contribution activity · last 12 months
          </div>
          <div className="flex items-baseline gap-3.5">
            <RollingNumber
              className="text-[56px] leading-none font-normal tracking-[-0.04em]"
              value={year.total}
            />
            <span className="text-[15px] text-(--ovio-muted)">contributions</span>
          </div>
        </div>
        <dl className="m-0 flex flex-wrap">
          {[
            ["Longest streak", `${year.longest} days`],
            ["Current streak", `${year.current} days`],
            ["Busiest day", year.busiestWeekday],
          ].map(([label, value], i) => (
            <div
              key={label}
              className={cn("border-l border-(--ovio-line) px-7", i === 2 && "pr-0")}
            >
              <dt className="mb-1.5 text-[11px] text-(--ovio-muted)">{label}</dt>
              <dd className="m-0 text-[22px] tracking-[-0.02em]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div ref={scroller} className="overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:thin]">
        <div className="grid w-max grid-cols-[32px_auto] gap-x-0 gap-y-2 text-[10px] text-(--ovio-muted)">
          <div />
          <div aria-hidden className="grid h-3 auto-cols-[12px] grid-flow-col gap-[3px]">
            {year.months.map((m) => (
              <span key={m.week} className="whitespace-nowrap" style={{ gridColumn: m.week + 1 }}>
                {m.label}
              </span>
            ))}
          </div>
          <div aria-hidden className="grid grid-rows-[repeat(7,12px)] gap-[3px]">
            {WEEKDAY_LABELS.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
          <div
            {...grid}
            className="grid auto-cols-[12px] grid-flow-col grid-rows-[repeat(7,12px)] gap-[3px]"
          >
            {year.rows.map((row, r) => (
              <div key={r} role="row" className="contents">
                {row.map((cell) => (
                  <Cell
                    key={cell.date}
                    cell={cell}
                    tabbable={cell.index === focusIndex}
                    active={cell.index === active?.index}
                    enter={enter}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-(--ovio-line-2) pt-[18px] text-[13px]">
        <div className="flex items-baseline gap-2.5">
          {!active && <span className="text-(--ovio-muted)">Best day</span>}
          <span className="font-medium">
            <RollingNumber value={day.count} /> {unit(day.count)}
          </span>
          <span className="text-(--ovio-muted)">on {day.label}</span>
        </div>
        <div aria-hidden className="flex items-center gap-1 text-[11px] text-(--ovio-muted)">
          Less
          {SCALE.map((c, i) => (
            <span
              key={c}
              className={cn("size-3 rounded-[2px]", i === 0 && "ml-1", i === 4 && "mr-1")}
              style={{ background: c }}
            />
          ))}
          More
        </div>
      </div>
    </section>
  );
}
