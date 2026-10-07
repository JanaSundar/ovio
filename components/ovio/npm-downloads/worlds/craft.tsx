"use client";

import { motion } from "motion/react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, steps, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { formatDelta, type NpmDownloadsWorldProps } from "../npm-downloads";

const PAPER = "#fffdf8";
const RULE = "border-t border-dashed border-[#b9a88f]";

/** The handwritten note at the foot of the receipt. */
function note(delta: number | null, hit: boolean) {
  if (hit) return "goal hit, wow!";
  if (delta === null) return "first week!";
  if (delta >= 0) return `up ${delta.toFixed(1)}%, nice!`;
  return `down ${Math.abs(delta).toFixed(1)}%, onwards`;
}

export function CraftNpmDownloads({
  pkg,
  points,
  latest,
  total,
  goal,
  goalProgress,
  summary,
  className,
}: NpmDownloadsWorldProps) {
  const reduced = useReducedMotionSafe();
  const lift = useOvioTransition(motionTokens.craft.base);
  const pop = useOvioTransition({ ...motionTokens.craft.slow, delay: 1.4 });
  // The six weeks before the latest one, printed as line items.
  const recent = points.slice(-7, -1);

  return (
    <motion.figure
      data-ovio-world="craft"
      aria-label={summary}
      // The receipt feeds out of a printer: it drops and unclips in 14 hard steps.
      initial={reduced ? false : { y: -40, clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
      transition={reduced ? { duration: 0 } : { duration: 1.4, ease: steps(14) }}
      className={cn(
        "m-0 w-[280px] font-(family-name:--ovio-font-geist-mono) text-xs leading-[1.7] text-(--ovio-ink) drop-shadow-[0_14px_18px_rgba(70,45,20,.3)]",
        className,
      )}
    >
      <motion.div
        initial={false}
        animate={{ rotate: -1.5, y: 0 }}
        whileHover={{ rotate: 0, y: -6 }}
        transition={lift}
      >
        <div className="px-[22px] pt-[22px] pb-3.5" style={{ background: PAPER }}>
          <div className="text-center font-(family-name:--ovio-font) text-xl font-extrabold tracking-[-0.02em]">
            npm · {pkg}
          </div>
          <div className="mb-3 text-center text-[#7d6650]">weekly downloads receipt</div>

          <dl className={cn("m-0 pt-2", RULE)}>
            {recent.map((p) => (
              <div key={p.week} className="flex justify-between">
                <dt className="uppercase">{p.label}</dt>
                <dd className="m-0">{formatNumber(p.downloads)}</dd>
              </div>
            ))}
          </dl>

          <div className={cn("mt-2 flex justify-between pt-2 text-sm font-medium", RULE)}>
            <span>THIS WEEK</span>
            <RollingNumber value={latest.downloads} />
          </div>
          <div className="flex justify-between text-[#7d6650]">
            <span>VS LAST</span>
            <span>{formatDelta(latest.delta)}</span>
          </div>
          <div className="flex justify-between text-[#7d6650]">
            <span>{points.length} WK TOTAL</span>
            <RollingNumber value={total} />
          </div>
          {goal !== undefined && (
            <>
              <div className={cn("mt-2 flex justify-between pt-2", RULE)}>
                <span>GOAL</span>
                <span>{formatNumber(goal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{goalProgress >= 1 ? "OVER BY" : "TO GO"}</span>
                <RollingNumber value={Math.abs(goal - latest.downloads)} />
              </div>
            </>
          )}

          <motion.div
            className="mt-2.5 text-center font-(family-name:--ovio-hand) text-[26px] leading-tight text-(--ovio-accent-deep)"
            initial={reduced ? false : { opacity: 0, scale: 0.6, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={pop}
          >
            {note(latest.delta, goal !== undefined && goalProgress >= 1)}
          </motion.div>
          <div
            aria-hidden
            className="mt-2 h-[30px]"
            style={{
              background:
                "repeating-linear-gradient(90deg,#2a1f14 0 2px,transparent 2px 4px,#2a1f14 4px 5px,transparent 5px 8px)",
            }}
          />
        </div>
        {/* Torn edge. */}
        <div
          aria-hidden
          className="h-3"
          style={{
            background: `linear-gradient(-45deg,transparent 6px,${PAPER} 0) 0 0/12px 12px repeat-x,linear-gradient(45deg,transparent 6px,${PAPER} 0) 0 0/12px 12px repeat-x`,
          }}
        />
      </motion.div>
    </motion.figure>
  );
}
