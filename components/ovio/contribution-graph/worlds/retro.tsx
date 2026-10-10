"use client";

import { motion } from "motion/react";
import { memo, useRef } from "react";
import { motionTokens, steps } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ContributionGraphWorldProps } from "../contribution-graph";
import { dayCellProps, weekColumns, weekScroller, weeksMinWidth } from "../grid";
import { useCellEntrance } from "../use-cell-entrance";
import type { ContributionCell } from "../year";
import { formatNumber, PAD3 } from "@/lib/format";

const SCALE = ["#0f2414", "#1d5a2b", "#2f9a45", "#4fdc68", "#b8ffc4"];

type CellProps = { cell: ContributionCell; tabbable: boolean; active: boolean };

/** A phosphor pixel that burns white when hovered. */
const Cell = memo(function Cell({ cell, tabbable, active }: CellProps) {
  const p = dayCellProps(cell, tabbable);
  const lvl = cell.level;

  return (
    <div
      {...p}
      className="aspect-square"
      style={{
        ...p.style,
        background: active ? "#ffffff" : SCALE[lvl],
        boxShadow: active
          ? "0 0 10px #8dffa3"
          : lvl >= 3
            ? `0 0 ${lvl * 3}px rgba(80,255,120,.7)`
            : "none",
      }}
    />
  );
});

/** Pixels switch on in one hard frame, in scan order: column by column, top to bottom. */
const SWITCH_ON: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];
const SWITCH_ON_TIMING = {
  duration: 0.01,
  easing: "steps(1, end)",
  delay: (week: number, weekday: number) => week * 0.017 + weekday * 0.003,
};

/** Retro: a CRT running ACTIVITY.EXE. Pixels light in scan order; "always" adds flicker and a roll bar. */
export function RetroContributionGraph({
  year,
  active,
  focusIndex,
  animation,
  grid,
  className,
}: ContributionGraphWorldProps) {
  const enter = animation !== "none";
  const always = animation === "always";
  const day = active ?? year.best;
  const gridRef = useRef<HTMLDivElement>(null);
  useCellEntrance(gridRef, enter, SWITCH_ON, SWITCH_ON_TIMING);

  const minWidth = weeksMinWidth(year.weeks);
  return (
    <section
      data-ovio-world="retro"
      className={cn(
        "w-full min-w-0 bg-[#0b0d0a] p-2 font-(family-name:--ovio-font) sm:p-7",
        className,
      )}
    >
      <motion.div
        className="relative overflow-hidden rounded-[22px] border-[6px] border-[#1c2a1d] bg-[radial-gradient(ellipse_at_50%_45%,#0c2412_0%,#061108_70%,#030803_100%)] px-4 pt-[34px] pb-[30px] text-(--ovio-ink) outline-2 outline-[#0f1a10] [text-shadow:var(--ovio-glow)] sm:px-[38px]"
        animate={always ? { opacity: [1, 0.94] } : { opacity: 1 }}
        transition={
          always
            ? { duration: 0.12, repeat: Infinity, repeatType: "reverse", ease: steps(2) }
            : { duration: 0 }
        }
      >
        <div className="flex flex-wrap justify-between gap-4 text-lg leading-none sm:text-2xl">
          <span>
            C:\&gt; ACTIVITY.EXE /YEAR:{year.days[year.days.length - 1].date.slice(0, 4)}
            <motion.span
              aria-hidden
              animate={always ? { opacity: [1, 0] } : undefined}
              transition={motionTokens.retro.blink}
            >
              █
            </motion.span>
          </span>
          <span className="text-(--ovio-ink-2)">STATUS: ONLINE</span>
        </div>
        <div
          aria-hidden
          className="mt-[18px] mb-[22px] h-0.5 bg-[repeating-linear-gradient(90deg,#3fae55_0_8px,transparent_8px_12px)] shadow-[0_0_6px_rgba(80,255,120,.5)]"
        />
        <div className="mb-[26px] flex flex-wrap items-baseline gap-x-10 gap-y-1 text-base leading-[1.1] sm:text-[22px]">
          <div>
            TOTAL.......
            <span className="text-[#c9ffd2]">{formatNumber(year.total)}</span>
          </div>
          <div>
            MAX_STREAK..<span className="text-[#c9ffd2]">{year.longest}D</span>
          </div>
          <div>
            CUR_STREAK..<span className="text-[#c9ffd2]">{year.current}D</span>
          </div>
        </div>

        <div {...weekScroller}>
          <div className={`@container ${minWidth.className}`} style={minWidth.style}>
            <div
              {...grid}
              ref={gridRef}
              className="grid gap-[0.36cqw] p-1"
              style={weekColumns(year.weeks)}
            >
              {year.rows.map((row, r) => (
                <div key={r} role="row" className="contents">
                  {row.map((cell) => (
                    <Cell
                      key={cell.date}
                      cell={cell}
                      tabbable={cell.index === focusIndex}
                      active={cell.index === active?.index}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-4 text-lg leading-none sm:text-2xl">
          <span>
            &gt; {day.date} {day.label.slice(0, 3).toUpperCase()} ::{" "}
            <span className="tabular-nums">{formatNumber(day.count, PAD3)}</span> COMMITS{" "}
            <span aria-hidden className="text-(--ovio-ink-2)">
              {"█".repeat(day.level) + "░".repeat(4 - day.level)}
            </span>
          </span>
          <span aria-hidden className="text-(--ovio-ink-2)">
            LOW ░▒▓█ HIGH
          </span>
        </div>

        <div aria-hidden className="ovio-scanlines" />
        {always && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[14%] bg-[linear-gradient(180deg,transparent,rgba(120,255,150,.06),transparent)]"
            initial={{ y: "-100%" }}
            animate={{ y: "900%" }}
            transition={{ duration: 6, ease: "linear", repeat: Infinity }}
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_90px_rgba(0,0,0,.8)]"
        />
      </motion.div>
    </section>
  );
}
