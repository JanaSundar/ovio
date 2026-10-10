import type { CSSProperties, ReactNode } from "react";
import { initialsOf } from "@/components/shared/initials";
import { qrPath } from "@/components/shared/qr";
import { CRAFT, RETRO, TOY } from "./tokens";

/** Takumi lays out with flexbox only, so every box says which way it runs. */
export const row = { display: "flex", alignItems: "center" } as const;
export const col = { display: "flex", flexDirection: "column" } as const;

const svg = (body: string, size: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}">${body}</svg>`,
  )}`;

// Drawn rather than typed: not every world's font has ★, ⑂ or ✦.
const ICONS = {
  star: (c: string) =>
    `<path fill="${c}" d="M8 .8l2.2 4.6 5 .7-3.6 3.5.9 5L8 12.2l-4.5 2.4.9-5L.8 6.1l5-.7z"/>`,
  // Craft's star, inked by hand: an uneven outline with round corners and a light wash inside.
  doodle: (c: string) =>
    `<path fill="${c}" fill-opacity=".18" stroke="${c}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" d="M8.1 1.5 9.9 5.9 14.7 6.4 11 9.5 12.3 14.3 8 11.7 3.8 14.4 5 9.6 1.3 6.5 6.1 5.8Z"/>`,
  sparkle: (c: string) =>
    `<path fill="${c}" d="M8 0c.6 4.3 3.7 7.4 8 8-4.3.6-7.4 3.7-8 8-.6-4.3-3.7-7.4-8-8 4.3-.6 7.4-3.7 8-8z"/>`,
  fork: (c: string) =>
    `<g fill="none" stroke="${c}" stroke-width="1.6"><circle cx="4" cy="3" r="1.8"/><circle cx="12" cy="3" r="1.8"/><circle cx="8" cy="13" r="1.8"/><path d="M4 4.8v1.4c0 1.3 1 2.3 2.3 2.3h3.4c1.3 0 2.3-1 2.3-2.3V4.8M8 8.5v2.7"/></g>`,
};

export function Icon({
  name,
  color,
  size = 13,
}: {
  name: keyof typeof ICONS;
  color: string;
  size?: number;
}) {
  return <img alt="" src={svg(ICONS[name](color), size)} width={size} height={size} />;
}

/** Room around a card for its shadow, tape and badges; the image is transparent there. */
export function Margin({
  x = 0,
  y = 0,
  children,
}: {
  x?: number;
  y?: number;
  children: ReactNode;
}) {
  return <div style={{ ...col, padding: `${y}px ${x}px` }}>{children}</div>;
}

/** "ovio", small, in the corner of every embed, styled by the world. */
export function Mark({ style }: { style: CSSProperties }) {
  return <span style={style}>ovio</span>;
}

/** One line, cut with an ellipsis: names can be 100 characters long. */
export const oneLine = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const;

/**
 * At most `lines` lines, cut with an ellipsis, and always that tall, so every card in a README
 * row is the same height whatever its description.
 */
export const clampLines = (lines: number, fontSize: number, lineHeight: number) =>
  ({
    lineClamp: lines,
    // A word longer than a line breaks rather than running past the edge.
    overflowWrap: "anywhere",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize,
    lineHeight,
    height: Math.ceil(lines * fontSize * lineHeight),
  }) as const;

/** A description's first sentence when it has a few, so a cut lands at a full stop. */
export function firstSentence(text: string) {
  const end = text.search(/[.!?](\s|$)/);
  return end >= 20 && end < text.length - 1 ? text.slice(0, end + 1) : text;
}

/** A display size that shrinks for long names, from `max` down to 60% of it. */
export const fitSize = (text: string, max: number, room: number) =>
  Math.round(max * Math.max(0.6, Math.min(1, room / text.length)));

/** The strip of tape holding a Craft card up, with the mark printed on it like a label. */
export function CraftTape({
  left,
  width,
  rotate,
  top = -12,
}: {
  left: number;
  width: number;
  rotate: number;
  top?: number;
}) {
  return (
    <div
      style={{
        ...row,
        position: "absolute",
        top,
        left,
        width,
        height: 24,
        justifyContent: "center",
        background: CRAFT.tape,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <Mark
        style={{ fontFamily: CRAFT.mono, fontSize: 10, letterSpacing: 1, color: CRAFT.muted }}
      />
    </div>
  );
}

/** A raised Toy key: a plastic face on its darker side, as ToyKey draws it at rest. */
export const toyKey = ([face, side]: readonly [string, string], depth = 6) =>
  ({
    background: face,
    borderRadius: 12,
    boxShadow: `0 ${depth}px 0 ${side}, 0 ${depth * 2}px ${depth * 2}px -${depth}px rgba(40,28,10,.35)`,
  }) as const;

export const retroText = {
  fontFamily: RETRO.font,
  color: RETRO.ink,
  textShadow: RETRO.glow,
} as const;
export const toyText = { fontFamily: TOY.font, color: TOY.ink } as const;

/** Retro's CRT lines, laid over a screen (as .ovio-scanlines in styles/ovio.css). */
export function Scanlines() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(0,0,0,.3) 0px, rgba(0,0,0,.3) 1px, transparent 1px, transparent 3px)",
      }}
    />
  );
}

/** A QR code in one colour, from the same path the QrCode component draws. */
export function Qr({ value, size, color }: { value: string; size: number; color: string }) {
  const { size: n, d } = qrPath(value, { border: 0 });
  const src = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path d="${d}" fill="${color}"/></svg>`,
  )}`;
  return <img alt="" src={src} width={size} height={size} />;
}

/** A photo, or the name's initials when there is none (as the Avatar component falls back). */
export function Face({
  src,
  name,
  style,
  initials = true,
}: {
  src?: string;
  name: string;
  style: CSSProperties;
  /** Leave the tile plain when there is no photo. */
  initials?: boolean;
}) {
  return (
    <div style={{ ...row, justifyContent: "center", overflow: "hidden", flexShrink: 0, ...style }}>
      {src ? (
        <img alt="" src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials && initialsOf(name)
      )}
    </div>
  );
}
