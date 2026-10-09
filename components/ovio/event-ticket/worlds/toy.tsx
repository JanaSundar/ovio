"use client";

import { motionTokens } from "@/lib/motion";
import { ToyBookButton } from "../book-button";
import type { EventTicketWorldProps } from "../event-ticket";
import { Ticket, type TicketLook } from "../ticket";

const LOOK: TicketLook = {
  world: "toy",
  kicker: (name) => `${name} · Admit one`,
  card: "rounded-[22px] bg-(--ovio-surface) shadow-[inset_0_1px_0_#fff,0_8px_0_#d2ccbf,0_26px_34px_-16px_rgba(40,28,10,.5)]",
  stub: "bg-[#efeae0]",
  art: "m-3 rounded-[14px] shadow-[inset_0_3px_6px_rgba(10,20,70,.35)]",
  label:
    "font-(family-name:--ovio-mono) text-[10.5px] leading-tight font-semibold tracking-[0.08em] text-(--ovio-muted) uppercase",
  headline:
    "text-[clamp(28px,10cqi,54px)] leading-[0.95] font-extrabold tracking-[-0.035em] [font-stretch:118%]",
  display: "text-[22px] leading-[1.05] font-extrabold tracking-[-0.035em]",
  value: "text-sm font-bold",
  small: "text-xs leading-normal text-(--ovio-muted)",
  name: "text-sm font-extrabold",
  rule: "border-[rgba(30,29,26,.14)]",
  input:
    "rounded-xl bg-[#e6e1d6] px-3.5 font-(family-name:--ovio-mono) text-sm text-(--ovio-ink) shadow-[inset_0_3px_5px_rgba(40,28,10,.18)] placeholder:text-(--ovio-muted)",
  error: "text-xs font-bold text-(--ovio-red)",
  perf: "4px dotted #cfc8b8",
  stamp:
    "rounded-xl bg-(--ovio-accent) text-xl font-extrabold text-white shadow-[inset_0_2px_0_rgba(255,255,255,.25),0_5px_0_var(--ovio-accent-deep),0_12px_14px_-8px_rgba(40,28,10,.4)]",
  laser: "var(--ovio-red)",
  sheen: "rgba(255,255,255,.5)",
  sheenBlend: "soft-light",
  flipButton:
    "rounded-xl bg-(--ovio-yellow) px-4 font-(family-name:--ovio-font) text-[13px] font-extrabold tracking-normal text-(--ovio-ink) normal-case shadow-[0_4px_0_var(--ovio-yellow-deep)] transition-[translate,box-shadow] duration-100 active:translate-y-[4px] active:shadow-none",
  qrDots: true,
  book: (sending) => <ToyBookButton sending={sending} />,
  motion: {
    flip: { type: "spring", stiffness: 240, damping: 21 },
    tear: motionTokens.toy.slide,
    settle: motionTokens.toy.piece,
    stamp: motionTokens.toy.piece,
    sweep: { duration: 2.2, ease: [0.45, 0, 0.55, 1] },
    shake: { duration: 0.32 },
  },
};

export function ToyEventTicket(props: EventTicketWorldProps) {
  return <Ticket look={LOOK} {...props} />;
}
