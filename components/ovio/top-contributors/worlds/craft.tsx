"use client";

import { motion } from "motion/react";
import { Avatar } from "@/components/shared/avatar";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { PERIOD_LABEL, type TopContributorsWorldProps } from "../top-contributors";
import { formatNumber } from "@/lib/format";

/** Photo tile colours and tilts, by rank. Light tiles take dark ink. */
const TILES = ["#e0713a", "#3178c6", "#ffe27a", "#2f9a45", "#f2c9a0", "#b8471f"];
const LIGHT = new Set([2, 4]);
const TILT = [-4, 3, -2, 5, -3, 2];

export function CraftTopContributors({
  people,
  total,
  repo,
  period,
  periods,
  setPeriod,
  className,
}: TopContributorsWorldProps) {
  const reduced = useReducedMotionSafe();
  const settle = useOvioTransition(motionTokens.craft.base);
  const drop = useOvioTransition(motionTokens.craft.slow);

  return (
    <section
      data-ovio-world="craft"
      aria-label={repo ? `Top contributors to ${repo}` : "Top contributors"}
      className={cn(
        "flex w-full max-w-[680px] flex-col items-center gap-6 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="m-0 text-[28px] font-extrabold tracking-[-0.03em]">
          The crew{" "}
          <span className="font-(family-name:--ovio-hand) font-bold text-(--ovio-accent-deep)">
            (thank you!)
          </span>
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] text-(--ovio-muted)">
          {repo && <span className="font-(family-name:--ovio-mono) text-xs">{repo}</span>}
          <span>
            <RollingNumber value={total} /> commits
          </span>
          {periods.length > 0 && (
            <div role="group" aria-label="Time window" className="flex gap-1.5">
              {periods.map((p, i) => (
                <motion.button
                  key={p}
                  type="button"
                  aria-pressed={p === period}
                  onClick={() => setPeriod(p)}
                  initial={false}
                  animate={{ rotate: p === period ? 0 : i % 2 ? 2 : -2, y: p === period ? -2 : 0 }}
                  whileHover={{ y: -3 }}
                  whileFocus={{ rotate: 0, y: -3 }}
                  transition={settle}
                  className={cn(
                    "cursor-pointer rounded-[4px] border-0 px-2.5 py-1 text-xs font-bold shadow-[0_1px_2px_rgba(70,45,20,.18)]",
                    p === period
                      ? "bg-(--ovio-accent) text-(--ovio-on-accent)"
                      : "bg-(--ovio-surface) text-(--ovio-ink-2)",
                  )}
                >
                  {PERIOD_LABEL[p]}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {people.length === 0 ? (
        <p className="m-0 font-(family-name:--ovio-hand) text-2xl text-(--ovio-ink-2)">
          Quiet stretch: no commits in this window.
        </p>
      ) : (
        <ol className="m-0 flex max-w-[640px] list-none flex-wrap justify-center gap-[18px] p-0">
          {people.map((p, i) => (
            <motion.li
              key={p.login}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...drop, delay: reduced ? 0 : i * 0.055 }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: TILT[i % TILT.length], y: 0, scale: 1 }}
                whileHover={{ rotate: 0, y: -8, scale: 1.04 }}
                transition={settle}
                className="relative w-[150px] rounded-md bg-(--ovio-surface) px-3 pt-3 pb-3.5 shadow-(--ovio-shadow)"
              >
                <Avatar
                  initials={p.initials}
                  src={p.avatarUrl}
                  className="h-24 rounded-[4px] text-[34px] font-extrabold tracking-[-0.03em]"
                  style={{
                    background: TILES[i % TILES.length],
                    color: LIGHT.has(i % TILES.length) ? "var(--ovio-ink)" : "#fff",
                  }}
                />
                <div className="mt-2.5 truncate text-sm font-bold" title={p.name}>
                  <span className="sr-only">{p.rank}. </span>
                  {p.first}
                  <span className="sr-only">
                    {" "}
                    ({p.name}, @{p.login})
                  </span>
                </div>
                <div className="font-(family-name:--ovio-hand) text-[22px] leading-none text-(--ovio-ink-2)">
                  {formatNumber(p.commits)} commits
                </div>
                {p.rank === 1 && (
                  <span className="absolute -top-3.5 -right-3.5 flex size-[50px] rotate-14 items-center justify-center rounded-full bg-[#ffe27a] text-[13px] font-extrabold shadow-[0_4px_8px_-2px_rgba(90,60,0,.4)]">
                    MVP
                  </span>
                )}
              </motion.div>
            </motion.li>
          ))}
        </ol>
      )}
    </section>
  );
}
