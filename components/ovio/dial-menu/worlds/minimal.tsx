import { ease } from "@/lib/motion";
import { Disc, type DiscLook } from "../parts";
import type { DialWorldProps } from "../dial-menu";

/** Minimal: frosted glass and a hairline; the slice glides to the aim with no overshoot. */
const look: DiscLook = {
  face: "bg-white/80 shadow-[0_0_0_1px_rgba(0,0,0,.07),0_2px_4px_rgba(0,0,0,.04),0_24px_48px_-16px_rgba(0,0,0,.28)] backdrop-blur-xl",
  slice: "fill-black/[0.055]",
  divider: "stroke-black/[0.06]",
  band: "fill-white/90 stroke-black/[0.07] [filter:drop-shadow(0_12px_18px_rgba(0,0,0,.12))]",
  bandSlice: "fill-black/[0.055]",
  icon: (on) => (on ? "text-(--ovio-ink)" : "text-(--ovio-muted)"),
  hub: "bg-(--ovio-surface) shadow-[0_0_0_1px_var(--ovio-line),0_1px_2px_rgba(0,0,0,.06)]",
  needle: "bg-(--ovio-ink)",
  title: "text-[11.5px] font-medium tracking-[-0.01em] text-(--ovio-ink)",
  shortcut: "font-(family-name:--ovio-mono) text-[10px] text-(--ovio-faint)",
  follow: { stiffness: 520, damping: 44 },
  pop: {
    initial: { opacity: 0, scale: 0.86 },
    transition: { duration: 0.18, ease: ease.minimal },
  },
};

export default function MinimalDial(props: DialWorldProps) {
  return <Disc name="minimal" world={props} look={look} />;
}
