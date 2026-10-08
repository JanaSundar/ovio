"use client";

import { motionTokens } from "@/lib/motion";
import { GooBookButton, type GooBookLook } from "../book-button";
import type { EventTicketWorldProps } from "../event-ticket";
import { Ticket, type TicketLook } from "../ticket";

const BOOK: GooBookLook = {
  pill: "bg-[#c6f432]",
  knob: "bg-(--ovio-ink)",
  label: "text-[22px] leading-[1.05] font-medium tracking-[-0.03em] text-(--ovio-ink)",
  arrow: "text-[#c6f432]",
  radius: 16,
  transition: { duration: 0.3, ease: [0.5, 0, 0.2, 1] },
};

const LOOK: TicketLook = {
  world: "minimal",
  kicker: (name) => `${name} · Conference`,
  card: "rounded-2xl bg-(--ovio-surface) shadow-[0_1px_2px_rgba(0,0,0,.05),0_24px_48px_-24px_rgba(0,0,0,.25)]",
  art: "m-2.5 rounded-[10px]",
  label:
    "font-(family-name:--ovio-mono) text-[10.5px] leading-tight tracking-[0.08em] text-(--ovio-muted) uppercase",
  headline: "text-[clamp(34px,10cqi,58px)] leading-[0.95] font-medium tracking-[-0.045em]",
  display: "text-[22px] leading-[1.05] font-medium tracking-[-0.03em]",
  value: "text-sm font-medium",
  small: "text-xs leading-normal text-(--ovio-muted)",
  name: "text-sm font-semibold",
  rule: "border-[rgba(17,17,17,.16)]",
  input:
    "border-b border-[rgba(17,17,17,.4)] font-(family-name:--ovio-mono) text-sm text-(--ovio-ink) placeholder:text-(--ovio-muted)",
  error: "text-xs text-[#e5484d]",
  perf: "3px dotted #c4c4c0",
  stamp: "rounded-md border-[3px] border-[#e5484d] text-[#e5484d] opacity-90",
  laser: "#ff3b30",
  sheen: "rgba(255,255,255,.55)",
  sheenBlend: "soft-light",
  flipButton:
    "rounded-full border border-(--ovio-line) bg-(--ovio-surface) px-2.5 py-1 font-(family-name:--ovio-mono) text-[10.5px] tracking-[0.06em] text-(--ovio-ink) transition-colors hover:bg-(--ovio-line-2)",
  book: (sending) => <GooBookButton sending={sending} look={BOOK} />,
  motion: {
    flip: { duration: 0.45, ease: [0.3, 1.25, 0.5, 1] },
    tear: { duration: 0.4, ease: [0.4, 0, 0.6, 1] },
    settle: motionTokens.minimal.slow,
    stamp: { duration: 0.35, ease: [0.3, 1.6, 0.5, 1] },
    sweep: { duration: 2.4, ease: [0.45, 0, 0.55, 1] },
    shake: { duration: 0.3 },
  },
};

export function MinimalEventTicket(props: EventTicketWorldProps) {
  return <Ticket look={LOOK} {...props} />;
}
