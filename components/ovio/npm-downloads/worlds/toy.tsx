"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type PointerEvent } from "react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { formatDelta, type NpmDownloadsWorldProps } from "../npm-downloads";

const MIN = -135;
const SPAN = 270;
/** Decorative ticks around the knob, whatever the number of weeks. */
const TICKS = 14;

const angleOf = (index: number, count: number) =>
  count > 1 ? MIN + (index * SPAN) / (count - 1) : MIN + SPAN;

/**
 * The week knob: drag it round (it follows with the Toy knob spring, k95 c22) and it clicks
 * into one detent per week. Arrow keys, Home and End turn it too.
 */
function WeekKnob({
  count,
  selected,
  select,
  onKeyDown,
  currentText,
}: { count: number } & Pick<
  NpmDownloadsWorldProps,
  "selected" | "select" | "onKeyDown" | "currentText"
>) {
  const reduced = useReducedMotionSafe();
  const target = useMotionValue(angleOf(selected, count));
  const sprung = useSpring(target, motionTokens.toy.knob);
  const drag = useRef<{ pointer: number; cx: number; cy: number; last: number } | null>(null);

  // Keys and outside changes move the knob to the selected detent (not while dragging).
  useEffect(() => {
    if (!drag.current) target.set(angleOf(selected, count));
  }, [selected, count, target]);

  const pointerAngle = (e: PointerEvent, cx: number, cy: number) =>
    (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
  const toIndex = (angle: number) =>
    count > 1 ? Math.round(((angle - MIN) / SPAN) * (count - 1)) : 0;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    drag.current = { pointer: e.pointerId, cx, cy, last: pointerAngle(e, cx, cy) };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    e.preventDefault();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    const a = pointerAngle(e, d.cx, d.cy);
    let da = a - d.last;
    if (da > 180) da -= 360;
    if (da < -180) da += 360;
    d.last = a;
    const next = Math.max(MIN, Math.min(MIN + SPAN, target.get() + da));
    target.set(next);
    select(toIndex(next));
  };

  const release = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointer !== e.pointerId) return;
    drag.current = null;
    // Settle into the nearest detent.
    target.set(angleOf(toIndex(target.get()), count));
  };

  return (
    <div className="mx-auto flex flex-col items-center gap-2.5">
      <div
        role="slider"
        tabIndex={0}
        aria-label="Week"
        aria-valuemin={0}
        aria-valuemax={count - 1}
        aria-valuenow={selected}
        aria-valuetext={currentText}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        className="relative size-32 cursor-grab touch-none rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-(--ovio-accent) active:cursor-grabbing"
      >
        {Array.from({ length: TICKS }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute top-0 left-[63px] h-[9px] w-0.5 origin-[1px_64px] rounded-[1px] bg-(--ovio-faint)"
            style={{ transform: `rotate(${(MIN + (i * SPAN) / (TICKS - 1)).toFixed(1)}deg)` }}
          />
        ))}
        <div className="absolute inset-4 rounded-full bg-(--ovio-red) shadow-[0_7px_0_var(--ovio-red-deep),0_16px_18px_-8px_rgba(40,28,10,.5),inset_0_2px_0_rgba(255,255,255,.3)]" />
        <motion.div
          aria-hidden
          className="absolute inset-4 rounded-full"
          style={{ rotate: reduced ? target : sprung }}
        >
          <span className="absolute top-2 left-1/2 -ml-[3.5px] h-6 w-[7px] rounded-[4px] bg-(--ovio-surface) shadow-[inset_0_2px_2px_rgba(0,0,0,.2)]" />
        </motion.div>
      </div>
      <span className="font-(family-name:--ovio-mono) text-[11px] tracking-[0.1em] text-(--ovio-muted)">
        TURN · WEEK
      </span>
    </div>
  );
}

export function ToyNpmDownloads({
  pkg,
  points,
  selected,
  current,
  currentText,
  select,
  onKeyDown,
  goal,
  goalProgress,
  summary,
  className,
}: NpmDownloadsWorldProps) {
  const led = useOvioTransition(motionTokens.minimal.fast);
  const slide = useOvioTransition(motionTokens.toy.slide);
  const up = (current.delta ?? 0) >= 0;

  return (
    <section
      data-ovio-world="toy"
      aria-label={`${pkg} weekly downloads`}
      className={cn(
        "flex w-full max-w-[580px] flex-wrap items-center gap-6 rounded-[22px] bg-(--ovio-surface) p-[22px] font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_1px_0_#fff,0_7px_0_#d2ccbf,0_22px_30px_-16px_rgba(40,28,10,.45)]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-3.5">
        <div className="font-(family-name:--ovio-mono) text-[11px] tracking-[0.08em] text-(--ovio-muted) uppercase">
          npm · {pkg} · downloads / week
        </div>
        <div className="flex w-max rounded-xl bg-[#2a2925] px-[18px] py-2.5 font-(family-name:--ovio-mono) text-[40px] leading-none font-semibold text-(--ovio-surface) shadow-[inset_0_3px_6px_rgba(0,0,0,.6)]">
          <RollingNumber value={current.downloads} />
        </div>
        <div role="img" aria-label={summary} className="flex h-[54px] items-end gap-[3px]">
          {points.map((p, i) => (
            <motion.div
              key={p.week}
              className="flex-1 rounded-[3px]"
              style={{ height: `${(p.height * 100).toFixed(1)}%` }}
              initial={false}
              animate={{ backgroundColor: i === selected ? "#ef4f2b" : "#d6cfc0" }}
              transition={led}
            />
          ))}
        </div>
        <div className="flex justify-between font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
          <span>
            {current.ago === 0 ? "THIS WEEK" : `${current.ago} WK AGO`} ·{" "}
            {current.label.toUpperCase()}
          </span>
          {current.delta !== null && (
            <span className={up ? "text-[#1f7c52]" : "text-(--ovio-red-deep)"}>
              {formatDelta(current.delta, ["▲ ", "▼ "])}
            </span>
          )}
        </div>
        {goal !== undefined && (
          <div className="flex items-center gap-3 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
            <span>GOAL {formatNumber(goal)}</span>
            <span
              aria-hidden
              className="relative h-3 flex-1 rounded-full bg-(--ovio-track) shadow-[inset_0_2px_3px_rgba(40,28,10,.3)]"
            >
              <motion.span
                className="absolute inset-y-0.5 left-0.5 rounded-full bg-(--ovio-yellow) shadow-[inset_0_-2px_0_var(--ovio-yellow-deep)]"
                initial={false}
                animate={{ width: `calc(${(goalProgress * 100).toFixed(1)}% - 4px)` }}
                transition={slide}
              />
            </span>
            <RollingNumber value={goalProgress} format={{ style: "percent" }} />
          </div>
        )}
      </div>
      <WeekKnob
        count={points.length}
        selected={selected}
        select={select}
        onKeyDown={onKeyDown}
        currentText={currentText}
      />
    </section>
  );
}
