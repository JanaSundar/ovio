"use client";

import {
  animate,
  PresenceContext,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  type SpringOptions,
  type Transition,
} from "motion/react";
import {
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useReducedMotionSafe } from "@/lib/motion";
import type { MagnifierWorldProps } from "./liquid-magnifier";
import {
  contentTransform,
  lensRadius,
  lensTransform,
  moveForKey,
  snap,
  squash,
  zoomForKey,
  zoomForWheel,
  zoomReadout,
} from "./magnifier";

export type MagnifierFeel = {
  /** How the lens follows the pointer: a spring, or "step" to jump straight there. */
  follow: SpringOptions | "step";
  /** Retro: the lens centre snaps to this grid, in px. */
  grid?: number;
  /** How far the liquid edge wanders, in % of the radius. 0 leaves the shape to the world. */
  wobble: number;
  /** Stretch per px/s of lens speed, and the most it ever stretches. */
  squash: number;
  maxSquash: number;
  /** How the lens grows in on mount, and how a new zoom settles. */
  pop: Transition;
  zoom: Transition;
  /** Retro prints whole zoom steps. */
  wholeZoom?: boolean;
};

/** One loop of the liquid edge, in seconds. */
const WOBBLE_PERIOD = 12;

/**
 * A world's lens: it follows the pointer (or a finger dragged across the view), rests at `rest`
 * when the pointer leaves, and moves with the arrow keys. A pinch (or Ctrl/⌘ + wheel) and + / - change the zoom.
 *
 * Everything is a Motion value: the lens transform stretches it along its velocity like a drop,
 * its corner radii wander for the liquid edge, and the magnified copy inside is moved and scaled
 * so the point under the lens sits at its centre. On mount the lens grows in, unless it is inside
 * `<AnimatePresence initial={false}>` (a world switched in on the docs stage) or motion is reduced.
 */
export function useMagnifierWorld(world: MagnifierWorldProps, feel: MagnifierFeel) {
  const { zoom, setZoom, minZoom, maxZoom, rest, disabled, label, size: lensSize } = world;
  const { x: restX, y: restY } = rest;
  const reduced = useReducedMotionSafe();
  // Read once, at mount: the presence context drops `initial` on later renders.
  const [enters] = useState(useContext(PresenceContext)?.initial !== false);
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  // Handlers and the wheel listener read these; render reads the state above.
  const boxRef = useRef(box);
  const zoomRef = useRef(zoom);
  const drag = useRef(false);

  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const springs = feel.follow === "step" ? { stiffness: 1, damping: 1 } : feel.follow;
  const sx = useSpring(tx, springs);
  const sy = useSpring(ty, springs);
  const direct = reduced || feel.follow === "step";
  const x = useTransform(() => snap((direct ? tx : sx).get(), feel.grid));
  const y = useTransform(() => snap((direct ? ty : sy).get(), feel.grid));
  const vx = useVelocity(x);
  const vy = useVelocity(y);
  const r = useMotionValue(0);
  const z = useMotionValue(zoom);
  const phase = useMotionValue(1.3);
  const grow = useMotionValue(enters && !reduced ? 0 : 1);

  const gain = reduced ? 0 : feel.squash;
  const lens = useTransform(() => {
    const s = squash(vx.get(), vy.get(), gain, feel.maxSquash);
    return lensTransform(x.get(), y.get(), r.get(), grow.get(), s.angle, s.stretch);
  });
  const content = useTransform(() => contentTransform(x.get(), y.get(), r.get(), z.get()));
  const radius = useTransform(() => lensRadius(phase.get(), reduced ? 0 : feel.wobble));
  const readout = useTransform(() => zoomReadout(z.get(), feel.wholeZoom));
  const coords = useTransform(() => {
    const p = (n: number) => String(Math.round(n)).padStart(3, "0");
    return `X:${p(x.get())} Y:${p(y.get())}`;
  });
  /** How far along its range the zoom is, as a CSS length for a slider knob. */
  const zoomAt = useTransform(() => `${((z.get() - minZoom) / (maxZoom - minZoom)) * 100}%`);

  const size = useTransform(() => r.get() * 2);

  const moveTo = (px: number, py: number) => {
    const { w, h } = boxRef.current;
    tx.set(Math.min(w, Math.max(0, px)));
    ty.set(Math.min(h, Math.max(0, py)));
  };
  const toRest = () => moveTo(rest.x * boxRef.current.w, rest.y * boxRef.current.h);

  // Measure the view, so the magnified copy is the same size as the original.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const next = { w: el.clientWidth, h: el.clientHeight };
      const first = boxRef.current.w === 0;
      boxRef.current = next;
      setBox(next);
      r.set(Math.min(lensSize, next.w * 0.4) / 2);
      // The first measure puts the lens straight at its rest, with no spring across the view.
      if (first)
        for (const [v, at] of [
          [tx, restX * next.w],
          [sx, restX * next.w],
          [ty, restY * next.h],
          [sy, restY * next.h],
        ] as const)
          v.jump(at);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lensSize, restX, restY, r, tx, ty, sx, sy]);

  // The lens grows in once it has somewhere to be.
  useEffect(() => {
    if (box.w === 0 || grow.get() === 1) return;
    const run = animate(grow, 1, feel.pop);
    return () => run.stop();
  }, [box.w, grow, feel.pop]);

  // The liquid edge keeps moving.
  useEffect(() => {
    if (reduced || !feel.wobble) return;
    const run = animate(phase, [phase.get(), phase.get() + Math.PI * 2], {
      duration: WOBBLE_PERIOD,
      ease: "linear",
      repeat: Infinity,
    });
    return () => run.stop();
  }, [reduced, feel.wobble, phase]);

  // A new zoom settles in the world's feel.
  useEffect(() => {
    zoomRef.current = zoom;
    if (reduced) {
      z.set(zoom);
      return;
    }
    const run = animate(z, zoom, feel.zoom);
    return () => run.stop();
  }, [zoom, reduced, z, feel.zoom]);

  // A pinch, or the wheel with Ctrl or ⌘ held, zooms; a plain wheel still scrolls the page. At
  // either end of the range the page takes over too. React's onWheel is passive, so this listens directly.
  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      const current = zoomRef.current;
      const next = zoomForWheel(current, e.deltaY, minZoom, maxZoom);
      if (next === current) return;
      e.preventDefault();
      setZoom(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [disabled, minZoom, maxZoom, setZoom]);

  const pointAt = (e: PointerEvent<HTMLDivElement>) => {
    // The rect counts the border, and the turn a world gives its card; the lens works inside it.
    const el = e.currentTarget;
    const b = el.getBoundingClientRect();
    const k = el.offsetWidth / b.width;
    return [
      (e.clientX - b.left) * k - el.clientLeft,
      (e.clientY - b.top) * k - el.clientTop,
    ] as const;
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || (e.pointerType !== "mouse" && !drag.current)) return;
    moveTo(...pointAt(e));
  };

  // A finger or pen drags the lens; a mouse only has to hover.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || !e.isPrimary) return;
    e.currentTarget.focus({ preventScroll: true });
    if (e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = true;
    moveTo(...pointAt(e));
  };

  const release = () => {
    drag.current = false;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const nextZoom = zoomForKey(e.key, zoom, minZoom, maxZoom);
    if (nextZoom !== undefined) {
      e.preventDefault();
      setZoom(nextZoom);
      return;
    }
    const step = feel.grid ? feel.grid * 3 : box.w * 0.05;
    const next = moveForKey(e.key, { x: tx.get(), y: ty.get() }, step, box.w, box.h);
    if (!next) return;
    e.preventDefault();
    moveTo(next.x, next.y);
  };

  return {
    box,
    transform: lens,
    content,
    radius: feel.wobble ? radius : undefined,
    readout,
    coords,
    zoomAt,
    size,
    view: {
      ref,
      role: "group",
      tabIndex: disabled ? -1 : 0,
      "aria-label": label,
      "aria-roledescription": "magnifier",
      "aria-keyshortcuts": "ArrowUp ArrowDown ArrowLeft ArrowRight + -",
      "aria-disabled": disabled || undefined,
      onPointerMove,
      onPointerDown,
      onPointerUp: release,
      onPointerCancel: release,
      onPointerLeave: () => {
        if (!drag.current) toRest();
      },
      onBlur: () => toRest(),
      onKeyDown,
    },
  };
}
