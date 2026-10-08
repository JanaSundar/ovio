"use client";

import { motion } from "motion/react";
import { Avatar } from "@/components/shared/avatar";
import { RollingNumber } from "@/components/shared/rolling-number";
import { ToyKey, ToyPiece } from "@/components/shared/toy";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { PERIOD_LABEL, PERIOD_SHORT, type TopContributorsWorldProps } from "../top-contributors";

/** Plastic piece colours by rank: face, side, ink. */
const PIECES = [
  ["var(--ovio-red)", "var(--ovio-red-deep)", "#fff"],
  ["var(--ovio-accent)", "var(--ovio-accent-deep)", "#fff"],
  ["var(--ovio-yellow)", "var(--ovio-yellow-deep)", "var(--ovio-ink)"],
  ["#33b07a", "#1f7c52", "#fff"],
  ["#2a2925", "#0d0d0c", "var(--ovio-surface)"],
  ["#fff", "#cfc8b8", "var(--ovio-ink)"],
] as const;

export function ToyTopContributors({
  people,
  total,
  repo,
  period,
  periods,
  setPeriod,
  className,
}: TopContributorsWorldProps) {
  const reduced = useReducedMotionSafe();
  const slide = useOvioTransition(motionTokens.toy.slide);
  const piece = useOvioTransition(motionTokens.toy.piece);
  const led = useOvioTransition(motionTokens.minimal.fast);

  return (
    <section
      data-ovio-world="toy"
      aria-label={repo ? `Top contributors to ${repo}` : "Top contributors"}
      className={cn(
        "@container flex w-full max-w-[620px] flex-col gap-5 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3
            className="m-0 text-[26px] leading-none font-extrabold tracking-[-0.02em]"
            style={{ fontStretch: "118%" }}
          >
            Top contributors
          </h3>
          <span className="font-(family-name:--ovio-mono) text-[11px] tracking-[0.08em] text-(--ovio-muted) uppercase">
            {repo && `${repo} · `}
            <RollingNumber value={total} /> commits · drag a piece
          </span>
        </div>
        {periods.length > 0 && (
          <div role="group" aria-label="Time window" className="flex gap-2 pb-1.5">
            {periods.map((p) => (
              <ToyKey
                key={p}
                depth={4}
                side="#cfc8b8"
                aria-pressed={p === period}
                aria-label={PERIOD_LABEL[p]}
                onClick={() => setPeriod(p)}
                className="flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-[10px] border-0 bg-white px-3 py-2 font-(family-name:--ovio-font) text-[13px] font-extrabold text-(--ovio-ink)"
              >
                <motion.span
                  aria-hidden
                  className="size-1.5 rounded-full shadow-[inset_0_1px_1px_rgba(0,0,0,.3)]"
                  animate={{ backgroundColor: p === period ? "#ef4f2b" : "#a69e90" }}
                  transition={led}
                />
                {PERIOD_SHORT[p]}
              </ToyKey>
            ))}
          </div>
        )}
      </div>

      {people.length === 0 ? (
        <p className="m-0 rounded-(--ovio-radius) bg-(--ovio-surface) px-5 py-6 text-sm text-(--ovio-muted) shadow-[inset_0_1px_0_#fff,0_6px_0_#d2ccbf]">
          No commits in this window.
        </p>
      ) : (
        <ol
          className="m-0 grid list-none items-end gap-1.5 p-0 @md:gap-2.5"
          style={{ gridTemplateColumns: `repeat(${people.length}, minmax(0, 1fr))` }}
        >
          {people.map((p, i) => {
            const [face, side, ink] = PIECES[i % PIECES.length];
            return (
              <motion.li
                key={p.login}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: -48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...piece, delay: reduced ? 0 : i * 0.08 }}
                className="flex min-w-0 flex-col items-center gap-2.5"
              >
                <ToyPiece
                  role="img"
                  aria-label={`${p.name}, @${p.login}`}
                  className="z-10 rounded-full"
                  style={{
                    boxShadow: `0 5px 0 ${side}, 0 10px 12px -5px rgba(40,28,10,.4)`,
                  }}
                >
                  <Avatar
                    initials={p.initials}
                    src={p.avatarUrl}
                    className="size-10 rounded-full text-sm font-extrabold shadow-[inset_0_2px_0_rgba(255,255,255,.3)] @md:size-[52px] @md:text-base"
                    style={{ background: face, color: ink }}
                  />
                </ToyPiece>
                {/* The podium grows with the share of the top score. */}
                <motion.div
                  initial={false}
                  animate={{ height: 44 + p.ratio * 150 }}
                  transition={slide}
                  className="flex w-full flex-col items-center gap-0.5 rounded-[10px_10px_4px_4px] bg-(--ovio-surface) pt-2.5 shadow-[inset_0_1px_0_#fff,0_6px_0_#d2ccbf,0_14px_16px_-10px_rgba(40,28,10,.4)]"
                >
                  <span
                    className="text-[22px] leading-none font-extrabold"
                    style={{ fontStretch: "118%" }}
                  >
                    <span className="sr-only">Rank </span>
                    {p.rank}
                  </span>
                  <span className="font-(family-name:--ovio-mono) text-[10px] text-(--ovio-muted)">
                    <RollingNumber value={p.commits} />
                    <span className="sr-only"> commits</span>
                  </span>
                </motion.div>
                <span className="max-w-full truncate text-xs font-semibold">{p.first}</span>
              </motion.li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
