import { motion } from "motion/react";
import { ease, motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { formatDelta, receiptNote } from "../chart";
import type { NpmDownloadsWorldProps } from "../npm-downloads";

const PAPER = "#fffdf8";
const RULE = "border-t border-dashed border-[#b9a88f]";

/** Seconds the receipt takes to feed out. */
const FEED = 0.5;

export default function CraftNpmDownloads({
  packageName,
  points,
  latest,
  total,
  goal,
  goalProgress,
  summary,
  className,
}: NpmDownloadsWorldProps) {
  const reduced = useReducedMotionSafe();
  const pop = useOvioTransition({ ...motionTokens.craft.slow, delay: FEED });
  // The six weeks before the latest one, printed as line items.
  const recent = points.slice(-7, -1);

  return (
    <motion.figure
      data-ovio-world="craft"
      aria-label={summary}
      // The receipt feeds out of a printer: it drops and unrolls, then the note is slapped on.
      initial={
        reduced ? false : { transform: "translateY(-40px)", clipPath: "inset(0% 0% 100% 0%)" }
      }
      animate={{ transform: "translateY(0px)", clipPath: "inset(0% 0% 0% 0%)" }}
      transition={reduced ? { duration: 0 } : { duration: FEED, ease: ease.minimal }}
      className={cn(
        "m-0 w-70 font-(family-name:--ovio-font-geist-mono) text-xs leading-[1.7] text-(--ovio-ink) drop-shadow-[0_14px_18px_rgba(70,45,20,.3)]",
        className,
      )}
    >
      <div className="rotate-[-1.5deg] transition-[rotate,translate] duration-300 ease-[cubic-bezier(.34,1.5,.5,1)] motion-reduce:transition-none hover:-translate-y-1.5 hover:rotate-0">
        <div className="px-5.5 pt-5.5 pb-3.5" style={{ background: PAPER }}>
          <div className="text-center font-(family-name:--ovio-font) text-xl font-extrabold tracking-[-0.02em] wrap-anywhere">
            npm · {packageName}
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
            {formatNumber(latest.downloads)}
          </div>
          <div className="flex justify-between text-[#7d6650]">
            <span>VS LAST</span>
            <span>{formatDelta(latest.delta)}</span>
          </div>
          <div className="flex justify-between text-[#7d6650]">
            <span>{points.length} WK TOTAL</span>
            {formatNumber(total)}
          </div>
          {goal !== undefined && (
            <>
              <div className={cn("mt-2 flex justify-between pt-2", RULE)}>
                <span>GOAL</span>
                <span>{formatNumber(goal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{goalProgress >= 1 ? "OVER BY" : "TO GO"}</span>
                {formatNumber(Math.abs(goal - latest.downloads))}
              </div>
            </>
          )}

          <motion.div
            className="mt-2.5 text-center font-(family-name:--ovio-hand) text-[26px] leading-tight text-(--ovio-accent-deep)"
            initial={reduced ? false : { opacity: 0, transform: "scale(0.9) rotate(-12deg)" }}
            animate={{ opacity: 1, transform: "scale(1) rotate(-4deg)" }}
            transition={pop}
          >
            {receiptNote(latest.delta, goal !== undefined && goalProgress >= 1)}
          </motion.div>
          <div
            aria-hidden
            className="mt-2 h-7.5"
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
      </div>
    </motion.figure>
  );
}
