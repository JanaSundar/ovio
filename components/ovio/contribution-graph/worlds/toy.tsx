"use client";

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { memo, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ContributionGraphWorldProps } from "../contribution-graph";
import { dayCellProps, dayIndexOf, useScrollEnd } from "../grid";
import { unit, type ContributionCell } from "../year";

/** Plastic colours by level: top, side and stud. Level 0 is a low grey stub. */
const PLASTIC = [
  { top: "#cfc8b6", side: "#a9a291", stud: "#ddd6c4" },
  { top: "#f6d77a", side: "#c7a745", stud: "#fbe6a6" },
  { top: "#f4b52a", side: "#b9821a", stud: "#f9cd66" },
  { top: "#ef7a2b", side: "#b5541a", stud: "#f59d5f" },
  { top: "#e0432a", side: "#a52a16", stud: "#ec6f5a" },
];
const HOT = { top: "#2c55e0", side: "#1a36a3", stud: "#5b7cf0" };

/** Block height in px by level. */
const HEIGHT = [2, 8.5, 13, 17.5, 22];
/** Tallest a block can get (a level 4 block fully lifted); the side face is drawn at this height and scaled. */
const MAX = 32;
/** Peak lift under the pointer; neighbours rise less with distance. */
const LIFT = 9;
/** How far down a pressed block goes: nearly flush with the board. */
const PRESSED = 1;

type BlockProps = {
  cell: ContributionCell;
  tabbable: boolean;
  active: boolean;
  pressed: boolean;
  /** Extra height from a nearby pointer, in px. */
  lift: number;
  enter: boolean;
  /** Breathe while idle ("always"). */
  wave: boolean;
};

/**
 * A plastic block on the board: a top face raised by translateZ and a side face scaled to the same height,
 * both driven by one motion value. It rises in on entry (slide spring), wobbles up near the pointer
 * (piece spring) and pushes into the board when pressed (key spring).
 */
const Block = memo(function Block({
  cell,
  tabbable,
  active,
  pressed,
  lift,
  enter,
  wave,
}: BlockProps) {
  const rise = useOvioTransition(motionTokens.toy.slide);
  const wobble = useOvioTransition(motionTokens.toy.piece);
  const key = useOvioTransition(motionTokens.toy.key);
  const base = HEIGHT[cell.level];
  const target = pressed ? PRESSED : base + lift;
  const h = useMotionValue(enter ? 0 : target);
  const scaleY = useTransform(h, (v) => v / MAX);
  const entered = useRef(false);

  useEffect(() => {
    let stopped = false;
    const first = !entered.current;
    entered.current = true;
    let controls: AnimationPlaybackControls = animate(
      h,
      target,
      pressed
        ? key
        : first && enter
          ? { ...rise, delay: cell.week * 0.022 + cell.weekday * 0.03 }
          : wobble,
    );
    // Idle blocks breathe in a wave across the board.
    if (wave && !pressed && lift === 0 && cell.level > 0) {
      controls.finished.then(() => {
        if (stopped) return;
        controls = animate(h, [base, base * 0.8, base], {
          duration: 2.6,
          ease: "easeInOut",
          repeat: Infinity,
          delay: (cell.week * 0.06 + cell.weekday * 0.1) % 2.6,
        });
      });
    }
    return () => {
      stopped = true;
      controls.stop();
    };
  }, [h, target, pressed, lift, wave, enter, base, cell, rise, wobble, key]);

  const p = dayCellProps(cell, tabbable);
  const c = active ? HOT : PLASTIC[cell.level];

  return (
    <div
      {...p}
      className="relative cursor-pointer rounded-[3px] bg-[#c4bca8] shadow-[inset_0_1px_2px_rgba(70,50,20,.38)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ovio-accent)"
      style={{ ...p.style, transformStyle: "preserve-3d" }}
    >
      {/* Side face: stands up from the near edge, scaled to the block's height. */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 origin-bottom"
        style={{ height: MAX, transform: "rotateX(-90deg)", transformStyle: "preserve-3d" }}
      >
        <motion.span
          className="absolute inset-0 origin-bottom"
          style={{ scaleY, background: `linear-gradient(180deg, ${c.top}, ${c.side} 40%)` }}
        />
      </span>
      {/* Top face with its stud. */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[2px] shadow-[inset_0_0_0_.5px_rgba(30,20,10,.28)]"
        style={{
          z: h,
          background: `radial-gradient(circle at 50% 45%, ${c.stud} 0 22%, ${c.side} 26% 31%, transparent 34%), ${c.top}`,
        }}
      />
    </div>
  );
});

/** Lift for a block at (week, weekday) from the active day: a soft bump that falls off with distance. */
function liftAt(cell: ContributionCell, active: ContributionCell | null) {
  if (!active) return 0;
  const d2 = (cell.week - active.week) ** 2 + (cell.weekday - active.weekday) ** 2;
  const v = LIFT * Math.exp(-d2 / 2.2);
  return v < 0.5 ? 0 : Math.round(v * 2) / 2;
}

/** Toy: a tray of plastic blocks, one per day, taller for busier days. Hover lifts, press pushes in. */
export function ToyContributionGraph({
  year,
  active,
  focusIndex,
  animation,
  grid,
  className,
}: ContributionGraphWorldProps) {
  const scroller = useScrollEnd<HTMLDivElement>();
  const [pressed, setPressed] = useState<number | null>(null);
  const enter = animation !== "none";
  const wave = animation === "always";
  const day = active ?? year.best;

  const onKey = (down: boolean) => (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    setPressed(down ? dayIndexOf(e.target) : null);
  };
  const release = () => setPressed(null);

  return (
    <section
      data-ovio-world="toy"
      className={cn(
        "flex w-full min-w-0 flex-col font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="font-(family-name:--ovio-mono) text-[11px] tracking-[0.08em] text-(--ovio-muted) uppercase">
            Contributions · last 12 months
          </div>
          <RollingNumber
            className="mt-1.5 text-[clamp(48px,6vw,72px)] leading-[0.95] font-extrabold tracking-[-0.04em]"
            style={{ fontStretch: "120%" }}
            value={year.total}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-(--ovio-radius) bg-(--ovio-surface) px-4 py-3 shadow-[inset_0_1px_0_#fff,0_5px_0_#d2ccbf,0_12px_14px_-8px_rgba(40,28,10,.4)]">
            <div className="font-(family-name:--ovio-mono) text-[10px] tracking-[0.08em] text-(--ovio-muted)">
              STREAK
            </div>
            <div className="text-2xl font-extrabold tracking-[-0.02em]">
              <RollingNumber value={year.longest} /> days
            </div>
          </div>
          <div className="rounded-(--ovio-radius) bg-(--ovio-accent) px-4 py-3 text-(--ovio-on-accent) shadow-[inset_0_2px_0_rgba(255,255,255,.25),0_5px_0_var(--ovio-accent-deep),0_12px_14px_-8px_rgba(40,28,10,.4)]">
            <div className="font-(family-name:--ovio-mono) text-[10px] tracking-[0.08em]">PEAK</div>
            <div className="text-2xl font-extrabold tracking-[-0.02em]">
              <RollingNumber value={year.best.count} /> / day
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-[22px] rounded-[24px] bg-[#efe8d8] pt-4 pb-[18px] shadow-[inset_0_0_0_2px_#e2d9c3,inset_0_1px_0_rgba(255,255,255,.85),0_10px_0_#c7bea8,0_28px_34px_-16px_rgba(40,28,10,.5)]">
        <div
          ref={scroller}
          className="overflow-x-auto overflow-y-hidden px-5 [scrollbar-width:thin]"
        >
          <div className="mx-auto w-max">
            <div className="flex h-[104px] items-end">
              <div
                {...grid}
                role="grid"
                onPointerDown={(e) => setPressed(dayIndexOf(e.target))}
                onPointerUp={release}
                onPointerCancel={release}
                onPointerLeave={() => {
                  grid.onPointerLeave();
                  release();
                }}
                onKeyDown={(e) => {
                  grid.onKeyDown(e);
                  onKey(true)(e);
                }}
                onKeyUp={onKey(false)}
                className="grid auto-cols-[13px] grid-flow-col grid-rows-[repeat(7,13px)] gap-[3px] rounded-lg bg-[#d6d0c3] p-1.5 touch-manipulation"
                style={{
                  transform: "rotateX(52deg)",
                  transformOrigin: "50% 100%",
                  transformStyle: "preserve-3d",
                }}
              >
                {year.rows.map((row, r) => (
                  <div key={r} role="row" className="contents">
                    {row.map((cell) => (
                      <Block
                        key={cell.date}
                        cell={cell}
                        tabbable={cell.index === focusIndex}
                        active={cell.index === active?.index}
                        pressed={cell.index === pressed}
                        lift={liftAt(cell, active)}
                        enter={enter}
                        wave={wave}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div
              aria-hidden
              className="mt-2 grid h-3 auto-cols-[13px] grid-flow-col gap-[3px] px-1.5 font-(family-name:--ovio-mono) text-[10px] font-medium text-(--ovio-muted)"
            >
              {year.months.map((m) => (
                <span key={m.week} className="whitespace-nowrap" style={{ gridColumn: m.week + 1 }}>
                  {m.label.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3.5 flex justify-center px-4">
          <div className="flex items-center gap-4 rounded-xl bg-[#2a2925] px-4 py-2.5 text-(--ovio-surface) shadow-[inset_0_3px_6px_rgba(0,0,0,.6)]">
            <div className="flex items-baseline gap-[7px]">
              <RollingNumber
                className="text-[26px] leading-none font-extrabold tracking-[-0.02em]"
                value={day.count}
              />
              <span className="text-xs text-[#bdb6a8]">{unit(day.count)}</span>
            </div>
            <div className="flex flex-col gap-0.5 font-(family-name:--ovio-mono) text-[10.5px] leading-[1.2] text-[#bdb6a8]">
              <span className="tracking-[0.08em] uppercase">{active ? "Day" : "Best day"}</span>
              <span>{day.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
        <span>Hover to lift · press to push in · arrows step a day</span>
        <span aria-hidden className="flex items-center gap-1.5">
          Less
          {PLASTIC.slice(1).map((c) => (
            <span
              key={c.top}
              className="size-3 rounded-[3px]"
              style={{ background: c.top, boxShadow: `0 3px 0 ${c.side}` }}
            />
          ))}
          More
        </span>
      </div>
    </section>
  );
}
