"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { Avatar } from "@/components/shared/avatar";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { PERIOD_LABEL, PERIOD_SHORT, type TopContributorsWorldProps } from "../top-contributors";

export function MinimalTopContributors({
  people,
  total,
  repo,
  period,
  periods,
  setPeriod,
  className,
}: TopContributorsWorldProps) {
  const reduced = useReducedMotionSafe();
  const transition = useOvioTransition(motionTokens.minimal.slow);
  const fast = useOvioTransition(motionTokens.minimal.base);
  // The selected pill slides between windows; the id keeps several boards on a page apart.
  const id = useId();

  return (
    <section
      data-ovio-world="minimal"
      aria-label={repo ? `Top contributors to ${repo}` : "Top contributors"}
      className={cn(
        "@container flex w-full max-w-[640px] flex-col gap-[18px] rounded-(--ovio-radius) border border-(--ovio-line) bg-(--ovio-surface) px-6 py-7 font-(family-name:--ovio-font) text-(--ovio-ink) @md:px-10",
        className,
      )}
    >
      {(repo || periods.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {repo && (
            <span className="font-(family-name:--ovio-mono) text-xs text-(--ovio-muted)">
              {repo}
            </span>
          )}
          {periods.length > 0 && (
            <div
              role="group"
              aria-label="Time window"
              className="relative ml-auto flex rounded-full bg-(--ovio-track) p-0.5"
            >
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={p === period}
                  aria-label={PERIOD_LABEL[p]}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "relative cursor-pointer rounded-full px-3 py-1 text-xs font-medium",
                    p === period ? "text-(--ovio-ink)" : "text-(--ovio-muted)",
                  )}
                >
                  {p === period && (
                    <motion.span
                      layoutId={`${id}-period`}
                      aria-hidden
                      transition={fast}
                      className="absolute inset-0 rounded-full bg-(--ovio-surface) shadow-[0_1px_2px_rgba(22,22,20,.12)]"
                    />
                  )}
                  <span className="relative">{PERIOD_SHORT[p]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-baseline justify-between gap-3">
        <h3 className="m-0 text-[11px] font-normal tracking-[0.12em] text-(--ovio-muted) uppercase">
          Top contributors · {PERIOD_LABEL[period]}
        </h3>
        <span className="text-[13px] text-(--ovio-muted)">
          <RollingNumber value={total} /> commits
        </span>
      </div>

      {people.length === 0 ? (
        <p className="m-0 border-t border-(--ovio-line-2) pt-4 text-sm text-(--ovio-muted)">
          No commits in this window.
        </p>
      ) : (
        <ol className="m-0 list-none border-t border-(--ovio-line-2) p-0">
          {people.map((p, i) => (
            <motion.li
              key={p.login}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: reduced ? 0 : i * 0.04 }}
              className="grid grid-cols-[22px_30px_minmax(0,1fr)_52px] items-center gap-3 border-b border-(--ovio-line-2) py-[11px] @md:grid-cols-[28px_34px_minmax(0,1fr)_minmax(0,1.2fr)_60px] @md:gap-3.5"
            >
              <span className="font-(family-name:--ovio-mono) text-[11px] text-(--ovio-faint)">
                <span className="sr-only">Rank </span>
                {String(p.rank).padStart(2, "0")}
              </span>
              <Avatar
                initials={p.initials}
                src={p.avatarUrl}
                className="size-[30px] rounded-full bg-[#ebe9e4] text-[11px] font-medium"
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{p.name}</span>
                <span className="truncate text-xs text-(--ovio-muted)">@{p.login}</span>
              </span>
              <span
                aria-hidden
                className="relative hidden h-0.5 overflow-hidden bg-(--ovio-line-2) @md:block"
              >
                <motion.span
                  className="absolute inset-0 origin-left bg-(--ovio-ink)"
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: p.ratio }}
                  transition={{ ...transition, delay: reduced ? 0 : 0.06 + i * 0.04 }}
                />
              </span>
              <span className="text-right font-(family-name:--ovio-mono) text-[13px]">
                <RollingNumber value={p.commits} />
                <span className="sr-only"> commits</span>
              </span>
            </motion.li>
          ))}
        </ol>
      )}
    </section>
  );
}
