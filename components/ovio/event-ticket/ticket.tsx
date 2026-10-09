"use client";

import {
  animate,
  AnimatePresence,
  motion,
  useAnimate,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type Transition,
} from "motion/react";
import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { AutoHeight } from "@/components/shared/auto-height";
import { QrCode } from "@/components/shared/qr-code";
import type { World } from "@/components/shared/world-provider";
import { useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { TicketArt } from "./art";
import { Barcode } from "./parts";
import type { EventTicketWorldProps } from "./event-ticket";

/** How a world dresses the ticket. All four share the geometry, flip, tilt and tear. */
export type TicketLook = {
  world: World;
  kicker: (name: string) => string;
  /** Surface of every piece: background, radius, border, shadow. */
  card: string;
  /** The stub's surface in the vertical layout, when it differs. */
  stub?: string;
  /** Whole-ticket rotation in degrees, for paper that sits a little askew. */
  rotate?: number;
  /** Inset and radius of the art panel. */
  art: string;
  label: string;
  headline: string;
  /** Big secondary text: "You're in", the back's title. */
  display: string;
  value: string;
  small: string;
  /** The attendee's name on the Admit line. */
  name: string;
  rule: string;
  input: string;
  error: string;
  /** CSS border shorthand for the perforation. */
  perf: string;
  stamp: string;
  laser: string;
  sheen: string;
  sheenBlend: "soft-light" | "screen";
  flipButton: string;
  qrDots?: boolean;
  book: (sending: boolean) => ReactNode;
  stubDecor?: ReactNode;
  motion: {
    flip: Transition;
    /** The stub flying off. */
    tear: Transition;
    /** The stub springing back when let go too early. */
    settle: Transition;
    stamp: Transition;
    sweep: Transition;
    shake: Transition;
  };
};

const TILT = { stiffness: 320, damping: 26 };
/** The stub easing its height as the form swaps for the pass. */
const RESIZE = { duration: 0.26, ease: [0.2, 0.7, 0.2, 1] } as const;
/** How far the stub must be pulled to tear, or flicked faster than FLICK px/s past a short pull. */
const TEAR_AT = 100;
const FLICK = 600;

export function Ticket({ look, rootRef, ...p }: EventTicketWorldProps & { look: TicketLook }) {
  const reduced = useReducedMotionSafe();
  const flipT = useOvioTransition(look.motion.flip);
  const tearT = useOvioTransition(look.motion.tear);
  const settleT = useOvioTransition(look.motion.settle);
  const stampT = useOvioTransition(look.motion.stamp);
  const horizontal = p.layout === "horizontal";
  const booked = p.status === "booked";

  const rx = useSpring(0, TILT);
  const ry = useSpring(0, TILT);
  const glow = useSpring(0, TILT);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const sheen = useMotionTemplate`radial-gradient(circle at ${mx}% ${my}%, ${look.sheen}, transparent 45%)`;

  const stub = useRef<HTMLDivElement>(null);
  const sx = useMotionValue(0);
  const sy = useMotionValue(0);
  const sr = useMotionValue(0);
  const so = useMotionValue(1);
  const shift = useMotionValue(0);
  const grow = useMotionValue(1);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [form, shake] = useAnimate<HTMLFormElement>();

  // Once torn, the stub flies off with the speed it was pulled at and the ticket slides to the middle.
  useEffect(() => {
    if (!p.torn) return;
    const size = stub.current
      ? horizontal
        ? stub.current.offsetWidth
        : stub.current.offsetHeight
      : 0;
    const off = horizontal
      ? { x: sx.get() + 200, y: 70, r: 18 }
      : { x: 40, y: sy.get() + 220, r: -14 };
    const runs = [
      animate(sx, off.x, { ...tearT, velocity: sx.getVelocity() }),
      animate(sy, off.y, { ...tearT, velocity: sy.getVelocity() }),
      animate(sr, off.r, tearT),
      animate(so, 0, tearT),
      animate(shift, size / 2 + 2, settleT),
      animate(grow, 1.03, settleT),
    ];
    return () => runs.forEach((r) => r.stop());
  }, [p.torn, horizontal, sx, sy, sr, so, shift, grow, tearT, settleT]);

  useEffect(() => {
    if (!p.errorCount || reduced || !form.current) return;
    shake(form.current, { x: [0, -6, 6, -4, 0] }, look.motion.shake);
  }, [p.errorCount, reduced, form, shake, look.motion.shake]);

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse" || drag.current?.moved) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    rx.set((0.5 - ny) * 8);
    ry.set((nx - 0.5) * 10);
    mx.set(nx * 100);
    my.set(ny * 100);
    glow.set(1);
  };
  const untilt = () => {
    rx.set(0);
    ry.set(0);
    glow.set(0);
  };

  const canTear = !p.torn && !p.flipped;
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (!canTear || e.button !== 0) return;
    // Fields and buttons keep their own pointer; the rest of the stub is the handle.
    if ((e.target as HTMLElement).closest("input, button")) return;
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const raw = horizontal ? e.clientX - d.x : e.clientY - d.y;
    if (!d.moved) {
      if (Math.abs(raw) < 4) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      untilt();
    }
    // The perforation holds for the first few px, then gives.
    const pull = Math.max(0, raw);
    const at = pull < 30 ? pull * 0.4 : 12 + (pull - 30);
    (horizontal ? sx : sy).set(at);
    sr.set(horizontal ? at * 0.05 : -at * 0.03);
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    const axis = horizontal ? sx : sy;
    const at = axis.get();
    if (at > TEAR_AT || (at > 20 && axis.getVelocity() > FLICK)) p.tear();
    else [sx, sy, sr].forEach((m) => animate(m, 0, settleT));
  };

  const name = p.attendee?.name ?? p.draft.name.trim();
  const first = name.split(/\s+/)[0] || "friend";
  const facts = (
    horizontal
      ? [
          ["What", p.event.tier],
          ["Where", p.event.venue],
          ["Price", p.event.price],
        ]
      : [
          ["What", p.event.tier],
          ["When", p.shortDate],
          ["Price", p.event.price],
        ]
  ).filter((f): f is [string, string] => !!f[1]);

  // Labelled and at least 44px tall, so the QR code is easy to find for anyone at the door.
  const flipButton = (
    <button
      type="button"
      onClick={p.flip}
      className={cn(
        "inline-flex min-h-11 flex-none cursor-pointer items-center gap-2 whitespace-nowrap",
        look.flipButton,
      )}
    >
      {p.flipped ? (
        <span aria-hidden>←</span>
      ) : (
        <svg aria-hidden viewBox="0 0 16 16" className="size-4 flex-none" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M1 1h6v6H1zm2 2v2h2V3zm6-2h6v6H9zm2 2v2h2V3zM1 9h6v6H1zm2 2v2h2v-2zm6-2h2v2H9zm4 0h2v2h-2zm-2 2h2v2h-2zm-2 2h2v2H9zm4 0h2v2h-2z"
          />
        </svg>
      )}
      {p.flipped ? "Back to ticket" : "Show QR code"}
    </button>
  );

  const sheenLayer = (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ background: sheen, opacity: glow, mixBlendMode: look.sheenBlend }}
    />
  );

  const stamp = (
    <AnimatePresence>
      {p.torn && (
        <div
          className={cn(
            "absolute right-[7%]",
            horizontal ? "top-[38%]" : "top-[clamp(130px,46cqi,190px)]",
          )}
        >
          <motion.div
            initial={{ opacity: 0, scale: reduced ? 1 : 1.8, rotate: -14 }}
            animate={{ opacity: 1, scale: 1, rotate: -14 }}
            transition={stampT}
          >
            <motion.div
              role="status"
              className={cn(
                "px-4 py-2 text-[clamp(18px,6cqi,26px)] leading-none font-bold tracking-[0.08em] uppercase",
                "pointer-events-none",
                look.stamp,
              )}
            >
              Admitted
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const admit = (
    <div className="flex min-w-0 items-baseline gap-2.5">
      <span className={look.label}>Admit</span>
      <span className={cn("min-w-0 truncate", look.name, !name && "opacity-45")}>
        {name || "Your name"}
      </span>
    </div>
  );

  const main = horizontal ? (
    <div
      className={cn(
        "@container relative flex min-h-[340px] min-w-0 flex-1 overflow-hidden",
        look.card,
      )}
    >
      <div
        className={cn("relative w-[clamp(72px,22cqi,156px)] flex-none overflow-hidden", look.art)}
      >
        <TicketArt world={look.world} seed={p.seed} shape="tall" />
        <span className="absolute bottom-3 left-3 rotate-180 rounded-sm bg-(--ovio-surface) px-[3px] py-1.5 font-(family-name:--ovio-mono) text-[11px] leading-none tracking-[0.14em] text-(--ovio-muted) [writing-mode:vertical-rl]">
          {p.ticketId}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[clamp(12px,3.5cqi,20px)] py-[clamp(18px,5cqi,30px)] pr-[clamp(16px,5cqi,32px)] pl-[clamp(16px,4.5cqi,30px)]">
        <div className={cn("flex items-center justify-between gap-3", look.label)}>
          <span className="truncate">{look.kicker(p.event.name)}</span>
          {flipButton}
        </div>
        <h2 className={cn("m-0 text-balance", look.headline)}>{p.event.title ?? p.event.name}</h2>
        {facts.length > 0 && (
          <dl className={cn("m-0 grid auto-cols-fr grid-flow-col border-y", look.rule)}>
            {facts.map(([k, v], i) => (
              <div
                key={k}
                className={cn(
                  "min-w-0 px-3 py-2.5",
                  i === 0 && "pl-0",
                  i < facts.length - 1 && "border-r",
                  i === facts.length - 1 && "pr-0 text-right",
                  look.rule,
                )}
              >
                <dt className={cn("mb-1.5", look.label)}>{k}</dt>
                <dd className={cn("m-0", look.value)}>{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {p.event.description && (
          <p className={cn("m-0 max-w-[44ch]", look.small)}>{p.event.description}</p>
        )}
        <div className="mt-auto">{admit}</div>
      </div>
      {stamp}
      {sheenLayer}
    </div>
  ) : (
    <div className={cn("@container relative overflow-hidden", look.card)}>
      <div className={cn("relative h-[clamp(130px,46cqi,190px)] overflow-hidden", look.art)}>
        <TicketArt world={look.world} seed={p.seed} shape="wide" />
        <div className="absolute top-3 right-3">{flipButton}</div>
      </div>
      <div className="flex flex-col gap-5 px-6 pt-5 pb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
          <h2 className={cn("m-0 min-w-0 break-words", look.headline)}>{p.event.name}</h2>
          {p.event.venue && <span className={look.label}>{p.event.venue}</span>}
        </div>
        {facts.length > 0 && (
          <dl className="m-0 grid auto-cols-fr grid-flow-col gap-3">
            {facts.map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className={cn("mb-1", look.label)}>{k}</dt>
                <dd className={cn("m-0", look.value)}>{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {admit}
      </div>
      {stamp}
      {sheenLayer}
    </div>
  );

  const stubBody = (
    <AutoHeight bleed={24} transition={RESIZE}>
      <AnimatePresence mode="wait" initial={false}>
        {booked ? (
          <motion.div
            key="pass"
            className="flex flex-col gap-3.5"
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={settleT}
          >
            <div role="status" className={look.display}>
              You&rsquo;re in,
              <br />
              {first}.
            </div>
            <div className={cn("break-words", look.small)}>
              Confirmation sent to {p.attendee?.email}
            </div>
            <Barcode value={p.ticketId} laser={look.laser} sweep={look.motion.sweep} />
            <button
              type="button"
              onClick={p.tear}
              className={cn(
                "cursor-grab self-start border-0 bg-transparent p-0 text-left uppercase",
                look.label,
              )}
            >
              Drag stub {horizontal ? "→" : "↓"} to check in
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={form}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              p.book();
            }}
            className="flex flex-col gap-2.5"
            exit={{ opacity: 0, y: reduced ? 0 : -6 }}
            transition={settleT}
          >
            <input
              value={p.draft.name}
              onChange={(e) => p.setDraft("name", e.target.value)}
              placeholder="Full name"
              aria-label="Full name"
              autoComplete="name"
              disabled={p.status === "sending"}
              className={cn(
                "w-full min-w-0 border-0 bg-transparent px-0.5 py-3 outline-none",
                look.input,
              )}
            />
            <input
              value={p.draft.email}
              onChange={(e) => p.setDraft("email", e.target.value)}
              placeholder="Email"
              aria-label="Email"
              type="email"
              autoComplete="email"
              disabled={p.status === "sending"}
              className={cn(
                "w-full min-w-0 border-0 bg-transparent px-0.5 py-3 outline-none",
                look.input,
              )}
            />
            <div role="alert" className={cn("min-h-4", look.error)}>
              {p.error}
            </div>
            {look.book(p.status === "sending")}
          </motion.form>
        )}
      </AnimatePresence>
    </AutoHeight>
  );

  const stubPiece = (
    <motion.div
      ref={stub}
      inert={p.torn}
      aria-hidden={p.torn}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className={cn(
        "relative flex flex-col gap-4",
        horizontal ? "w-[clamp(232px,30%,272px)] flex-none p-5" : "px-6 pt-5 pb-5",
        look.card,
        !horizontal && look.stub,
        canTear && "cursor-grab touch-none select-none active:cursor-grabbing",
      )}
      style={{
        x: sx,
        y: sy,
        rotate: sr,
        opacity: so,
        transformOrigin: horizontal ? "0% 100%" : "0% 0%",
      }}
    >
      <div className={cn("flex justify-between gap-3", look.label)}>
        <span className="truncate"># {p.ticketId}</span>
        <span className="flex-none">{p.shortDate}</span>
      </div>
      {stubBody}
      {look.stubDecor}
    </motion.div>
  );

  const back = horizontal ? (
    <div className="@container flex h-full gap-[clamp(18px,4cqi,28px)] p-[clamp(20px,4cqi,30px)]">
      <div className="flex flex-none flex-col items-start gap-3">
        <QrCode value={p.ticketId} dots={look.qrDots} className="w-[clamp(140px,25cqi,200px)]" />
        <span className={look.label}>Show at the door</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className={cn("min-w-0", look.display)}>{name || p.event.name}</span>
          {flipButton}
        </div>
        {p.event.schedule?.map((s) => (
          <div
            key={s.time + s.title}
            className={cn("grid grid-cols-[64px_1fr] gap-3 border-t py-2.5", look.rule, look.value)}
          >
            <span className="font-(family-name:--ovio-mono) opacity-60">{s.time}</span>
            <span className="min-w-0">{s.title}</span>
          </div>
        ))}
        <div className={cn("mt-auto pt-3", look.small)}>
          Non-transferable · {p.date} · {p.ticketId}
        </div>
      </div>
    </div>
  ) : (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <QrCode value={p.ticketId} dots={look.qrDots} className="w-[min(220px,75%)]" />
      <div className={look.display}>{name || p.event.name}</div>
      <div className={look.label}>Show at the door · {p.ticketId}</div>
      {flipButton}
    </div>
  );

  return (
    <div
      ref={rootRef}
      data-ovio-world={look.world}
      className={cn(
        "flex w-full justify-center font-(family-name:--ovio-font) text-(--ovio-ink)",
        p.className,
      )}
    >
      <div
        onPointerMove={tilt}
        onPointerLeave={untilt}
        className={cn(
          "w-full perspective-[1600px]",
          horizontal ? "max-w-[880px]" : "max-w-[360px]",
        )}
        style={{ rotate: look.rotate ? `${look.rotate}deg` : undefined }}
      >
        <motion.div className="transform-3d" style={{ rotateX: rx, rotateY: ry }}>
          <motion.div
            className="relative transform-3d"
            initial={false}
            animate={{ rotateY: p.flipped ? 180 : 0 }}
            transition={flipT}
          >
            <motion.div
              key={p.layout}
              inert={p.flipped}
              initial={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={settleT}
              className="backface-hidden"
            >
              <motion.div
                className={cn("flex", horizontal ? "items-stretch gap-1" : "flex-col gap-1")}
                style={horizontal ? { x: shift, scale: grow } : { y: shift, scale: grow }}
              >
                {main}
                <div
                  aria-hidden
                  className={horizontal ? "my-3.5 w-0" : "mx-4 h-0"}
                  style={{
                    ...(horizontal ? { borderLeft: look.perf } : { borderTop: look.perf }),
                    opacity: p.torn ? 0 : 1,
                  }}
                />
                {stubPiece}
              </motion.div>
            </motion.div>
            <div
              inert={!p.flipped}
              className={cn(
                "absolute inset-0 overflow-hidden backface-hidden rotate-y-180",
                look.card,
              )}
            >
              {back}
              {sheenLayer}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
