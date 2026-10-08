"use client";

import { motion } from "motion/react";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { TYPE_LABEL, type ChangelogWorldProps } from "../changelog";

/** Minimal: a quiet two-column list. Rows rise into place one after another. */
export function MinimalChangelog({ releases, className }: ChangelogWorldProps) {
  const reduced = useReducedMotionSafe();
  const transition = useOvioTransition(motionTokens.minimal.slow);

  return (
    <section
      data-ovio-world="minimal"
      aria-label="Changelog"
      className={cn(
        "w-full max-w-[680px] rounded-(--ovio-radius) border border-(--ovio-line) bg-(--ovio-surface) px-6 py-8 font-(family-name:--ovio-font) text-(--ovio-ink) sm:px-10",
        className,
      )}
    >
      <h2 className="m-0 mb-4 text-[11px] font-normal tracking-[0.12em] text-(--ovio-muted) uppercase">
        Changelog
      </h2>
      <ol className="m-0 list-none p-0">
        {releases.map((r, i) => (
          <motion.li
            key={r.version}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduced ? 0 : i * 0.055 }}
            className="grid grid-cols-1 gap-x-6 gap-y-2 border-t border-(--ovio-line-2) py-4 sm:grid-cols-[120px_minmax(0,1fr)]"
          >
            <div>
              <div className="font-(family-name:--ovio-mono) text-[13px]">v{r.version}</div>
              <time dateTime={r.dateTime} className="mt-0.5 block text-xs text-(--ovio-muted)">
                {r.date}
              </time>
            </div>
            <div>
              <h3 className="m-0 mb-1.5 text-[15px] font-medium">{r.title}</h3>
              <ul className="m-0 list-none p-0">
                {r.items.map((item) => (
                  <li key={item.text} className="text-[13px] leading-[1.6] text-(--ovio-ink-2)">
                    {item.type ? (
                      <span className="mr-2 font-(family-name:--ovio-mono) text-[11.5px] tracking-[0.06em] text-(--ovio-faint) uppercase">
                        {TYPE_LABEL[item.type]}
                      </span>
                    ) : (
                      <span aria-hidden>— </span>
                    )}
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
