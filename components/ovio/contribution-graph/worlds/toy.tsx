"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react";
import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ContributionGraphWorldProps } from "../contribution-graph";
import { dayCellProps, dayIndexOf } from "../grid";
import { unit, type ContributionCell } from "../year";
import { formatNumber, plural } from "@/lib/format";

/** Plastic by level: top colour, highlight and the darker lip under it. Level 0 is an empty socket. */
const PLASTIC = [
  { top: "#ddd4bf", hi: "#f7edd5", lip: "#9f9889" },
  { top: "#f6d77a", hi: "#fff088", lip: "#b19a57" },
  { top: "#f4b52a", hi: "#ffca2f", lip: "#af821e" },
  { top: "#ef7a2b", hi: "#ff8830", lip: "#ac571e" },
  { top: "#e0432a", hi: "#fa4b2f", lip: "#a1301e" },
];

/** Drum radius in px: 53 faces of 24px make the circumference. */
const RADIUS = 202;
/** Width the drum needs at full size: its rims plus a margin. Narrower stages scale it down. */
const FIT_WIDTH = 400;
/** Stage height at full size. */
const STAGE_HEIGHT = 250;
/** Degrees per px of horizontal drag. */
const DRAG = 0.32;
/** Inertia decay in ms; power matches it so a flick keeps its speed as it is released. */
const DECAY = 700;
/** Fastest spin in deg/s, so a hard flick or a long swipe stays readable. */
const MAX_SPIN = 1400;

/** Signed distance in degrees from angle `a` to angle `b`, in -180..180. */
const toward = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;

type FaceProps = {
  week: number;
  step: number;
  cells: ContributionCell[];
  month?: string;
  angle: MotionValue<number>;
  /** Index of the active day when it is in this week. */
  active: number | null;
  /** Index of the tab stop when it is in this week. */
  tabbable: number | null;
};

/** One week on the drum: a column of seven pieces, shaded as it turns away from the front. */
const Face = memo(function Face({ week, step, cells, month, angle, active, tabbable }: FaceProps) {
  const lift = useOvioTransition(motionTokens.toy.key);
  const shade = useTransform(angle, (a) => {
    const d = (toward(a, week * step) * Math.PI) / 180;
    return Math.min(0.5, (1 - Math.cos(d)) * 0.6);
  });

  return (
    <div
      role="row"
      className="absolute top-0 left-0 flex h-[184px] w-6 flex-col gap-[3px] bg-[#f8f5ef] px-[3px] py-1 shadow-[inset_1px_0_0_rgba(60,45,20,.12)] backface-hidden"
      style={{ transform: `rotateY(${week * step}deg) translateZ(${RADIUS}px)` }}
    >
      <span
        aria-hidden
        className="h-3 text-center font-(family-name:--ovio-mono) text-[8px] leading-3 font-semibold whitespace-nowrap text-(--ovio-muted)"
      >
        {month}
      </span>
      {Array.from({ length: 7 }, (_, wd) => {
        const cell = cells[wd];
        if (!cell) return <span key={wd} aria-hidden className="min-h-0 flex-1" />;
        const p = dayCellProps(cell, cell.index === tabbable);
        const c = PLASTIC[cell.level];
        // Pieces stand taller for busier days; the active one pops up, an empty socket included.
        const rest = cell.level ? cell.level + 1 : 0;
        const on = cell.index === active;
        const up = on ? 5 : rest;
        return (
          <div
            key={wd}
            {...p}
            // Faces stack their days in a column, so the grid placement in p.style does not apply.
            style={undefined}
            className="relative min-h-0 flex-1 cursor-pointer rounded-[3px] bg-[#ddd4bf] shadow-[inset_0_1px_2px_rgba(70,50,20,.38)]"
          >
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-[3px]"
              initial={false}
              animate={{ y: -up, opacity: cell.level || on ? 1 : 0 }}
              transition={lift}
              style={{
                background: `linear-gradient(180deg, ${c.hi}, ${c.top} 65%)`,
                boxShadow: `0 ${Math.max(rest, 2)}px 0 ${c.lip}, inset 0 1px 0 rgba(255,255,255,.5)`,
              }}
            />
          </div>
        );
      })}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#2a2925]"
        style={{ opacity: shade }}
      />
    </div>
  );
});

/**
 * Toy: the year printed around a drum, one week per face. Drag, flick or scroll sideways to spin it;
 * it coasts and decays into the nearest week. Arrow keys move the focus and the drum turns to follow.
 */
export function ToyContributionGraph({
  year,
  active,
  focusIndex,
  animation,
  grid,
  className,
}: ContributionGraphWorldProps) {
  const reduced = useReducedMotionSafe();
  const n = year.weeks;
  const step = 360 / n;
  const last = (n - 1) * step;
  const angle = useMotionValue(last);
  const weeks = useMemo(
    () => Array.from({ length: n }, (_, w) => year.days.slice(w * 7, w * 7 + 7)),
    [year, n],
  );
  const drum = useTransform(angle, (a) => `translateZ(-${RADIUS}px) rotateY(${-a}deg)`);
  const tick = useMotionValue(0);
  const [front, setFront] = useState(n - 1);
  const run = useRef<AnimationPlaybackControls | null>(null);
  /** The drag in progress: last x and time, smoothed velocity in deg/s, and the day it started on. */
  const drag = useRef<{
    x: number;
    t: number;
    v: number;
    start: number;
    moved: boolean;
    cell: number | null;
  } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  /** The wheel gesture in progress: the unrounded angle it aims for and its last tick. */
  const wheel = useRef({ aim: 0, t: 0 });
  /** Where the drum is heading (or resting). */
  const goal = useRef(last);

  const weekOf = (a: number) => ((Math.round(a / step) % n) + n) % n;

  const play = (next: AnimationPlaybackControls | null) => {
    run.current?.stop();
    run.current = next;
  };
  /**
   * Glide to the week nearest `to`. Inertia decays exponentially from a speed of distance / DECAY,
   * so a flick aimed at where friction would stop it carries on at the speed it was released with.
   */
  const glide = (to: number) => {
    const target = (goal.current = Math.round(to / step) * step);
    if (reduced) {
      play(null);
      angle.set(target);
      return;
    }
    play(
      animate(angle, target, {
        type: "inertia",
        power: DECAY / 1000,
        timeConstant: DECAY,
        restDelta: 0.01,
        modifyTarget: () => target,
      }),
    );
  };
  /** Coast on a velocity in deg/s, capped at MAX_SPIN. */
  const coast = (velocity: number) =>
    glide(angle.get() + (Math.max(-MAX_SPIN, Math.min(MAX_SPIN, velocity)) * DECAY) / 1000);
  /** Turn the drum the short way round to a week, keeping any spin it already has. */
  const spinTo = (week: number) => {
    const target = (goal.current = angle.get() + toward(angle.get(), week * step));
    if (reduced) {
      play(null);
      angle.set(target);
      return;
    }
    play(animate(angle, target, { ...motionTokens.toy.slide, velocity: angle.getVelocity() }));
  };
  /** Step whole weeks from where the drum is heading, so quick presses add up. */
  const nudge = (by: number) => spinTo(weekOf(goal.current) + by);

  // Entrance: the drum spins in to the latest week.
  useLayoutEffect(() => {
    if (animation === "none") return;
    angle.jump(last - 70);
    const spin = animate(angle, last, motionTokens.toy.knob);
    run.current = spin;
    return () => spin.stop();
  }, [angle, last, animation]);
  useEffect(() => () => run.current?.stop(), []);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      if (width) setFit(Math.min(1, width / FIT_WIDTH));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The pointer flicks each time a new week passes under it.
  useMotionValueEvent(angle, "change", (a) => {
    const f = weekOf(a);
    if (f === front) return;
    setFront(f);
    if (reduced) return;
    const dir = Math.sign(angle.getVelocity()) || 1;
    animate(tick, [0, dir * 22, -dir * 6, 0], {
      duration: 0.22,
      times: [0, 0.25, 0.6, 1],
      ease: [0.22, 1, 0.36, 1],
    });
  });

  // Sideways wheel and trackpad swipes push the drum; it needs a non-passive listener to keep the page still.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      // Ticks in one gesture add up to an aim the drum glides towards.
      const now = performance.now();
      const w = wheel.current;
      if (now - w.t > 200) w.aim = angle.get();
      w.aim += e.deltaX * DRAG;
      w.t = now;
      glide(w.aim);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    play(null);
    drag.current = {
      x: e.clientX,
      t: performance.now(),
      v: 0,
      start: e.clientX,
      moved: false,
      cell: dayIndexOf(e.target),
    };
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientX - d.start) > 3) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    const now = performance.now();
    const delta = -(e.clientX - d.x) * DRAG;
    angle.set(angle.get() + delta);
    d.v = d.v * 0.5 + ((delta * 1000) / Math.max(8, now - d.t)) * 0.5;
    d.x = e.clientX;
    d.t = now;
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    // A drag that stopped before release lets go without a flick.
    if (d.moved) coast(reduced || performance.now() - d.t > 90 ? 0 : d.v);
    else if (d.cell !== null) spinTo(year.days[d.cell].week);
  };

  const months = new Map(year.months.map((m) => [m.week, m.label.toUpperCase()]));
  const shown = weeks[front];
  const weekTotal = shown.reduce((s, c) => s + c.count, 0);
  const short = (c?: ContributionCell) => c?.label.slice(5) ?? "";
  const count = active ? active.count : weekTotal;

  const arrow =
    " size-[38px] rounded-[10px] text-base font-extrabold transition-[translate,box-shadow] duration-150 active:translate-y-[3px]";

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
          <div
            className="mt-1.5 text-[clamp(48px,6vw,72px)] leading-[0.95] font-extrabold tracking-[-0.04em]"
            style={{ fontStretch: "120%" }}
          >
            {formatNumber(year.total)}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-(--ovio-radius) bg-(--ovio-surface) px-4 py-3 shadow-[inset_0_1px_0_#fff,0_5px_0_#d2ccbf,0_12px_14px_-8px_rgba(40,28,10,.4)]">
            <div className="font-(family-name:--ovio-mono) text-[11.5px] tracking-[0.08em] text-(--ovio-muted)">
              STREAK
            </div>
            <div className="text-2xl font-extrabold tracking-[-0.02em]">
              {year.longest} {plural(year.longest, "day")}
            </div>
          </div>
          <div className="rounded-(--ovio-radius) bg-(--ovio-accent) px-4 py-3 text-(--ovio-on-accent) shadow-[inset_0_2px_0_rgba(255,255,255,.25),0_5px_0_var(--ovio-accent-deep),0_12px_14px_-8px_rgba(40,28,10,.4)]">
            <div className="font-(family-name:--ovio-mono) text-[11.5px] tracking-[0.08em]">
              PEAK
            </div>
            <div className="text-2xl font-extrabold tracking-[-0.02em]">
              {formatNumber(year.best.count)} / day
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-[22px] overflow-clip rounded-[24px] bg-[#efe8d8] pt-[18px] pb-[22px] shadow-[inset_0_0_0_2px_#e2d9c3,inset_0_1px_0_rgba(255,255,255,.85),0_10px_0_#c7bea8,0_28px_34px_-16px_rgba(40,28,10,.5)]">
        <div
          ref={stage}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className="relative cursor-grab touch-pan-y select-none active:cursor-grabbing"
          style={{ height: STAGE_HEIGHT * fit }}
        >
          <div
            className="absolute top-0 left-1/2 flex origin-top items-center justify-center perspective-[900px]"
            style={{
              width: FIT_WIDTH,
              height: STAGE_HEIGHT,
              marginLeft: -FIT_WIDTH / 2,
              scale: fit,
            }}
          >
            <motion.div
              {...grid}
              onFocus={(e) => {
                grid.onFocus(e);
                const i = dayIndexOf(e.target);
                if (i !== null && !drag.current) spinTo(year.days[i].week);
              }}
              className="relative h-[184px] w-6 transform-3d"
              style={{ transform: drum }}
            >
              <span
                aria-hidden
                className="absolute top-1/2 left-1/2 -m-[210px] size-[420px] rounded-full bg-[radial-gradient(circle,#e3dbc8_0_55%,#d2c9b3_56%_62%,#efe8d8_63%)] shadow-[0_0_0_6px_#c7bea8]"
                style={{ transform: "rotateX(90deg) translateZ(92px)" }}
              />
              <span
                aria-hidden
                className="absolute top-1/2 left-1/2 -m-[210px] size-[420px] rounded-full bg-[#c7bea8]"
                style={{ transform: "rotateX(90deg) translateZ(-92px)" }}
              />
              {Array.from({ length: n }, (_, w) => (
                <Face
                  key={w}
                  week={w}
                  step={step}
                  cells={weeks[w]}
                  month={months.get(w)}
                  angle={angle}
                  active={active?.week === w ? active.index : null}
                  tabbable={Math.floor(focusIndex / 7) === w ? focusIndex : null}
                />
              ))}
            </motion.div>
            <motion.div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-[5] -ml-[13px] h-10 w-[26px] origin-[50%_9px] drop-shadow-[0_3px_2px_rgba(40,28,10,.35)]"
              style={{ rotate: tick }}
            >
              <span className="absolute top-[22px] left-1/2 -ml-2 border-x-8 border-t-16 border-x-transparent border-t-[#e0432a]" />
              <span className="absolute top-0 left-1/2 -ml-3 size-6 rounded-full bg-[radial-gradient(circle_at_38%_32%,#ff8a6a,#e0432a_60%)] shadow-[inset_0_-2px_0_rgba(0,0,0,.2)]" />
              <span className="absolute top-2 left-1/2 -ml-1 size-2 rounded-full bg-[#f8f5ef] shadow-[inset_0_1px_1px_rgba(0,0,0,.3)]" />
            </motion.div>
          </div>
        </div>

        <div className="mt-2.5 flex justify-center px-4">
          <div className="flex items-center gap-4 rounded-xl bg-[#2a2925] px-4 py-2.5 text-(--ovio-surface) shadow-[inset_0_3px_6px_rgba(0,0,0,.6)]">
            <div className="flex items-baseline gap-[7px]">
              <span className="text-[26px] leading-none font-extrabold tracking-[-0.02em] tabular-nums">
                {formatNumber(count)}
              </span>
              <span className="text-xs text-[#bdb6a8]">{active ? unit(count) : "this week"}</span>
            </div>
            <div className="flex flex-col gap-0.5 font-(family-name:--ovio-mono) text-[12px] leading-[1.25] text-[#bdb6a8]">
              <span className="tracking-[0.08em] uppercase">
                {active ? "Day" : `Week ${front + 1} of ${n}`}
              </span>
              <span>
                {active ? active.label : `${short(shown[0])} – ${short(shown[shown.length - 1])}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
        <span>Drag or flick to spin · arrows step a day or week</span>
        <span className="flex gap-2">
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => nudge(-1)}
            className={cn(
              arrow,
              "bg-white text-(--ovio-ink) shadow-[0_4px_0_#cfc8b8] active:shadow-[0_1px_0_#cfc8b8]",
            )}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next week"
            onClick={() => nudge(1)}
            className={cn(
              arrow,
              "bg-[#ef4f2b] text-white shadow-[0_4px_0_#b5311a] active:shadow-[0_1px_0_#b5311a]",
            )}
          >
            ›
          </button>
        </span>
      </div>
    </section>
  );
}
