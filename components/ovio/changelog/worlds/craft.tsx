"use client";

import { motion, type Transition } from "motion/react";
import { useState } from "react";
import { ease, motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { TYPE_LABEL, type ChangeType, type ChangelogWorldProps } from "../changelog";

const TYPE_COLOR: Record<ChangeType, string> = {
  added: "#2f9a45",
  fixed: "#3178c6",
  changed: "var(--ovio-accent-deep)",
};

/** Where each card sits in the pile, front first: a small nudge and turn, so the stack looks hand-squared. */
const PILE = [
  { x: 0, y: 0, rotate: -0.6 },
  { x: 5, y: 6, rotate: 1.6 },
  { x: -5, y: 11, rotate: -2.2 },
  { x: 2, y: 15, rotate: 2.8 },
];
/** How far the front card lifts before it is tucked under the pile, in px. */
const LIFT = 130;
/** The tuck: lift off quickly, hang for a beat while it drops behind, then settle on the craft ease. */
/** Keyframe times of the tuck: lift, hang (where it is re-stacked), settle. */
const TIMES = [0, 0.4, 0.46, 1];
const FLIP: Transition = {
  duration: motionTokens.craft.slow.duration + 0.25,
  ease: ["easeOut", "linear", [...ease.craft]],
};

/**
 * Craft: a squared-up pile of ruled index cards, one per release. Tap the pile and the front card
 * lifts off, turns, and slides in at the back; the rest shuffle forward with a paper overshoot.
 */
export function CraftChangelog({ releases, top, next, className }: ChangelogWorldProps) {
  const settle = useOvioTransition(motionTokens.craft.slow);
  const flipT = useOvioTransition(FLIP);
  // Cards are dealt in one after another on mount; flips after that move together.
  const [dealt, setDealt] = useState(false);
  // Every card re-stacks at once, at the top of the lift, so the lifted card drops behind the pile.
  // A CSS transition, since Motion sets z-index immediately.
  const restack = `${dealt && "duration" in flipT ? (flipT.duration ?? 0) * TIMES[1] : 0}s`;
  const n = releases.length;

  const flip = () => {
    setDealt(true);
    next();
  };

  return (
    <div
      data-ovio-world="craft"
      className={cn(
        "flex w-full justify-center px-4 pt-6 pb-14 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <section aria-label="Changelog" className="relative w-[420px] max-w-full pb-4">
        {/* Every card shares one grid cell, so the pile is as tall as its fullest card. */}
        <div aria-live="polite" className="grid">
          {releases.map((r, i) => {
            const d = (i - top + n) % n;
            const at = PILE[Math.min(d, PILE.length - 1)];
            const z = n - d;
            // The card that just left the front: lift it clear, then tuck it under the pile.
            const tucked = dealt && n > 1 && d === n - 1;
            return (
              <motion.article
                key={r.version}
                aria-hidden={d !== 0}
                initial={dealt ? false : { opacity: 0, y: 30, rotate: -6 }}
                animate={
                  tucked
                    ? {
                        opacity: 1,
                        x: [0, 26, 26, at.x],
                        y: [0, -LIFT, -LIFT * 0.85, at.y],
                        rotate: [PILE[0].rotate, 5, 4, at.rotate],
                        scale: [1, 1.03, 1, 1],
                      }
                    : { opacity: d < PILE.length ? 1 : 0, ...at, scale: 1 }
                }
                transition={
                  tucked
                    ? { ...flipT, times: TIMES }
                    : { ...settle, delay: dealt ? 0.08 : (n - 1 - i) * 0.08 }
                }
                style={{ zIndex: z, transitionProperty: "z-index", transitionDelay: restack }}
                className={cn(
                  "overflow-hidden rounded-[5px] bg-(--ovio-surface) px-[26px] pt-4 pb-5 [grid-area:1/1]",
                  d === 0
                    ? "shadow-[0_1px_2px_rgba(70,45,20,.14),0_14px_26px_-14px_rgba(70,45,20,.45)]"
                    : "shadow-[0_1px_2px_rgba(70,45,20,.18),0_6px_12px_-8px_rgba(70,45,20,.3)]",
                )}
              >
                <div className="flex h-8 items-baseline justify-between">
                  <span className="text-2xl leading-8 font-extrabold tracking-[-0.03em]">
                    v{r.version}
                  </span>
                  <time
                    dateTime={r.dateTime}
                    className="font-(family-name:--ovio-hand) text-[22px] leading-8 text-[#7d6650]"
                  >
                    {r.date}
                  </time>
                </div>
                {/* Ruled like an index card: a red header rule, then blue lines under each line of text. */}
                <div className="mt-2 border-t-2 border-[rgba(214,80,60,.4)] bg-[linear-gradient(transparent_31px,rgba(49,120,198,.18)_32px)] bg-size-[100%_32px] pt-1">
                  <h3 className="m-0 text-[17px] leading-8 font-bold">{r.title}</h3>
                  <ul className="m-0 list-none p-0">
                    {r.items.map((item) => (
                      <li key={item.text} className="text-sm leading-8 text-[#4a3a2a]">
                        <span aria-hidden>• </span>
                        {item.type && (
                          <span
                            className="mr-1.5 font-(family-name:--ovio-hand) text-xl"
                            style={{ color: TYPE_COLOR[item.type] }}
                          >
                            {TYPE_LABEL[item.type]}
                          </span>
                        )}
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>
        {n > 1 && (
          // The whole stack is the button; the handwritten note is its visible label.
          <button
            type="button"
            onClick={flip}
            aria-label={`Next release (${((top + 1) % n) + 1} of ${n})`}
            className="absolute inset-0 z-50 cursor-pointer rounded-[6px] border-0 bg-transparent p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-(--ovio-accent-deep)"
          >
            <span
              aria-hidden
              className="absolute -right-1.5 -bottom-[34px] -rotate-3 font-(family-name:--ovio-hand) text-[22px] text-(--ovio-accent-deep)"
            >
              tap to flip through →
            </span>
          </button>
        )}
      </section>
    </div>
  );
}
