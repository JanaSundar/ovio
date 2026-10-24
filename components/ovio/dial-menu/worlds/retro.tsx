import { steps } from "@/lib/motion";
import { Disc, type DiscLook } from "../parts";
import type { DialWorldProps } from "../dial-menu";

/** Retro: a phosphor dial. The slice jumps item to item and the menu draws in four frames. */
const look: DiscLook = {
  face: "border-2 border-(--ovio-line) bg-(--ovio-stage) shadow-[0_0_0_4px_var(--ovio-surface),0_0_28px_rgba(80,255,120,.22)]",
  slice: "fill-(--ovio-accent)",
  divider: "stroke-(--ovio-faint) stroke-2",
  band: "fill-(--ovio-stage) stroke-(--ovio-line) stroke-2",
  bandSlice: "fill-(--ovio-accent)",
  icon: (on) =>
    on ? "text-(--ovio-on-accent)" : "text-(--ovio-ink) drop-shadow-[0_0_4px_rgba(80,255,120,.5)]",
  hub: "border-2 border-(--ovio-line) bg-(--ovio-surface)",
  needle: "rounded-none bg-(--ovio-ink) shadow-(--ovio-glow)",
  title: "text-[15px] leading-[0.95] text-(--ovio-ink) uppercase text-shadow-(--ovio-glow)",
  shortcut: "text-[13px] leading-none text-(--ovio-ink-2)",
  follow: "step",
  pop: {
    initial: { opacity: 0, scale: 0.4 },
    transition: { duration: 0.16, ease: steps(4) },
  },
  children: <div className="ovio-scanlines" />,
};

export default function RetroDial(props: DialWorldProps) {
  return <Disc name="retro" world={props} look={look} />;
}
