"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import {
  fromThumbs,
  keyValue,
  moveThumb,
  nearestThumb,
  percentOf,
  snap,
  toThumbs,
  type RangeValue,
} from "./range";

export type { RangeValue };

export interface FluidRangeSliderProps {
  /** A number for one thumb, a [low, high] pair for a range. */
  value?: RangeValue;
  defaultValue?: RangeValue;
  onValueChange?: (value: RangeValue) => void;
  /** Fires once when a drag or key press settles. */
  onValueCommit?: (value: RangeValue) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Accessible name, also printed above the track. */
  label?: string;
  formatValue?: (value: number) => string;
  /** Dots under the track at every step, when there are 40 or fewer. */
  ticks?: boolean;
  /** How hard the thumb chases the pointer, and how quickly it settles. */
  stiffness?: number;
  damping?: number;
  /** Fill and droplet colour, any CSS colour. */
  accent?: string;
  disabled?: boolean;
  className?: string;
}

const format = (v: number) => v.toLocaleString("en-US");

export function FluidRangeSlider({
  value: valueProp,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  label = "Value",
  formatValue = format,
  ticks = false,
  stiffness = 520,
  damping = 30,
  accent = "#9b8cff",
  disabled,
  className,
}: FluidRangeSliderProps) {
  const [inner, setInner] = useState<RangeValue>(defaultValue ?? min + (max - min) / 2);
  const value = valueProp ?? inner;
  const range = Array.isArray(value);
  const thumbs = toThumbs(value, min, max);
  const [active, setActive] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const handles = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion() ?? false;
  const gooId = `frs-goo-${useId().replace(/:/g, "")}`;

  const spring = { stiffness, damping, mass: 0.6 };
  const lo = useFollow(percentOf(thumbs[0], min, max), spring, reduced);
  const hi = useFollow(percentOf(thumbs[1] ?? thumbs[0], min, max), spring, reduced);
  const fillLeft = useTransform(lo, (v) => (range ? `${v}%` : "0%"));
  const fillRight = useTransform([lo, hi], ([a, b]: number[]) => `${100 - (range ? b : a)}%`);

  const commit = (next: number[]) => {
    const out = fromThumbs(next, range);
    if (valueProp === undefined) setInner(out);
    onValueChange?.(out);
    return out;
  };

  const valueAt = (clientX: number) => {
    const rect = track.current!.getBoundingClientRect();
    const share = rect.width ? (clientX - rect.left) / rect.width : 0;
    return snap(min + share * (max - min), min, max, step);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    const v = valueAt(e.clientX);
    const index = nearestThumb(thumbs, v);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
    handles.current[index]?.focus({ preventScroll: true });
    setActive(index);
    setDragging(true);
    commit(moveThumb(thumbs, index, v));
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging || active === null) return;
    commit(moveThumb(thumbs, active, valueAt(e.clientX)));
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    onValueCommit?.(fromThumbs(thumbs, range));
  };

  const count = (max - min) / step;
  const tickMarks = ticks && count > 0 && count <= 40 ? Math.floor(count) + 1 : 0;
  const shown = range
    ? `${formatValue(thumbs[0])} – ${formatValue(thumbs[1])}`
    : formatValue(thumbs[0]);

  return (
    <div
      className={cn("w-full select-none", disabled && "opacity-50", className)}
      style={{ "--frs-accent": accent } as CSSProperties}
    >
      <GooDefs id={gooId} />
      <div className="mb-3 flex items-baseline justify-between gap-4 text-sm">
        <span className="text-[#a9a9b3]">{label}</span>
        <span className="font-mono text-[#ededf0] tabular-nums">{shown}</span>
      </div>
      <div
        className={cn("relative py-3", disabled ? "cursor-not-allowed" : "cursor-pointer")}
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <div ref={track} className="relative h-1.5 rounded-full bg-white/10">
          <motion.div
            className="absolute inset-y-0 rounded-full bg-(--frs-accent)"
            style={{ left: fillLeft, right: fillRight }}
          />
        </div>
        {thumbs.map((t, i) => (
          <Thumb
            key={i}
            ref={(el) => {
              handles.current[i] = el;
            }}
            position={i === 0 ? lo : hi}
            gooId={gooId}
            lifted={active === i}
            dragging={dragging && active === i}
            reduced={reduced}
            text={formatValue(t)}
            name={range ? `${label} ${i === 0 ? "minimum" : "maximum"}` : label}
            bounds={[i === 1 ? thumbs[0] : min, i === 0 && range ? thumbs[1] : max]}
            now={t}
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            onFocus={() => setActive(i)}
            onBlur={() => setActive((a) => (a === i && !dragging ? null : a))}
            onKeyDown={(e) => {
              if (disabled) return;
              const next = keyValue(e.key, t, { min, max, step, shift: e.shiftKey });
              if (next === null) return;
              e.preventDefault();
              onValueCommit?.(commit(moveThumb(thumbs, i, next)));
            }}
          />
        ))}
      </div>
      {tickMarks > 0 && (
        <div aria-hidden className="mt-1 flex justify-between px-px">
          {Array.from({ length: tickMarks }, (_, k) => (
            <span key={k} className="size-1 rounded-full bg-white/15" />
          ))}
        </div>
      )}
    </div>
  );
}

/** A percentage that springs after its target, or jumps there under reduced motion. */
function useFollow(target: number, spring: object, reduced: boolean) {
  const source = useMotionValue(target);
  const follow = useSpring(source, spring);
  useEffect(() => {
    source.set(target);
    if (reduced) follow.jump(target);
  }, [target, reduced, source, follow]);
  return follow;
}

type ThumbProps = {
  ref: (el: HTMLDivElement | null) => void;
  position: MotionValue<number>;
  gooId: string;
  lifted: boolean;
  dragging: boolean;
  reduced: boolean;
  text: string;
  name: string;
  /** What this thumb can reach: a range's thumbs stop at each other. */
  bounds: [number, number];
  now: number;
  disabled?: boolean;
  tabIndex: number;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
};

/**
 * One handle. Its droplet and the value bubble share a goo filter, so the bubble pulls out of the
 * droplet like a bead of liquid; speed stretches the droplet along the track.
 */
function Thumb({
  ref,
  position,
  gooId,
  lifted,
  dragging,
  reduced,
  text,
  name,
  bounds,
  now,
  disabled,
  ...rest
}: ThumbProps) {
  const left = useTransform(position, (v) => `${v}%`);
  const velocity = useVelocity(position);
  const stretch = useTransform(velocity, [-600, 0, 600], [1.45, 1, 1.45]);
  const squash = useTransform(stretch, (s) => 1 / Math.sqrt(s));
  const scaleX = reduced ? 1 : stretch;
  const scaleY = reduced ? 1 : squash;
  const rise = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 22 };

  return (
    <motion.div className="absolute top-1/2 size-0" style={{ left }}>
      {/* The goo box has a real size, so the filter has a region to draw in. */}
      <div
        aria-hidden
        className="absolute -top-20 -left-10 h-26 w-20"
        style={{ filter: `url(#${gooId})` }}
      >
        <motion.span
          className="absolute top-17 left-7 size-6 rounded-full bg-(--frs-accent)"
          style={{ scaleX, scaleY }}
        />
        <motion.span
          className="absolute top-[66px] left-3 h-7 w-14 rounded-full bg-(--frs-accent)"
          initial={false}
          animate={{ y: lifted ? -34 : 0, scale: lifted ? 1 : 0.3 }}
          transition={rise}
        />
      </div>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -top-3.5 -left-10 h-7 w-20 text-center font-mono text-xs leading-7 font-semibold text-[#0b0b10] tabular-nums"
        initial={false}
        animate={{ y: lifted ? -34 : 0, opacity: lifted ? 1 : 0 }}
        transition={rise}
      >
        {text}
      </motion.span>
      <motion.div
        ref={ref}
        role="slider"
        aria-orientation="horizontal"
        aria-label={name}
        aria-valuemin={bounds[0]}
        aria-valuemax={bounds[1]}
        aria-valuenow={now}
        aria-valuetext={text}
        aria-disabled={disabled || undefined}
        {...rest}
        className="absolute -top-2.5 -left-2.5 size-5 rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,.4)] outline-offset-4"
        style={{ scaleX, scaleY }}
        animate={{ scale: dragging ? 0.82 : 1 }}
        transition={rise}
      />
    </motion.div>
  );
}

/** Blurs the droplet and bubble together, then cuts the alpha back to a hard edge. */
function GooDefs({ id }: { id: string }) {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feColorMatrix
            in="b"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
          />
        </filter>
      </defs>
    </svg>
  );
}
