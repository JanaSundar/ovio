"use client";

import { motion } from "motion/react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { PERIOD_LABEL, PERIOD_SHORT, type TopContributorsWorldProps } from "../top-contributors";

/** Arcade row colours: gold, then pale, then phosphor fading down the table. */
const ROW = ["#ffd34d", "#c9ffd2", "#6dff8a", "#6dff8a"];
const SCORE = { minimumIntegerDigits: 6, useGrouping: false } as const;

/** 1 → "1ST", 12 → "12TH". */
function ordinal(n: number): string {
  const tail = n % 100 >= 11 && n % 100 <= 13 ? "TH" : (["TH", "ST", "ND", "RD"][n % 10] ?? "TH");
  return `${n}${tail}`;
}

/** Three-letter arcade initials from the handle. */
const tag = (login: string) =>
  login
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 3)
    .toUpperCase();

export function RetroTopContributors({
  people,
  total,
  repo,
  period,
  periods,
  setPeriod,
  className,
}: TopContributorsWorldProps) {
  const reduced = useReducedMotionSafe();

  // Rows switch on one after another in a single hard frame, like a cabinet drawing its table.
  const row = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { ...motionTokens.retro.frames(1, 0.01), delay: 0.2 + i * 0.16 },
        };

  return (
    <section
      data-ovio-world="retro"
      aria-label={repo ? `Top contributors to ${repo}` : "Top contributors"}
      className={cn(
        "relative flex w-full max-w-[640px] flex-col items-center gap-3.5 overflow-hidden bg-[#050a06] px-5 py-8 font-(family-name:--ovio-font) text-(--ovio-ink) [text-shadow:var(--ovio-glow)]",
        className,
      )}
    >
      <h3 className="m-0 text-[44px] leading-none font-normal tracking-[0.06em] text-[#ffd34d] [text-shadow:0_0_10px_rgba(255,211,77,.6)]">
        HIGH SCORES
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xl text-(--ovio-ink-2)">
        {repo && <span>{repo.toUpperCase()}</span>}
        {periods.length > 0 && (
          <div role="group" aria-label="Time window" className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={p === period}
                aria-label={PERIOD_LABEL[p]}
                onClick={() => setPeriod(p)}
                className={cn(
                  "cursor-pointer border-0 px-1.5 font-(family-name:--ovio-font) text-xl leading-tight uppercase outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--ovio-ink)",
                  p === period
                    ? "bg-(--ovio-accent) text-(--ovio-on-accent) [text-shadow:none]"
                    : "bg-transparent text-(--ovio-ink-2)",
                )}
              >
                [{PERIOD_SHORT[p]}]
              </button>
            ))}
          </div>
        )}
      </div>

      {people.length === 0 ? (
        <p className="m-0 text-[28px]">NO SCORES YET</p>
      ) : (
        // Keyed by window, so a new window redraws the table row by row.
        <table key={period} className="border-collapse text-[28px] leading-[1.1]">
          <caption className="sr-only">
            Commits, {PERIOD_LABEL[period]}, {total} in total
          </caption>
          <thead>
            <tr className="text-(--ovio-ink-2)">
              <th scope="col" className="pr-9 text-left font-normal">
                RANK
              </th>
              <th scope="col" className="pr-9 text-left font-normal">
                NAME
              </th>
              <th scope="col" className="text-right font-normal">
                COMMITS
              </th>
            </tr>
          </thead>
          <tbody>
            {people.map((p, i) => (
              <motion.tr key={p.login} {...row(i)} style={{ color: ROW[i] ?? "var(--ovio-ink-2)" }}>
                <td className="pt-1 pr-9">{ordinal(p.rank)}</td>
                <td className="pt-1 pr-9" title={p.name}>
                  {tag(p.login)}
                  <span className="sr-only"> ({p.name})</span>
                </td>
                <td className="pt-1 text-right">
                  <RollingNumber value={p.commits} format={SCORE} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}

      <motion.div
        aria-hidden
        className="mt-2 text-[22px]"
        animate={reduced ? undefined : { opacity: [1, 0] }}
        transition={motionTokens.retro.blink}
      >
        PRESS START TO CONTRIBUTE
      </motion.div>
      <div aria-hidden className="ovio-scanlines" />
    </section>
  );
}
