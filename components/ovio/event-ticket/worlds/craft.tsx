"use client";

import { motionTokens } from "@/lib/motion";
import { GooBookButton, type GooBookLook } from "../book-button";
import type { EventTicketWorldProps } from "../event-ticket";
import { Ticket, type TicketLook } from "../ticket";

const BOOK: GooBookLook = {
  pill: "bg-(--ovio-accent)",
  knob: "bg-(--ovio-ink)",
  label: "text-[23px] leading-[1.05] font-extrabold tracking-[-0.04em] text-(--ovio-on-accent)",
  arrow: "text-[#ffd9b8]",
  radius: 14,
  transition: { duration: 0.32, ease: [0.34, 1.3, 0.5, 1] },
};

const LOOK: TicketLook = {
  world: "craft",
  kicker: () => "Admit one!",
  card: "rounded-(--ovio-radius) bg-(--ovio-surface) shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_2px_4px_rgba(70,45,20,.12),0_22px_40px_-14px_rgba(70,45,20,.4)]",
  stub: "bg-(--ovio-surface-2)",
  rotate: -1,
  art: "m-2.5 rounded-md",
  label:
    "font-(family-name:--ovio-mono) text-[10.5px] leading-tight tracking-[0.06em] text-(--ovio-muted) uppercase",
  headline: "text-[clamp(34px,10cqi,56px)] leading-[0.95] font-extrabold tracking-[-0.045em]",
  display: "font-(family-name:--ovio-hand) text-[32px] leading-[0.95] text-(--ovio-accent-deep)",
  value: "text-[15px] font-semibold",
  small: "text-[12.5px] leading-normal text-(--ovio-ink-2)",
  name: "font-(family-name:--ovio-hand) text-[28px] leading-none text-(--ovio-accent-deep)",
  rule: "border-[rgba(42,31,20,.16)]",
  input:
    "border-b-2 border-[rgba(42,31,20,.2)] font-(family-name:--ovio-mono) text-sm text-(--ovio-ink) placeholder:text-(--ovio-muted)",
  error: "font-(family-name:--ovio-hand) text-lg leading-4 text-(--ovio-accent-deep)",
  perf: "2px dashed rgba(42,31,20,.28)",
  stamp:
    "rounded-md border-[3px] border-double border-(--ovio-accent-deep) text-(--ovio-accent-deep) opacity-85 mix-blend-multiply",
  laser: "var(--ovio-accent)",
  sheen: "rgba(255,255,255,.45)",
  sheenBlend: "soft-light",
  flipButton:
    "-rotate-2 rounded-sm bg-(--ovio-tape) px-2.5 py-1 font-(family-name:--ovio-hand) text-lg leading-none tracking-normal text-(--ovio-ink) normal-case shadow-[0_1px_2px_rgba(70,45,20,.15)]",
  book: (sending) => <GooBookButton sending={sending} look={BOOK} />,
  stubDecor: (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-3 right-10 h-6 w-20 rotate-6 bg-(--ovio-tape)"
    />
  ),
  motion: {
    flip: motionTokens.craft.slow,
    tear: { duration: 0.45, ease: [0.4, 0, 0.6, 1] },
    settle: motionTokens.craft.base,
    stamp: motionTokens.craft.base,
    sweep: { duration: 2.8, ease: [0.45, 0, 0.55, 1] },
    shake: { duration: 0.35 },
  },
};

export function CraftEventTicket(props: EventTicketWorldProps) {
  return <Ticket look={LOOK} {...props} />;
}
