"use client";

import { animate, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import {
  cornerPoint,
  peeledPoint,
  peelProgress,
  peelShapes,
  restPoint,
  toClipPath,
  toPoints,
  type Corner,
  type Pt,
} from "./peel";

export type { Corner };

export interface PeelToRevealProps {
  /** What the sticker covers. Inert until it is peeled away. */
  children: ReactNode;
  /** The sticker's face. A gradient with the label and hint when left out. */
  cover?: ReactNode;
  peeled?: boolean;
  defaultPeeled?: boolean;
  onPeeledChange?: (peeled: boolean) => void;
  /** Share of the diagonal a drag must pass for the sticker to come off, 0–1. */
  threshold?: number;
  corner?: Corner;
  /** How far the resting corner curls up, in px. */
  curl?: number;
  /** Names the hidden content for screen readers, and heads the default face. */
  label?: string;
  hint?: string;
  accent?: string;
  aspectRatio?: string;
  disabled?: boolean;
  className?: string;
}

const SPRING = { type: "spring", stiffness: 260, damping: 26 } as const;

export function PeelToReveal({
  children,
  cover,
  peeled: peeledProp,
  defaultPeeled = false,
  onPeeledChange,
  threshold = 0.4,
  corner = "bottom-right",
  curl = 22,
  label = "Hidden content",
  hint = "Peel from the corner",
  accent = "#9b8cff",
  aspectRatio = "3 / 2",
  disabled,
  className,
}: PeelToRevealProps) {
  const [inner, setInner] = useState(defaultPeeled);
  const peeled = peeledProp ?? inner;
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [point, setPoint] = useState<Pt | null>(null);
  const [hover, setHover] = useState(false);
  const flight = useRef<AnimationPlaybackControls | null>(null);
  const dragging = useRef(false);
  const reduced = useReducedMotion() ?? false;
  const gradientId = `peel-${useId().replace(/:/g, "")}`;

  useLayoutEffect(() => {
    const el = box.current!;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A re-cover from outside starts the sticker back at rest.
  const [seen, setSeen] = useState(peeled);
  if (seen !== peeled) {
    setSeen(peeled);
    if (!peeled) setPoint(null);
  }
  useEffect(() => () => flight.current?.stop(), []);

  const setPeeled = (next: boolean) => {
    if (peeledProp === undefined) setInner(next);
    onPeeledChange?.(next);
  };

  const w = size?.w ?? 0;
  const h = size?.h ?? 0;
  const c = cornerPoint(corner, w, h);
  const rest = restPoint(c, w, h, disabled ? 0 : hover ? curl * 1.8 : curl);
  const p = point ?? rest;

  /** Glides the corner to `to`, then runs `done`. Under reduced motion it jumps. */
  const fly = (to: Pt, done?: () => void) => {
    flight.current?.stop();
    if (reduced) {
      setPoint(to);
      done?.();
      return;
    }
    const from = p;
    flight.current = animate(0, 1, {
      ...SPRING,
      onUpdate: (t) =>
        setPoint({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }),
      onComplete: done,
    });
  };

  const complete = () => fly(peeledPoint(c, w, h), () => setPeeled(true));
  const settle = () => fly(rest, () => setPoint(null));

  const local = (e: PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    const sx = r.width / (w || 1);
    const sy = r.height / (h || 1);
    return { x: (e.clientX - r.left) / sx, y: (e.clientY - r.top) / sy };
  };

  const { cover: flat, flap } = size ? peelShapes(w, h, c, p) : { cover: [], flap: [] };
  const mid = { x: (c.x + p.x) / 2, y: (c.y + p.y) / 2 };
  const showSticker = !peeled && size;

  return (
    <div
      ref={box}
      className={cn("relative w-full select-none", className)}
      style={{ aspectRatio, "--peel-accent": accent } as CSSProperties}
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-2xl border border-white/8 bg-[#111116]"
        inert={!peeled}
        aria-hidden={!peeled}
      >
        {children}
      </div>
      {showSticker && (
        <>
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={{ clipPath: toClipPath(flat) }}
          >
            {cover ?? <DefaultFace label={label} hint={hint} />}
          </div>
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-visible"
            width={w}
            height={h}
            style={{ filter: "drop-shadow(0 10px 14px rgba(0,0,0,.45))" }}
          >
            <defs>
              <linearGradient
                id={gradientId}
                gradientUnits="userSpaceOnUse"
                x1={mid.x}
                y1={mid.y}
                x2={p.x}
                y2={p.y}
              >
                <stop offset="0" stopColor="#c9c6d6" />
                <stop offset="0.35" stopColor="#f4f2fa" />
                <stop offset="1" stopColor="#dcd9e6" />
              </linearGradient>
            </defs>
            {flap.length > 2 && <polygon points={toPoints(flap)} fill={`url(#${gradientId})`} />}
          </svg>
          <button
            type="button"
            disabled={disabled}
            aria-label={`Peel back to reveal: ${label}`}
            className={cn(
              "absolute size-16 cursor-grab touch-none rounded-2xl active:cursor-grabbing disabled:cursor-not-allowed",
              corner.startsWith("bottom") ? "bottom-0" : "top-0",
              corner.endsWith("right") ? "right-0" : "left-0",
            )}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            onPointerDown={(e) => {
              if (disabled) return;
              flight.current?.stop();
              e.currentTarget.setPointerCapture(e.pointerId);
              dragging.current = true;
              setPoint(local(e));
            }}
            onPointerMove={(e) => dragging.current && setPoint(local(e))}
            onPointerUp={(e) => {
              if (!dragging.current) return;
              dragging.current = false;
              const end = local(e);
              // A tap without a drag peels it, so the button works like one.
              const moved = Math.hypot(end.x - c.x, end.y - c.y) > 48;
              if (!moved || peelProgress(w, h, c, end) >= threshold) complete();
              else settle();
            }}
            onPointerCancel={() => {
              dragging.current = false;
              settle();
            }}
            onClick={(e) => {
              // Pointer clicks are handled above; this is Enter or Space.
              if (e.detail === 0) complete();
            }}
          />
        </>
      )}
    </div>
  );
}

function DefaultFace({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex size-full flex-col justify-between bg-[linear-gradient(135deg,var(--peel-accent),#5fd4e6)] p-5 text-[#0b0b10]">
      <span className="font-mono text-[11px] tracking-[0.16em] uppercase opacity-70">{label}</span>
      <span className="text-sm font-medium">{hint} ↘</span>
    </div>
  );
}
