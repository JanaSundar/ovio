import { motionTokens } from "@/lib/motion";
import { Disc, type DiscLook } from "../parts";
import type { DialWorldProps } from "../dial-menu";

/** Craft: a card wheel cut from paper. It swings open from a tilt and the slice settles softly. */
const look: DiscLook = {
  face: "border-[1.5px] border-(--ovio-ink) bg-(--ovio-surface) shadow-(--ovio-shadow)",
  slice: "fill-(--ovio-accent) stroke-(--ovio-ink) stroke-[1.5]",
  divider: "stroke-(--ovio-line) stroke-[1.5] [stroke-dasharray:3_4]",
  band: "fill-(--ovio-surface-2) stroke-(--ovio-ink) stroke-[1.5] [filter:drop-shadow(0_6px_8px_rgba(70,45,20,.18))]",
  bandSlice: "fill-(--ovio-accent)",
  icon: (on) => (on ? "text-(--ovio-on-accent)" : "text-(--ovio-ink-2)"),
  hub: "border-[1.5px] border-dashed border-(--ovio-ink-2) bg-(--ovio-surface-2)",
  needle: "bg-(--ovio-accent-deep)",
  title: "font-(family-name:--ovio-hand) text-[17px] font-bold text-(--ovio-ink)",
  shortcut: "font-(family-name:--ovio-mono) text-[10px] text-(--ovio-muted)",
  follow: { stiffness: 260, damping: 20 },
  pop: {
    initial: { opacity: 0, scale: 0.82, rotate: -14 },
    transition: motionTokens.craft.base,
  },
};

export default function CraftDial(props: DialWorldProps) {
  return <Disc name="craft" world={props} look={look} />;
}
