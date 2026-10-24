import { motionTokens } from "@/lib/motion";
import { Disc, type DiscLook } from "../parts";
import type { DialWorldProps } from "../dial-menu";

/** Toy: a molded plastic wheel with a big red button. It pops open on a spring and wobbles in. */
const look: DiscLook = {
  face: "bg-(--ovio-surface) shadow-[inset_0_3px_0_#fff,0_8px_0_var(--ovio-line),0_26px_30px_-12px_rgba(40,28,10,.45)]",
  slice: "fill-(--ovio-accent) stroke-(--ovio-accent) stroke-[6]",
  band: "fill-(--ovio-yellow) stroke-(--ovio-yellow) stroke-[8] [filter:drop-shadow(0_5px_0_var(--ovio-yellow-deep))]",
  bandSlice: "fill-(--ovio-accent) stroke-(--ovio-accent) stroke-[4]",
  icon: (on) => (on ? "text-white" : "text-(--ovio-ink-2)"),
  hub: "bg-(--ovio-red) shadow-[inset_0_3px_0_rgba(255,255,255,.28),0_5px_0_var(--ovio-red-deep)]",
  needle: "bg-(--ovio-yellow)",
  title: "text-[11px] font-black tracking-[0.05em] text-white uppercase",
  shortcut: "font-(family-name:--ovio-mono) text-[10px] font-semibold text-white/75",
  follow: { stiffness: motionTokens.toy.slide.stiffness, damping: motionTokens.toy.slide.damping },
  pop: {
    initial: { opacity: 0, scale: 0.3, rotate: -40 },
    transition: motionTokens.toy.piece,
  },
};

export default function ToyDial(props: DialWorldProps) {
  return <Disc name="toy" world={props} look={look} />;
}
