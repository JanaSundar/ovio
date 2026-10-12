import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { Avatar } from "@/components/shared/avatar";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { PERIOD_LABEL, type TopContributorsWorldProps } from "../top-contributors";
import { formatCount, plural } from "@/lib/format";

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
  const drop = useOvioTransition(motionTokens.craft.slow);

  return (
    <section
      data-ovio-world="craft"
      aria-label={repo ? `Top contributors to ${repo}` : "Top contributors"}
      className={cn(
        "flex w-full max-w-170 flex-col items-center gap-6 font-(family-name:--ovio-font) text-(--ovio-ink)",
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
          {repo && (
            <span className="min-w-0 font-(family-name:--ovio-mono) text-xs wrap-anywhere">
              {repo}
            </span>
          )}
          <span>
            <RollingNumber value={total} /> {plural(total, "commit")}
          </span>
          {periods.length > 1 && (
            <div role="group" aria-label="Time window" className="flex gap-1.5">
              {periods.map((p, i) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={p === period}
                  onClick={() => setPeriod(p)}
                  style={
                    { "--tilt": p === period ? "0deg" : i % 2 ? "2deg" : "-2deg" } as CSSProperties
                  }
                  className={cn(
                    "cursor-pointer rotate-(--tilt) rounded-sm border-0 px-2.5 py-1 text-xs font-bold shadow-[0_1px_2px_rgba(70,45,20,.18)] transition-[rotate,translate,background-color,color] duration-300 ease-[cubic-bezier(.34,1.5,.5,1)] motion-reduce:transition-none hover:-translate-y-0.75 focus-visible:-translate-y-0.75 focus-visible:rotate-0",
                    p === period
                      ? "-translate-y-0.5 bg-(--ovio-accent) text-(--ovio-on-accent)"
                      : "bg-(--ovio-surface) text-(--ovio-ink-2)",
                  )}
                >
                  {PERIOD_LABEL[p]}
                </button>
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
        <ol className="m-0 flex max-w-160 list-none flex-wrap justify-center gap-4.5 p-0">
          {people.map((p, i) => (
            <motion.li
              key={p.login}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, transform: "translateY(-24px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ ...drop, delay: reduced ? 0 : i * 0.055 }}
            >
              <div
                style={{ "--tilt": `${TILT[i % TILT.length]}deg` } as CSSProperties}
                className="relative w-37.5 rotate-(--tilt) rounded-md bg-(--ovio-surface) px-3 pt-3 pb-3.5 shadow-(--ovio-shadow) transition-[rotate,scale,translate] duration-300 ease-[cubic-bezier(.34,1.5,.5,1)] motion-reduce:transition-none hover:-translate-y-2 hover:rotate-0 hover:scale-[1.04]"
              >
                <Avatar
                  initials={p.initials}
                  src={p.avatarUrl}
                  className="h-24 rounded-sm text-[34px] font-extrabold tracking-[-0.03em]"
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
                  {formatCount(p.commits, "commit")}
                </div>
                {p.rank === 1 && (
                  <span className="absolute -top-3.5 -right-3.5 flex size-12.5 rotate-14 items-center justify-center rounded-full bg-[#ffe27a] text-[13px] font-extrabold shadow-[0_4px_8px_-2px_rgba(90,60,0,.4)]">
                    MVP
                  </span>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      )}
    </section>
  );
}
