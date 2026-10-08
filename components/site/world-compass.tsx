"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { WORLD_INFO } from "@/content/worlds";
import { keyToIndex } from "@/lib/keys";
import { useSiteWorld } from "./site-world";

/** The four worlds sit on the cardinal points, clockwise from north. */
const POINTS = [
  { x: 50, y: 21 },
  { x: 79, y: 50 },
  { x: 50, y: 79 },
  { x: 21, y: 50 },
];
/** Each world's swatch, matching its stage. */
const SWATCH = ["#ffffff", "#e8d6b4", "#c9dc4e", "#c4b8ff"];

const C = 120;
/** A point `r` from the centre, `deg` clockwise from north. */
const at = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
};
/** The nearest cardinal point to an angle. */
const pointOf = (deg: number) => ((Math.round(deg / 90) % 4) + 4) % 4;
/** The short way round from one angle to another. */
const shortest = (from: number, to: number) => from + ((((to - from) % 360) + 540) % 360) - 180;

const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
/** How far the compass leans toward the cursor, and how far it may go. */
const PULL = 0.12;
const REACH = 14;

/**
 * The homepage's world compass. Each world is a cardinal point; click one, drag the needle round
 * or use the arrow keys. The needle swings with a little overshoot, as a compass does, and with a
 * mouse the whole instrument leans toward the cursor.
 */
export function WorldCompass() {
  const { world, setWorld } = useSiteWorld();
  const index = WORLD_INFO.findIndex((w) => w.id === world);
  const face = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; turning: boolean } | null>(null);

  const angle = useMotionValue(index * 90);
  const rotate = useSpring(angle, { stiffness: 140, damping: 9, mass: 0.8 });
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const x = useSpring(pullX, { stiffness: 170, damping: 14, mass: 0.6 });
  const y = useSpring(pullY, { stiffness: 170, damping: 14, mass: 0.6 });
  // The glass and needle drift further than the bezel, so the instrument reads as having depth.
  const capX = useTransform(x, (v) => v * 0.5);
  const capY = useTransform(y, (v) => v * 0.5);

  // Follow world changes from the tabs and number keys; a drag is already pointing the needle.
  useEffect(() => {
    if (!drag.current?.turning) angle.set(shortest(angle.get(), index * 90));
  }, [index, angle]);

  const angleAt = (e: PointerEvent) => {
    const r = face.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, turning: false };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.turning) {
      // A small movement is still a click on a point.
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
      d.turning = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      pullX.set(0);
      pullY.set(0);
    }
    const deg = angleAt(e);
    angle.set(shortest(angle.get(), deg));
    const next = WORLD_INFO[pointOf(deg)].id;
    if (next !== world) setWorld(next);
  };

  const onPointerEnd = () => {
    if (drag.current?.turning) angle.set(Math.round(angle.get() / 90) * 90);
    drag.current = null;
  };

  /** The magnet: the compass leans toward a mouse anywhere over its zone. */
  const onZoneMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || drag.current?.turning) return;
    const r = e.currentTarget.getBoundingClientRect();
    const clamp = (v: number) => Math.max(-REACH, Math.min(REACH, v));
    pullX.set(clamp((e.clientX - (r.left + r.width / 2)) * PULL));
    pullY.set(clamp((e.clientY - (r.top + r.height / 2)) * PULL));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const next = keyToIndex(e.key, index, WORLD_INFO.length, { wrap: true });
    if (next === null) return;
    e.preventDefault();
    setWorld(WORLD_INFO[next].id);
    face.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  return (
    <div
      className="compass-zone"
      onPointerMove={onZoneMove}
      onPointerLeave={() => {
        pullX.set(0);
        pullY.set(0);
      }}
    >
      <motion.div
        ref={face}
        className="compass"
        style={{ x, y }}
        role="radiogroup"
        aria-label="Design world"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
      >
        <svg viewBox="0 0 240 240" aria-hidden className="compass-art">
          <defs>
            <radialGradient id="compass-face" cx="50%" cy="38%" r="70%">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#efede6" />
            </radialGradient>
          </defs>
          {/* Bezel */}
          <circle cx={C} cy={C} r={117} fill="#20211f" />
          <circle cx={C} cy={C} r={110} fill="#2b2c29" />
          {TICKS.map((deg) => {
            const major = deg % 90 === 0;
            const mid = deg % 45 === 0;
            const [x1, y1] = at(deg, major ? 99 : mid ? 102 : 105);
            const [x2, y2] = at(deg, 109);
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={major ? "#d7fb58" : "#8d8f87"}
                strokeWidth={major ? 2.4 : mid ? 1.6 : 1}
                strokeLinecap="round"
              />
            );
          })}
          {/* Face */}
          <circle cx={C} cy={C} r={97} fill="url(#compass-face)" />
          <circle cx={C} cy={C} r={62} fill="none" stroke="#d6d5cc" strokeDasharray="1 4" />
          {/* The rose: a four-point star with fainter diagonals. */}
          <g opacity={0.9}>
            {[45, 135, 225, 315].map((deg) => {
              const [tx, ty] = at(deg, 40);
              const [lx, ly] = at(deg - 45, 9);
              const [rx, ry] = at(deg + 45, 9);
              return (
                <polygon
                  key={deg}
                  points={`${C},${C} ${lx},${ly} ${tx},${ty} ${rx},${ry}`}
                  fill="#e4e2da"
                />
              );
            })}
            {[0, 90, 180, 270].map((deg) => {
              const [tx, ty] = at(deg, 56);
              const [lx, ly] = at(deg - 45, 12);
              const [rx, ry] = at(deg + 45, 12);
              return (
                <g key={deg}>
                  <polygon points={`${C},${C} ${lx},${ly} ${tx},${ty}`} fill="#d3d1c8" />
                  <polygon points={`${C},${C} ${rx},${ry} ${tx},${ty}`} fill="#bdbbb2" />
                </g>
              );
            })}
          </g>
        </svg>

        {/* The lubber mark on the bezel follows the needle. */}
        <motion.div aria-hidden className="compass-spin" style={{ rotate }}>
          <span className="compass-lubber" />
        </motion.div>

        {WORLD_INFO.map((w, i) => (
          <button
            key={w.id}
            type="button"
            role="radio"
            aria-checked={i === index}
            aria-label={w.id}
            tabIndex={i === index ? 0 : -1}
            className="compass-point"
            style={{ left: `${POINTS[i].x}%`, top: `${POINTS[i].y}%` }}
            onClick={() => setWorld(w.id)}
          >
            <i style={{ background: SWATCH[i] }} />
            {w.id}
          </button>
        ))}

        <motion.div aria-hidden className="compass-spin" style={{ rotate, x: capX, y: capY }}>
          <svg viewBox="0 0 240 240" className="compass-art">
            <polygon
              points={`${C},${C - 50} ${C + 7},${C} ${C},${C + 4} ${C - 7},${C}`}
              fill="#20211f"
            />
            <polygon points={`${C},${C - 50} ${C + 7},${C} ${C},${C}`} fill="#3d3f3a" />
            <polygon points={`${C},${C + 34} ${C + 6},${C} ${C - 6},${C}`} fill="#c9c7be" />
            <circle cx={C} cy={C} r={8} fill="#20211f" />
            <circle cx={C} cy={C} r={3.5} fill="#d7fb58" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
