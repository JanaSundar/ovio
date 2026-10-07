"use client";

import {
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "motion/react";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

export const ANGLE_MIN = -135;
export const ANGLE_MAX = 135;
const SPAN = ANGLE_MAX - ANGLE_MIN;
/** How far past the end stop the cap can be pulled, in degrees. */
const OVERDRAG = 8;
/** Fastest flick carried into inertia, in degrees per second. */
const MAX_SPIN = 1600;

export type KnobFeel = {
  /** Number of detents between min and max, inclusive. 101 feels continuous; 11 clicks. */
  steps: number;
  /** How the cap follows its target: a spring, or "step" to jump detent to detent. */
  follow: SpringOptions | "step";
  /** Detents moved per wheel notch. */
  wheel: number;
};

type Options = KnobFeel & {
  /** The element that receives wheel events. */
  ref: RefObject<HTMLDivElement | null>;
  index: number;
  onIndex: (index: number) => void;
  disabled?: boolean;
};

export type Knob = {
  /** The displayed cap angle in degrees, already springing. */
  angle: MotionValue<number>;
  handlers: {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: PointerEvent<HTMLDivElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  };
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function indexToAngle(index: number, steps: number) {
  return ANGLE_MIN + (index * SPAN) / (steps - 1);
}

/**
 * Rotary drag with weight. The pointer turns the knob around its centre, the cap follows on a
 * spring, it resists past the end stops, and a flick carries on with inertia before it settles.
 * Wheel and arrow keys move it by detents.
 */
export function useKnob({ ref, steps, follow, wheel, index, onIndex, disabled }: Options): Knob {
  const reduced = useReducedMotionSafe();
  const target = useMotionValue(indexToAngle(index, steps));
  const sprung = useSpring(target, follow === "step" ? { stiffness: 1000, damping: 100 } : follow);
  const stepped = useTransform(target, (a) => {
    const span = SPAN / (steps - 1);
    return ANGLE_MIN + Math.round((clamp(a, ANGLE_MIN, ANGLE_MAX) - ANGLE_MIN) / span) * span;
  });
  const angle = reduced || follow === "step" ? (follow === "step" ? stepped : target) : sprung;

  const span = SPAN / (steps - 1);
  const angleToIndex = (a: number) =>
    Math.round((clamp(a, ANGLE_MIN, ANGLE_MAX) - ANGLE_MIN) / span);
  const drag = useRef<{
    pointer: number;
    cx: number;
    cy: number;
    last: number;
    acc: number;
    start: number;
    av: number;
    t: number;
  } | null>(null);

  // Follow the controlled index when it changes from outside (not mid-drag).
  const lastIndex = useRef(index);
  useEffect(() => {
    if (drag.current || lastIndex.current === index) return;
    lastIndex.current = index;
    target.set(indexToAngle(index, steps));
  }, [index, steps, target]);

  const emit = (i: number) => {
    const next = clamp(i, 0, steps - 1);
    if (next !== lastIndex.current) {
      lastIndex.current = next;
      onIndex(next);
    }
  };

  const setIndex = (i: number) => {
    const next = clamp(i, 0, steps - 1);
    target.set(indexToAngle(next, steps));
    emit(next);
  };

  // Wheel needs a non-passive listener so the page doesn't scroll while turning.
  const wheelState = useRef({ steps: wheel, setIndex });
  useEffect(() => {
    wheelState.current = { steps: wheel, setIndex };
  });
  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { steps: n, setIndex: set } = wheelState.current;
      set(lastIndex.current + (e.deltaY < 0 ? n : -n));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [disabled, ref]);

  const pointerAngle = (e: { clientX: number; clientY: number }, cx: number, cy: number) =>
    (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    drag.current = {
      pointer: e.pointerId,
      cx,
      cy,
      last: pointerAngle(e, cx, cy),
      acc: 0,
      start: target.get(),
      av: 0,
      t: performance.now(),
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    e.preventDefault();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    const now = performance.now();
    const dt = Math.max(1, now - d.t);
    const a = pointerAngle(e, d.cx, d.cy);
    let da = a - d.last;
    if (da > 180) da -= 360;
    if (da < -180) da += 360;
    d.last = a;
    d.t = now;
    d.acc += da;
    // Smoothed angular velocity in deg/s, capped so one jumpy event cannot spin it to the stop.
    d.av = clamp(d.av * 0.6 + (da / dt) * 1000 * 0.4, -MAX_SPIN, MAX_SPIN);
    const raw = d.start + d.acc;
    const over = raw < ANGLE_MIN ? raw - ANGLE_MIN : raw > ANGLE_MAX ? raw - ANGLE_MAX : 0;
    if (over) d.acc -= over;
    // Past an end stop the cap only gives a little, like a hard detent.
    const next = over ? (over > 0 ? ANGLE_MAX : ANGLE_MIN) + OVERDRAG * Math.tanh(over / 40) : raw;
    target.set(next);
    emit(angleToIndex(next));
  };

  const release = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    drag.current = null;
    // A fresh flick carries on: rotational inertia, then it settles.
    const fresh = performance.now() - d.t < 90;
    let rest = target.get() + (fresh && !reduced ? d.av * 0.28 : 0);
    rest = clamp(rest, ANGLE_MIN, ANGLE_MAX);
    if (steps <= 26) rest = indexToAngle(angleToIndex(rest), steps);
    target.set(rest);
    emit(angleToIndex(rest));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const page = Math.max(1, Math.round((steps - 1) / 10));
    const delta: Record<string, number> = {
      ArrowUp: 1,
      ArrowRight: 1,
      ArrowDown: -1,
      ArrowLeft: -1,
      PageUp: page,
      PageDown: -page,
    };
    if (e.key === "Home") setIndex(0);
    else if (e.key === "End") setIndex(steps - 1);
    else if (e.key in delta) setIndex(lastIndex.current + delta[e.key]);
    else return;
    e.preventDefault();
  };

  return {
    angle,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: release,
      onPointerCancel: release,
      onKeyDown,
    },
  };
}
