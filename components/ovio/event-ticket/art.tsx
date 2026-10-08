"use client";

import { memo, useId, type ReactNode } from "react";
import type { World } from "@/components/shared/world-provider";
import { random } from "./seed";

/** Art is drawn in a fixed box per layout and sliced to fill its panel, cropping the far side or the ends. */
const BOX = { tall: [156, 400], wide: [400, 220] } as const;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const TOY_COLORS = ["var(--ovio-red)", "var(--ovio-yellow)", "#f8f5ef", "#33b07a", "#1e1d1a"];
const CRAFT_COLORS = ["#e0713a", "#2a1f14", "#f2c9a0", "#3178c6", "#ee9f63", "#b8471f", "#ffe27a"];

type Draw = (W: number, H: number, r: () => number, id: string) => ReactNode;

/** Minimal: a lime halftone whose wave pattern comes from the seed. */
const minimal: Draw = (W, H, r) => {
  const step = 13;
  const [f1, f2, p1, p2] = [0.02 + r() * 0.05, 0.02 + r() * 0.05, r() * 6, r() * 6];
  const [cx, cy] = [r() * W, r() * H];
  const dots: ReactNode[] = [];
  for (let y = step / 2; y < H; y += step)
    for (let x = step / 2; x < W; x += step) {
      const d = Math.hypot(x - cx, y - cy);
      const rad =
        (0.5 + 0.5 * Math.sin(d * f1 + p1) * Math.cos(x * f2 + p2 + y * 0.01)) * step * 0.5;
      if (rad > 0.6) dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={rad.toFixed(2)} />);
    }
  return (
    <>
      <rect width={W} height={H} fill="#c6f432" />
      <g fill="#111">{dots}</g>
    </>
  );
};

/** Retro: ordered (Bayer) dither of a seeded wave, brighter towards the bottom. */
const retro: Draw = (W, H, r) => {
  const px = 5;
  const [a, b, k] = [r() * 6, 0.02 + r() * 0.04, 0.03 + r() * 0.04];
  let lit = "";
  let hot = "";
  for (let y = 0; y < H; y += px)
    for (let x = 0; x < W; x += px) {
      const n =
        0.5 +
        0.35 * Math.sin(x * b + a) * Math.cos(y * k) +
        0.3 * Math.sin((x + y) * 0.03 + a * 2) -
        (1 - y / H) * 0.35;
      const threshold = (BAYER[((y / px) % 4) * 4 + ((x / px) % 4)] + 0.5) / 16;
      if (n > threshold) {
        const cell = `M${x} ${y}h${px - 1}v${px - 1}h-${px - 1}z`;
        if (n > 0.85) hot += cell;
        else lit += cell;
      }
    }
  return (
    <>
      <rect width={W} height={H} fill="#061108" />
      <path d={lit} fill="var(--ovio-accent)" />
      <path d={hot} fill="#c9ffd2" />
    </>
  );
};

/** Toy: a tray of moulded plastic pieces on a blue base. */
const toy: Draw = (W, H, r) => {
  // Whole columns across, so no piece sticks out past the sides.
  const cs = W / Math.round(W / 78);
  const s = cs * 0.76;
  const pieces: ReactNode[] = [];
  for (let y = 0; y < H; y += cs)
    for (let x = 0; x < W; x += cs) {
      const kind = Math.floor(r() * 4);
      const fill = TOY_COLORS[Math.floor(r() * TOY_COLORS.length)];
      const turn = Math.floor(r() * 4) * 90;
      const shape =
        kind === 0 ? (
          <circle r={s / 2} />
        ) : kind === 1 ? (
          <path d={`M${-s / 2} ${s / 4}a${s / 2} ${s / 2} 0 0 1 ${s} 0z`} />
        ) : kind === 2 ? (
          <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.18} />
        ) : (
          <path d={`M${-s / 2} ${s / 2}v${-s}a${s} ${s} 0 0 1 ${s} ${s}z`} />
        );
      pieces.push(
        <g key={`${x}-${y}`} transform={`translate(${x + cs / 2} ${y + cs / 2}) rotate(${turn})`}>
          <g fill="rgba(10,20,70,.35)" transform="translate(0 4)">
            {shape}
          </g>
          <g fill={fill}>{shape}</g>
        </g>,
      );
    }
  return (
    <>
      <rect width={W} height={H} fill="var(--ovio-accent)" />
      {pieces}
    </>
  );
};

/** Craft: paper cut-outs scattered on card, each with a soft shadow. */
const craft: Draw = (W, H, r, id) => {
  const shapes: ReactNode[] = [];
  for (let i = 0; i < 11; i++) {
    const s = 18 + r() * Math.min(W, H) * 0.35;
    const [x, y] = [s * 0.6 + r() * (W - s * 1.2), r() * H];
    const kind = Math.floor(r() * 3);
    const turn = (r() - 0.5) * 92;
    const fill = CRAFT_COLORS[Math.floor(r() * CRAFT_COLORS.length)];
    shapes.push(
      <g key={i} transform={`translate(${x} ${y}) rotate(${turn.toFixed(1)})`} fill={fill}>
        {kind === 0 ? (
          <circle r={s / 2} />
        ) : kind === 1 ? (
          <path d={`M${-s / 2} 0a${s / 2} ${s / 2} 0 0 0 ${s} 0z`} />
        ) : (
          <rect x={-s / 2} y={-s / 5} width={s} height={s / 2.5} />
        )}
      </g>,
    );
  }
  return (
    <>
      <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#46301a" floodOpacity=".3" />
      </filter>
      <rect width={W} height={H} fill="var(--ovio-surface-2)" />
      <g filter={`url(#${id})`}>{shapes}</g>
    </>
  );
};

const DRAW: Record<World, Draw> = { minimal, craft, retro, toy };

/** The ticket's generative art for a world, seeded so each attendee gets their own. */
export const TicketArt = memo(function TicketArt({
  world,
  seed,
  shape,
}: {
  world: World;
  seed: number;
  shape: keyof typeof BOX;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [W, H] = BOX[shape];
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={shape === "tall" ? "xMinYMid slice" : "xMidYMid slice"}
      className="absolute inset-0 size-full"
    >
      {DRAW[world](W, H, random(seed), id)}
    </svg>
  );
});
