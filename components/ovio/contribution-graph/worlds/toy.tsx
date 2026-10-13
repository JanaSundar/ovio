import {
  animate,
  motion,
  useMotionValue,
  useMotionTemplate,
  useMotionValueEvent,
  useSpring,
  useVelocity,
  useTransform,
  type AnimationPlaybackControls,
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

/**
 * Studs for levels 1 to 4: face colour, highlight and the lip under it. Quiet days stay empty
 * peg holes, picked or not.
 */
const STUD = [
  { top: "#ffe08a", hi: "#fff6d2", lip: "#c4a447" },
  { top: "#f4b52a", hi: "#ffd877", lip: "#b47e17" },
  { top: "#ef7a2b", hi: "#ffa76c", lip: "#ae5016" },
  { top: "#ef4f2b", hi: "#ff8467", lip: "#ad2f17" },
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

/** The pin leans with the drum's speed: this many deg/s swings it to its furthest, PIN_MAX degrees. */
const PIN_AT = 500;
const PIN_MAX = 26;

/** Signed distance in degrees from angle `a` to angle `b`, in -180..180. */
const toward = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;

type FaceProps = {
  week: number;
  step: number;
  cells: ContributionCell[];
  month?: string;
  /** The latest week, labelled NOW. */
  now: boolean;
  /** Index of the active day when it is in this week. */
  active: number | null;
  /** Index of the tab stop when it is in this week. */
  tabbable: number | null;
};

/**
 * One week on the drum: a slat of blue plastic with seven peg holes. Busier days hold taller studs;
 * the picked day pops up. The light is fixed in the window, not painted per slat, so the drum reads
 * as one smooth curve and nothing here changes while it spins.
 */
const Face = memo(function Face({ week, step, cells, month, now, active, tabbable }: FaceProps) {
  const pop = useOvioTransition(motionTokens.toy.key);

  return (
    <div
      role="row"
      className="absolute top-0 left-0 flex h-46 w-6 flex-col items-center gap-0.75 bg-[#2c55e0] py-1 backface-hidden shadow-[inset_1px_0_0_rgba(255,255,255,.14),inset_-1px_0_0_rgba(10,20,70,.25)]"
      style={{ transform: `rotateY(${week * step}deg) translateZ(${RADIUS}px)` }}
    >
      <span
        aria-hidden
        className={cn(
          "h-3 text-center font-(family-name:--ovio-mono) text-[9px] leading-3 font-bold whitespace-nowrap",
          now ? "text-[#ffe08a]" : "text-white/80",
        )}
      >
        {now ? "NOW" : month}
      </span>
      {Array.from({ length: 7 }, (_, wd) => {
        const cell = cells[wd];
        // Days still to come keep their slot, so the current week reads as a whole column.
        if (!cell)
          return (
            <span
              key={wd}
              aria-hidden
              className="flex min-h-0 w-full flex-1 items-center justify-center"
            >
              <span className="size-3 rounded-full border border-dashed border-white/35" />
            </span>
          );
        const p = dayCellProps(cell, cell.index === tabbable);
        const on = cell.index === active;
        const c = cell.level ? STUD[cell.level - 1] : null;
        // The lip is how tall the stud stands; it sits on its hole, and the picked one lifts clear.
        const lip = 1.5 + cell.level * 0.75;
        const rise = lip + (on ? 4 : 0);
        return (
          <div
            key={wd}
            {...p}
            // Faces stack their days in a column, so the grid placement in p.style does not apply.
            style={undefined}
            className="relative flex min-h-0 w-full flex-1 cursor-pointer items-center justify-center"
          >
            <span
              aria-hidden
              className="size-3 rounded-full bg-[#1b3a9e] shadow-[inset_0_2px_2px_rgba(0,0,10,.5),0_1px_0_rgba(255,255,255,.2)]"
            />
            {c && (
              <motion.span
                aria-hidden
                className="absolute top-1/2 left-1/2 -mt-2 -ml-2 size-4 rounded-full"
                initial={false}
                animate={{
                  transform: `translateY(${-rise}px)`,
                }}
                transition={pop}
                style={{
                  background: `radial-gradient(circle at 36% 30%, ${c.hi}, ${c.top} 58%)`,
                  boxShadow: `0 ${lip}px 0 ${c.lip}, 0 ${lip + 2}px 3px rgba(5,12,45,.5), inset 0 -1px 1px rgba(0,0,0,.12)`,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

/**
 * Toy: the year printed around a drum, one week per face. Drag, flick or scroll sideways to spin it;
 * it coasts and decays into the nearest week. Arrow keys move the focus and the drum turns to follow.
 */
export default function ToyContributionGraph({
  year,
  active: hovered,
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
  const back = useTransform(() => -angle.get());
  const drum = useMotionTemplate`translateZ(-${RADIUS}px) rotateY(${back}deg)`;
  // The pin is a flapper the pegs push: it leans the way the drum turns, as far as it is fast, and
  // springs about on the Toy piece spring. Under reduced motion it stays upright.
  const reach = reduced ? 0 : PIN_MAX;
  const lean = useTransform(useVelocity(angle), [-PIN_AT, 0, PIN_AT], [-reach, 0, reach]);
  const pin = useSpring(lean, motionTokens.toy.piece);
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

  // Re-render only when a new week reaches the front, not on every frame of the spin.
  useMotionValueEvent(angle, "change", (a) => {
    const f = weekOf(a);
    if (f !== front) setFront(f);
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
    if (!e.isPrimary || e.button !== 0) return;
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
  // The drum wraps the oldest week round beside the newest, so the same date can sit side by side
  // a year apart. Days outside the latest day's year carry their year.
  const thisYear = year.days[year.days.length - 1].date.slice(0, 4);
  const withYear = (c: ContributionCell, label: string) =>
    c.date.startsWith(thisYear) ? label : `${label}, ${c.date.slice(0, 4)}`;
  const short = (c?: ContributionCell) => (c ? withYear(c, c.label.slice(5)) : "");
  // At rest on the latest week the drum points at the current day; turn away and it reads the week.
  const active = hovered ?? (front === n - 1 ? year.days[year.days.length - 1] : null);
  const count = active ? active.count : weekTotal;

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

      <div className="relative mt-5.5 overflow-clip rounded-3xl bg-[#efe8d8] pt-4.5 pb-5.5 shadow-[inset_0_0_0_2px_#e2d9c3,inset_0_1px_0_rgba(255,255,255,.85),0_10px_0_#c7bea8,0_28px_34px_-16px_rgba(40,28,10,.5)]">
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
            className="absolute top-0 left-1/2 origin-top"
            style={{
              width: FIT_WIDTH,
              height: STAGE_HEIGHT,
              marginLeft: -FIT_WIDTH / 2,
              scale: fit,
            }}
          >
            {/* The housing: moulded plastic, screwed together, with a window onto the drum. */}
            <div className="absolute inset-x-2.5 top-3.5 bottom-1.5 rounded-[28px] bg-[#f8f5ef] shadow-[inset_0_2px_0_#fff,inset_0_-3px_0_rgba(60,45,20,.08),0_8px_0_#d2ccbf,0_22px_26px_-14px_rgba(40,28,10,.5)]">
              {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map(
                (at) => (
                  <span
                    key={at}
                    aria-hidden
                    className={cn(
                      "absolute size-2.5 rounded-full bg-[#e6dfd0] shadow-[inset_0_1px_1.5px_rgba(40,28,10,.4),0_1px_0_#fff] after:absolute after:inset-x-0.5 after:top-1/2 after:h-px after:-rotate-45 after:bg-[rgba(40,28,10,.35)]",
                      at,
                    )}
                  />
                ),
              )}
              <div className="absolute inset-x-4.5 top-5.5 bottom-4 flex items-center justify-center overflow-hidden rounded-[18px] bg-[#101a36] perspective-[900px]">
                <motion.div
                  {...grid}
                  onFocus={(e) => {
                    grid.onFocus(e);
                    const i = dayIndexOf(e.target);
                    if (i !== null && !drag.current) spinTo(year.days[i].week);
                  }}
                  className="relative h-46 w-6 transform-3d"
                  style={{ transform: drum }}
                >
                  {Array.from({ length: n }, (_, w) => (
                    <Face
                      key={w}
                      week={w}
                      step={step}
                      cells={weeks[w]}
                      month={months.get(w)}
                      now={w === n - 1}
                      active={active?.week === w ? active.index : null}
                      tabbable={Math.floor(focusIndex / 7) === w ? focusIndex : null}
                    />
                  ))}
                </motion.div>
                {/* Light from the front: the curve falls into shadow at both ends, with a soft sheen
                    left of centre. Fixed to the window, so it never moves with the drum. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#101a36_0_3%,rgba(16,26,54,.82)_9%,rgba(6,10,30,.18)_24%,rgba(255,255,255,.16)_39%,rgba(255,255,255,0)_54%,rgba(6,10,30,.2)_76%,rgba(16,26,54,.84)_91%,#101a36_97%)]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[18px] shadow-[inset_0_5px_10px_rgba(0,0,0,.55),inset_0_-3px_6px_rgba(0,0,0,.4),inset_0_0_0_2px_rgba(0,0,0,.3)]"
                />
              </div>
            </div>
            <motion.div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-5 -ml-3.25 h-10 w-6.5 origin-[50%_9px] drop-shadow-[0_3px_2px_rgba(40,28,10,.35)]"
              style={{ rotate: pin }}
            >
              <span className="absolute top-5.5 left-1/2 -ml-2 border-x-8 border-t-16 border-x-transparent border-t-[#e0432a]" />
              <span className="absolute top-0 left-1/2 -ml-3 size-6 rounded-full bg-[radial-gradient(circle_at_38%_32%,#ff8a6a,#e0432a_60%)] shadow-[inset_0_-2px_0_rgba(0,0,0,.2)]" />
              <span className="absolute top-2 left-1/2 -ml-1 size-2 rounded-full bg-[#f8f5ef] shadow-[inset_0_1px_1px_rgba(0,0,0,.3)]" />
            </motion.div>
          </div>
        </div>

        <div className="mt-2.5 flex justify-center px-4">
          <div className="flex items-center gap-4 rounded-xl bg-[#2a2925] px-4 py-2.5 text-(--ovio-surface) shadow-[inset_0_3px_6px_rgba(0,0,0,.6)]">
            <div className="flex items-baseline gap-1.75">
              <span className="text-[26px] leading-none font-extrabold tracking-[-0.02em] tabular-nums">
                {formatNumber(count)}
              </span>
              <span className="text-xs text-[#bdb6a8]">{active ? unit(count) : "this week"}</span>
            </div>
            <div className="flex flex-col gap-0.5 font-(family-name:--ovio-mono) text-[12px] leading-tight text-[#bdb6a8]">
              <span className="tracking-[0.08em] uppercase">
                {active ? "Day" : `Week ${front + 1} of ${n}`}
              </span>
              <span>
                {active
                  ? withYear(active, active.label)
                  : `${short(shown[0])} – ${short(shown[shown.length - 1])}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
        <span>Drag or flick to spin · arrows step a day or week</span>
        <span className="flex gap-2">
          <DrumKey
            label="Previous week"
            tone="white"
            onClick={() => nudge(-1)}
            point="M15 6l-6 6 6 6"
          />
          <DrumKey label="Next week" tone="red" onClick={() => nudge(1)} point="M9 6l6 6-6 6" />
        </span>
      </div>
    </section>
  );
}

const KEY = {
  white: {
    side: "bg-[linear-gradient(180deg,#d8d1c1,#b5ad9b)]",
    cap: "bg-[linear-gradient(180deg,#ffffff,#efe9dd)] text-(--ovio-ink) shadow-[inset_0_2px_0_#fff,inset_0_-2px_0_rgba(60,45,20,.08),0_1px_0_rgba(60,45,20,.12)]",
    glyph: "drop-shadow-[0_1px_0_#fff]",
  },
  red: {
    side: "bg-[linear-gradient(180deg,#c23a1f,#8f240f)]",
    cap: "bg-[linear-gradient(180deg,#ff7652,#e8401c)] text-white shadow-[inset_0_2px_0_rgba(255,255,255,.35),inset_0_-2px_0_rgba(0,0,0,.1),0_1px_0_rgba(0,0,0,.15)]",
    glyph: "drop-shadow-[0_-1px_0_rgba(120,25,5,.55)]",
  },
};

/**
 * A chunky plastic key: the cap rides on a visible side wall and sinks into it when pressed.
 * The press is quick and the release a touch slower, so it feels like a spring underneath.
 */
function DrumKey({
  label,
  tone,
  onClick,
  point,
}: {
  label: string;
  tone: keyof typeof KEY;
  onClick: () => void;
  /** The chevron's path, in a 24px box. */
  point: string;
}) {
  const k = KEY[tone];
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group relative h-12.75 w-11 cursor-pointer border-0 bg-transparent p-0"
    >
      {/* The side wall shows only below the cap, so a pressed cap hides it. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-1.75 bottom-0 rounded-[13px] shadow-[0_0_0_1px_rgba(40,28,10,.12),0_12px_14px_-8px_rgba(40,28,10,.5)]",
          k.side,
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 flex h-11 items-center justify-center rounded-[13px] transition-transform duration-150 ease-[cubic-bezier(.2,.9,.3,1.3)] group-hover:-translate-y-px group-active:translate-y-1.5 group-active:duration-60 group-active:ease-out motion-reduce:transition-none",
          k.cap,
        )}
      >
        <svg viewBox="0 0 24 24" className={cn("size-5.5", k.glyph)}>
          <path
            d={point}
            fill="none"
            stroke="currentColor"
            strokeWidth={3.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
