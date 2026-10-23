"use client";

import { animate, useMotionValue, useTransform, type Transition } from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useReducedMotionSafe } from "@/lib/motion";
import type { ScratchWorldProps } from "./scratch-to-reveal";
import {
  cellBox,
  cellsUnder,
  clearedShare,
  gridFor,
  isRevealKey,
  percentOf,
  pointIn,
  type Grid,
  type Point,
} from "./scratch";

/** Paints a world's coating over a w×h pad, in CSS px. */
export type PaintCoating = (g: CanvasRenderingContext2D, w: number, h: number) => void;

export type ScratchFeel = {
  paint: PaintCoating;
  /** Brush radius in px. */
  brush: number;
  /** Cell size in px for measuring what's scratched; Retro clears whole cells of it. */
  cell: number;
  /** Retro: a stroke clears whole cells instead of a round line. */
  blocky?: boolean;
  /** Craft: the stroke's edge chips, like foil under a coin. */
  rough?: boolean;
  /** How the readout runs to 100% once the coating goes. */
  finish: Transition;
};

type Coating = { grid: Grid; cleared: Uint8Array; count: number; w: number; h: number };

/**
 * A world's scratch pad: a canvas coating the pointer (or a finger) scratches away, with what's
 * scratched measured on a grid of cells. Past the threshold the rest clears by itself; Enter or
 * Space reveals it all at once. Setting `revealed` back to false paints a fresh coating.
 *
 * Returns the share scratched as a motion value, whether it was revealed while on screen (so a
 * world can celebrate, but not when it starts revealed), and the props for the pad and canvas.
 */
export function useScratchWorld(world: ScratchWorldProps, feel: ScratchFeel) {
  const { revealed, setRevealed, threshold, onProgress, disabled, label, hint } = world;
  const reduced = useReducedMotionSafe();
  const pad = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const coating = useRef<Coating | null>(null);
  const last = useRef<Point | null>(null);
  const done = useRef(revealed);
  const progress = useMotionValue(revealed ? 1 : 0);
  const percent = useTransform(() => percentOf(progress.get()));
  const [painted, setPainted] = useState(false);
  const [touched, setTouched] = useState(false);
  const [popped, setPopped] = useState(false);

  // Paint before the browser draws, so a fresh coating never shows the last one's scratches.
  useLayoutEffect(() => {
    done.current = revealed;
    if (revealed) return;
    const el = pad.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    coating.current = null;
    progress.set(0);
    setTouched(false);
    setPopped(false);

    // Repaints at the pad's size, then scratches the cleared cells away again.
    const draw = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const g = cv.getContext("2d");
      if (!w || !h || !g) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      feel.paint(g, w, h);
      const c = coating.current;
      if (c) {
        c.w = w;
        c.h = h;
        c.cleared.forEach((on, i) => {
          if (!on) return;
          const box = cellBox(i, c.grid, w, h);
          g.clearRect(box.x, box.y, box.w, box.h);
        });
      } else {
        const grid = gridFor(w, h, feel.cell);
        coating.current = { grid, cleared: new Uint8Array(grid.cols * grid.rows), count: 0, w, h };
      }
      setPainted(true);
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed, feel, progress]);

  // However it was revealed, the readout runs to 100%.
  useEffect(() => {
    if (!revealed) return;
    const run = animate(progress, 1, reduced ? { duration: 0 } : feel.finish);
    return () => run.stop();
  }, [revealed, reduced, feel.finish, progress]);

  const reveal = () => {
    if (done.current) return;
    done.current = true;
    last.current = null;
    setPopped(true);
    setRevealed(true);
  };

  const scratch = (a: Point, b: Point) => {
    const c = coating.current;
    const g = canvas.current?.getContext("2d");
    if (!c || !g) return;
    const cells = cellsUnder(a, b, feel.brush, c.grid, c.w, c.h);
    if (feel.blocky) {
      for (const i of cells) {
        const box = cellBox(i, c.grid, c.w, c.h);
        g.clearRect(box.x, box.y, box.w, box.h);
      }
    } else {
      g.save();
      g.globalCompositeOperation = "destination-out";
      g.lineCap = "round";
      g.lineJoin = "round";
      g.lineWidth = feel.brush * 2;
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
      g.beginPath();
      g.arc(b.x, b.y, feel.brush, 0, Math.PI * 2);
      if (feel.rough)
        for (let k = 0; k < 4; k++) {
          const angle = Math.random() * Math.PI * 2;
          const reach = feel.brush * (0.9 + Math.random() * 0.3);
          const x = b.x + Math.cos(angle) * reach;
          const y = b.y + Math.sin(angle) * reach;
          g.moveTo(x, y);
          g.arc(x, y, 1 + Math.random() * 2.5, 0, Math.PI * 2);
        }
      g.fill();
      g.restore();
    }
    for (const i of cells)
      if (!c.cleared[i]) {
        c.cleared[i] = 1;
        c.count++;
      }
    const share = clearedShare(c.count, c.grid);
    progress.set(share);
    onProgress?.(share);
    if (share >= threshold) reveal();
  };

  const at = (e: PointerEvent<HTMLDivElement>): Point => {
    const c = coating.current;
    const rect = e.currentTarget.getBoundingClientRect();
    return pointIn(e.clientX, e.clientY, rect, c?.w ?? rect.width, c?.h ?? rect.height);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (done.current || disabled || !e.isPrimary || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setTouched(true);
    const p = at(e);
    last.current = p;
    scratch(p, p);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const from = last.current;
    if (!from || done.current) return;
    const p = at(e);
    last.current = p;
    scratch(from, p);
  };

  const release = () => {
    last.current = null;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (done.current || disabled || !isRevealKey(e.key)) return;
    e.preventDefault();
    reveal();
  };

  return {
    progress,
    percent,
    /** The canvas holds its coating; until then the worlds colour it in. */
    painted,
    /** No scratch yet: the worlds show the hint. */
    hinting: !touched && !revealed,
    /** Revealed while on screen, so the worlds celebrate. */
    popped: revealed && popped,
    coat: { ref: canvas },
    // Still focusable once revealed (tabIndex -1), so a keyboard reveal keeps focus on the pad.
    pad: {
      ref: pad,
      role: revealed ? "group" : "button",
      tabIndex: revealed ? -1 : disabled ? undefined : 0,
      "aria-label": revealed ? label : `${hint}: ${label}`,
      "aria-disabled": (!revealed && disabled) || undefined,
      onPointerDown,
      onPointerMove,
      onPointerUp: release,
      onPointerCancel: release,
      onKeyDown,
    },
  };
}
