"use client";

import { motion } from "motion/react";
import { memo } from "react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ContributionGraphWorldProps } from "../contribution-graph";
import { dayCellProps, useScrollEnd } from "../grid";
import { unit, type ContributionCell } from "../year";

const SCALE = ["#e6dcc8", "#f2c9a0", "#ee9f63", "#e0713a", "#b8471f"];

/** A small fixed tilt per tile (-7° to 7°), from its index, so tiles look hand-placed. */
const tilt = (i: number) => ((Math.imul(i + 1, 2654435761) >>> 16) % 1400) / 100 - 7;

type CellProps = { cell: ContributionCell; tabbable: boolean; active: boolean; enter: boolean };

/** A paper tile: dropped in on entry, raised by its level, lifted and squared up when hovered. */
const Cell = memo(function Cell({ cell, tabbable, active, enter }: CellProps) {
  const lift = useOvioTransition(motionTokens.craft.base);
  const p = dayCellProps(cell, tabbable);
  const lvl = cell.level;

  return (
    <motion.div
      {...p}
      initial={enter ? { opacity: 0, y: -16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...motionTokens.craft.slow, delay: cell.week * 0.014 + cell.weekday * 0.012 }}
      className="rounded-[3px]"
    >
      <motion.span
        aria-hidden
        className="block size-full rounded-[3px]"
        initial={false}
        animate={
          active
            ? { y: -6, rotate: 0, scale: 1.35, boxShadow: "0 8px 10px -2px rgba(90,50,20,.45)" }
            : {
                y: -lvl * 1.5,
                rotate: lvl ? tilt(cell.index) : 0,
                scale: 1,
                boxShadow: lvl
                  ? `0 ${1 + lvl}px ${2 + lvl * 1.5}px rgba(90,50,20,${(0.14 + lvl * 0.06).toFixed(2)}), inset 0 1px 0 rgba(255,255,255,.4)`
                  : "inset 0 1px 2px rgba(70,45,20,.15)",
              }
        }
        transition={lift}
        style={{ background: SCALE[lvl], zIndex: active ? 1 : undefined, position: "relative" }}
      />
    </motion.div>
  );
});

/** Craft: tiles on a taped paper card. Taller tiles, busier days; a sticker counts the streak. */
export function CraftContributionGraph({
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
      data-ovio-world="craft"
      className={cn(
        "relative mx-auto w-full min-w-0 max-w-max -rotate-[0.6deg] rounded-md bg-(--ovio-surface) px-6 pt-10 pb-9 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_2px_4px_rgba(70,45,20,.12),0_18px_40px_-12px_rgba(70,45,20,.35)] sm:px-11",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -top-3.5 left-1/2 -ml-[60px] h-7 w-[120px] rotate-2 bg-(--ovio-tape) shadow-[0_1px_2px_rgba(0,0,0,.08)]"
      />
      <div className="absolute -top-[26px] -right-[18px] flex size-[104px] rotate-12 flex-col items-center justify-center rounded-full bg-(--ovio-accent) text-(--ovio-on-accent) shadow-[0_6px_14px_-4px_rgba(120,50,10,.5),inset_0_-3px_0_rgba(0,0,0,.12)]">
        <RollingNumber
          className="text-[30px] leading-none font-extrabold tracking-[-0.03em]"
          value={year.longest}
        />
        <span className="text-[11px] font-bold tracking-[0.06em]">DAY STREAK</span>
      </div>

      <div className="mb-1.5 flex flex-wrap items-baseline gap-4 pr-20">
        <h3 className="m-0 text-[34px] font-extrabold tracking-[-0.035em]">
          A year of making things
        </h3>
        <span className="inline-block -rotate-3 font-(family-name:--ovio-hand) text-[26px] text-(--ovio-accent-deep)">
          <RollingNumber value={year.total} /> of them!
        </span>
      </div>
      <p className="mt-0 mb-7 text-[15px] text-(--ovio-ink-2)">
        Every tile is a day. Taller tiles, busier days.
      </p>

      <div
        ref={scroller}
        className="overflow-x-auto overflow-y-hidden px-1.5 pt-2.5 pb-3.5 [scrollbar-color:#d9c9ad_transparent] [scrollbar-width:thin]"
      >
        <div
          {...grid}
          className="grid w-max auto-cols-[13px] grid-flow-col grid-rows-[repeat(7,13px)] gap-1"
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

      <div className="mt-[18px] flex flex-wrap items-end justify-between gap-4">
        <div className="relative -rotate-[1.5deg] rounded bg-white py-2.5 pr-4 pl-[26px] text-sm shadow-[0_4px_10px_-3px_rgba(70,45,20,.3)]">
          <span
            aria-hidden
            className="absolute top-1/2 left-[9px] -mt-[3.5px] size-[7px] rounded-full bg-(--ovio-stage) shadow-[inset_0_1px_2px_rgba(0,0,0,.25)]"
          />
          <strong className="font-bold">
            <RollingNumber value={day.count} /> {unit(day.count)}
          </strong>{" "}
          · {day.label}
        </div>
        <div
          aria-hidden
          className="flex items-center gap-[5px] font-(family-name:--ovio-hand) text-xl text-(--ovio-ink-2)"
        >
          quiet
          {SCALE.map((c) => (
            <span key={c} className="size-[13px] rounded-[3px]" style={{ background: c }} />
          ))}
          busy
        </div>
      </div>
    </section>
  );
}
