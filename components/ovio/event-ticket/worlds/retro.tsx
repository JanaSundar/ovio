"use client";

import { motionTokens, steps } from "@/lib/motion";
import { GooBookButton, type GooBookLook } from "../book-button";
import type { EventTicketWorldProps } from "../event-ticket";
import { Ticket, type TicketLook } from "../ticket";

const frames = motionTokens.retro.frames;

const BOOK: GooBookLook = {
  pill: "bg-(--ovio-accent)",
  knob: "bg-[#c9ffd2]",
  label: "text-[28px] leading-[1.05] text-(--ovio-on-accent) uppercase [text-shadow:none]",
  arrow: "text-(--ovio-on-accent) [text-shadow:none]",
  radius: 0,
  transition: frames(6, 0.45),
};

const LOOK: TicketLook = {
  world: "retro",
  kicker: (name) => `> TICKET.SYS / ${name.replace(/\W/g, "")}`,
  card: "border-[3px] border-double border-(--ovio-accent) bg-(--ovio-surface) uppercase shadow-[0_0_0_4px_#1c2a1d,0_0_40px_rgba(80,255,120,.15)] [text-shadow:var(--ovio-glow)]",
  stub: "bg-[#0c2411]",
  art: "",
  label: "text-[17px] leading-none tracking-[0.04em] text-(--ovio-muted)",
  headline: "text-[clamp(44px,13cqi,72px)] leading-[0.85]",
  display: "text-[28px] leading-[1.05]",
  value: "text-[21px] leading-none",
  small: "text-lg leading-tight text-(--ovio-muted)",
  name: "text-[21px]",
  rule: "border-(--ovio-muted)",
  input:
    "border-b-2 border-dashed border-(--ovio-muted) text-[22px] leading-none text-(--ovio-ink) uppercase placeholder:text-(--ovio-muted)",
  error: "text-lg leading-4 text-[#ffd34d]",
  perf: "3px dashed var(--ovio-muted)",
  stamp:
    "border-[3px] border-[#ffd34d] bg-(--ovio-surface) text-[34px] font-normal text-[#ffd34d] [text-shadow:0_0_8px_rgba(255,211,77,.6)]",
  laser: "#ffffff",
  sheen: "rgba(120,255,150,.18)",
  sheenBlend: "screen",
  flipButton:
    "border-0 bg-transparent p-0 text-[19px] leading-none text-(--ovio-ink) hover:bg-(--ovio-accent) hover:text-(--ovio-on-accent)",
  book: (sending) => <GooBookButton sending={sending} look={BOOK} />,
  motion: {
    flip: frames(8, 0.48),
    tear: frames(6, 0.42),
    settle: frames(4, 0.2),
    stamp: frames(3, 0.18),
    sweep: { duration: 2.4, ease: steps(24) },
    shake: { duration: 0.3, ease: steps(4) },
  },
};

export function RetroEventTicket(props: EventTicketWorldProps) {
  return <Ticket look={LOOK} {...props} />;
}
