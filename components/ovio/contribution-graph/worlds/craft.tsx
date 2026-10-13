import { memo, useMemo, useRef, type CSSProperties } from "react";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ContributionGraphWorldProps } from "../contribution-graph";
import { cssEase, dayCellProps, weekColumns, weekScroller, weeksMinWidth } from "../grid";
import { useCellEntrance } from "../use-cell-entrance";
import { unit, type ContributionCell } from "../year";
import { formatNumber } from "@/lib/format";

const SCALE = ["#e6dcc8", "#f2c9a0", "#ee9f63", "#e0713a", "#b8471f"];

/** A small fixed tilt per tile (-7° to 7°), from its index, so tiles look hand-placed. */
const tilt = (i: number) => ((Math.imul(i + 1, 2654435761) >>> 16) % 1400) / 100 - 7;

/** The resting look of each level: its paper colour and the shadow that raises it. Written out so Tailwind sees them. */
const LEVEL = [
  "before:bg-[#e6dcc8] before:shadow-[inset_0_1px_2px_rgba(70,45,20,.15)]",
  "before:bg-[#f2c9a0] before:shadow-[0_2px_3.5px_rgba(90,50,20,.2),inset_0_1px_0_rgba(255,255,255,.4)]",
  "before:bg-[#ee9f63] before:shadow-[0_3px_5px_rgba(90,50,20,.26),inset_0_1px_0_rgba(255,255,255,.4)]",
  "before:bg-[#e0713a] before:shadow-[0_4px_6.5px_rgba(90,50,20,.32),inset_0_1px_0_rgba(255,255,255,.4)]",
  "before:bg-[#b8471f] before:shadow-[0_5px_8px_rgba(90,50,20,.38),inset_0_1px_0_rgba(255,255,255,.4)]",
];

/**
 * A tile is one element and two pseudo-elements: the cell is the steady hit area, `before` is the paper
 * and `after` carries the lifted shadow. Hovering moves the paper on `transform` and fades the shadow in
 * on `opacity`, so a hover never repaints a shadow, and a year costs 371 nodes instead of 742.
 */
const TILE = cn(
  "relative aspect-square rounded-[3px] data-active:z-10",
  "before:absolute before:inset-0 before:rounded-[3px] before:transform-[translateY(var(--lift))_scale(1)_rotate(var(--tilt))] before:transition-transform before:duration-300 before:ease-[cubic-bezier(.34,1.5,.5,1)] data-active:before:transform-[translateY(-6px)_scale(1.35)_rotate(0deg)]",
  "after:absolute after:inset-0 after:rounded-[3px] after:opacity-0 after:shadow-[0_8px_10px_-2px_rgba(90,50,20,.45)] after:transition-opacity after:duration-300 after:transform-[translateY(-6px)_scale(1.35)] data-active:after:opacity-100",
  "motion-reduce:before:transition-none motion-reduce:after:transition-none",
);

type CellProps = { cell: ContributionCell; tabbable: boolean; active: boolean };

const Cell = memo(function Cell({ cell, tabbable, active }: CellProps) {
  const p = dayCellProps(cell, tabbable);
  const lvl = cell.level;
  return (
    <div
      {...p}
      data-active={active || undefined}
      className={cn(TILE, LEVEL[lvl])}
      style={
        {
          gridRow: cell.weekday + 1,
          "--lift": `${-lvl * 1.5}px`,
          "--tilt": `${lvl ? tilt(cell.index) : 0}deg`,
        } as CSSProperties
      }
    />
  );
});

type ColumnProps = {
  week: number;
  days: ContributionCell[];
  focusIndex: number;
  activeIndex: number;
};

/** One week. Columns, not tiles, drop in on entrance: 53 native animations instead of 371. */
const Column = memo(function Column({ week, days, focusIndex, activeIndex }: ColumnProps) {
  return (
    <div
      role="row"
      data-week={week}
      className="grid grid-rows-subgrid"
      style={{ gridColumn: week + 1, gridRow: "1 / span 7" }}
    >
      {days.map((cell) => (
        <Cell
          key={cell.date}
          cell={cell}
          tabbable={cell.index === focusIndex}
          active={cell.index === activeIndex}
        />
      ))}
    </div>
  );
});

const DROP: Keyframe[] = [
  { opacity: 0, transform: "translateY(-16px)" },
  { opacity: 1, transform: "none" },
];
const DROP_TIMING = {
  duration: motionTokens.craft.slow.duration,
  easing: cssEase(motionTokens.craft.slow.ease),
  delay: (week: number) => week * 0.009,
};

/** Craft: tiles on a taped paper card. Taller tiles, busier days; a sticker counts the streak. */
export default function CraftContributionGraph({
  year,
  active,
  focusIndex,
  animation,
  grid,
  className,
}: ContributionGraphWorldProps) {
  const enter = animation !== "none";
  const day = active ?? year.best;
  const gridRef = useRef<HTMLDivElement>(null);
  // Tiles drop into place, column by column.
  useCellEntrance(gridRef, enter, DROP, DROP_TIMING, "[data-week]");
  const weeks = useMemo(
    () => Array.from({ length: year.weeks }, (_, w) => year.days.slice(w * 7, w * 7 + 7)),
    [year],
  );

  const minWidth = weeksMinWidth(year.weeks);
  // The card tilts only on desktop: a tilted parent blurs the grid while it scrolls on smaller screens.
  return (
    <section
      data-ovio-world="craft"
      className={cn(
        "relative mx-auto w-full min-w-0 rounded-md lg:rotate-[-0.6deg] bg-(--ovio-surface) px-6 pt-10 pb-9 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_2px_4px_rgba(70,45,20,.12),0_18px_40px_-12px_rgba(70,45,20,.35)] sm:px-11",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -top-3.5 left-1/2 -ml-15 h-7 w-30 rotate-2 bg-(--ovio-tape) shadow-[0_1px_2px_rgba(0,0,0,.08)]"
      />
      <div className="absolute -top-6.5 -right-1 sm:-right-4.5 flex size-26 rotate-12 flex-col items-center justify-center rounded-full bg-(--ovio-accent) text-(--ovio-on-accent) shadow-[0_6px_14px_-4px_rgba(120,50,10,.5),inset_0_-3px_0_rgba(0,0,0,.12)]">
        <span className="text-[30px] leading-none font-extrabold tracking-[-0.03em]">
          {year.longest}
        </span>
        <span className="text-[11px] font-bold tracking-[0.06em]">DAY STREAK</span>
      </div>

      <div className="mb-1.5 flex flex-wrap items-baseline gap-4 pr-20">
        <h3 className="m-0 text-[34px] font-extrabold tracking-[-0.035em]">
          A year of making things
        </h3>
        <span className="inline-block -rotate-3 font-(family-name:--ovio-hand) text-[26px] text-(--ovio-accent-deep)">
          {formatNumber(year.total)} of them!
        </span>
      </div>
      <p className="mt-0 mb-7 text-[15px] text-(--ovio-ink-2)">
        Every tile is a day. Taller tiles, busier days.
      </p>

      <div {...weekScroller}>
        <div
          className={`@container px-1.5 pt-2.5 pb-3.5 ${minWidth.className}`}
          style={minWidth.style}
        >
          <div
            {...grid}
            ref={gridRef}
            className="grid gap-[0.45cqw]"
            style={weekColumns(year.weeks)}
          >
            {weeks.map((days, w) => {
              const first = w * 7;
              const inWeek = (i: number | undefined) =>
                i !== undefined && i >= first && i < first + 7 ? i : -1;
              return (
                <Column
                  key={w}
                  week={w}
                  days={days}
                  focusIndex={inWeek(focusIndex)}
                  activeIndex={inWeek(active?.index)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4.5 flex flex-wrap items-end justify-between gap-4 px-1">
        <div className="relative rotate-[-1.5deg] rounded bg-white py-2.5 pr-4 pl-6.5 text-sm shadow-[0_4px_10px_-3px_rgba(70,45,20,.3)]">
          <span
            aria-hidden
            className="absolute top-1/2 left-2.25 mt-[-3.5px] size-1.75 rounded-full bg-(--ovio-stage) shadow-[inset_0_1px_2px_rgba(0,0,0,.25)]"
          />
          <strong className="font-bold">
            <span className="tabular-nums">{formatNumber(day.count)}</span> {unit(day.count)}
          </strong>{" "}
          · {day.label}
        </div>
        <div
          aria-hidden
          className="flex flex-wrap items-center gap-1.25 font-(family-name:--ovio-hand) text-xl text-(--ovio-ink-2)"
        >
          quiet
          {SCALE.map((c) => (
            <span key={c} className="size-3.25 rounded-[3px]" style={{ background: c }} />
          ))}
          busy
        </div>
      </div>
    </section>
  );
}
