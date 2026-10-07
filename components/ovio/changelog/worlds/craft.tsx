"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { TYPE_LABEL, type ChangeType, type ChangelogWorldProps } from "../changelog";

/** Coloured index tabs along the top edge of each card, in turn. */
const TABS = ["#e0713a", "#3178c6", "#2f9a45", "#ffe27a"];
const TYPE_COLOR: Record<ChangeType, string> = {
  added: "#2f9a45",
  fixed: "#3178c6",
  changed: "var(--ovio-accent-deep)",
};

/**
 * Craft: a fanned stack of ruled index cards, one per release. Tap the stack (or the note)
 * and the top card goes to the back; every card settles into its new place with a paper overshoot.
 */
export function CraftChangelog({ releases, top, next, className }: ChangelogWorldProps) {
  const settle = useOvioTransition(motionTokens.craft.slow);
  // Cards are dealt in one after another on mount; flips after that move together.
  const [dealt, setDealt] = useState(false);
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
      <section aria-label="Changelog" className="relative h-[300px] w-[420px] max-w-full">
        <div aria-live="polite" className="absolute inset-0">
          {releases.map((r, i) => {
            const d = (i - top + n) % n;
            return (
              <motion.article
                key={r.version}
                aria-hidden={d !== 0}
                initial={dealt ? false : { opacity: 0, y: 30, rotate: -6 }}
                animate={{ opacity: 1, x: d * 12, y: d * -10, rotate: d === 0 ? -1 : d * 2.5 }}
                transition={{ ...settle, delay: dealt ? 0 : (n - 1 - i) * 0.08 }}
                className="absolute inset-0 overflow-hidden rounded-[6px] border-t-[6px] bg-(--ovio-surface) bg-[linear-gradient(transparent_31px,rgba(49,120,198,.18)_32px)] bg-size-[100%_32px] bg-position-[0_18px] px-[26px] py-6 shadow-[0_2px_4px_rgba(70,45,20,.12),0_16px_28px_-12px_rgba(70,45,20,.4)]"
                style={{ zIndex: n - d, borderTopColor: TABS[i % TABS.length] }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold tracking-[-0.03em]">v{r.version}</span>
                  <time
                    dateTime={r.dateTime}
                    className="font-(family-name:--ovio-hand) text-[22px] text-[#7d6650]"
                  >
                    {r.date}
                  </time>
                </div>
                <h3 className="m-0 mt-3.5 mb-1.5 text-[17px] font-bold">{r.title}</h3>
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
