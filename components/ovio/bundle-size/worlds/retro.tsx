"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ARROW, barLabel, deltaLabel, KB_FORMAT, type BundleSizeWorldProps } from "../bundle-size";

const CELLS = 20;

/** Pads a label with dots to a fixed column, like a terminal listing. */
const dots = (label: string, width = 11) => label + ".".repeat(Math.max(1, width - label.length));

const TREND_COLOR = { down: "#6dff8a", up: "#ffd34d", same: "#3fae55", first: "#3fae55" };

export function RetroBundleSize({
  packageName,
  versions,
  index,
  reading: r,
  select,
  onKeyDown,
  tabRef,
  tabId,
  panelId,
  className,
}: BundleSizeWorldProps) {
  const reduced = useReducedMotionSafe();
  const target = Math.round(r.fill * CELLS);

  // The ASCII bar fills or empties one cell per frame, like a progress meter on old hardware.
  const cells = useMotionValue(target);
  const bar = useTransform(cells, (c) => {
    const n = Math.round(c);
    return "█".repeat(n) + "░".repeat(CELLS - n);
  });
  useEffect(() => {
    const frames = Math.abs(target - Math.round(cells.get()));
    if (reduced || frames === 0) return cells.set(target);
    const controls = animate(cells, target, motionTokens.retro.frames(frames, frames * 0.045));
    return () => controls.stop();
  }, [target, reduced, cells]);

  return (
    <div
      data-ovio-world="retro"
      className={cn(
        "w-full max-w-[440px] font-(family-name:--ovio-font) text-[23px] leading-[1.2] text-(--ovio-ink) [text-shadow:0_0_5px_rgba(80,255,120,.45)]",
        className,
      )}
    >
      <h3 className="m-0 font-normal text-[#c9ffd2]">
        C:\&gt; bundle-size {packageName}@{r.version}
      </h3>
      <div aria-hidden className="my-2.5 text-(--ovio-muted)">
        ----------------------------
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={tabId(index)}>
        <div>
          {dots("RAW")}
          <span className="text-[#c9ffd2]">
            <RollingNumber value={r.raw} format={KB_FORMAT} suffix=" KB" />
          </span>
        </div>
        <div>
          {dots("GZIP")}
          <RollingNumber value={r.gzip} format={KB_FORMAT} suffix=" KB" />
        </div>
        {r.brotli !== undefined && (
          <div>
            {dots("BROTLI")}
            <RollingNumber value={r.brotli} format={KB_FORMAT} suffix=" KB" />
          </div>
        )}
        {r.dependencies !== undefined && (
          <div>
            {dots("DEPS")}
            <RollingNumber value={r.dependencies} />
          </div>
        )}
        <div
          role="img"
          aria-label={barLabel(r)}
          className={cn(
            "my-3 text-[26px] tracking-[0.02em]",
            r.over ? "text-[#ffd34d]" : "text-(--ovio-accent)",
          )}
        >
          <span aria-hidden>
            [<motion.span>{bar}</motion.span>] <RollingNumber value={r.percent} suffix="%" />
          </span>
        </div>
        <div style={{ color: TREND_COLOR[r.trend] }}>
          {ARROW[r.trend]} {deltaLabel(r)}
        </div>
      </div>

      <div
        role="tablist"
        aria-label={`${packageName} version`}
        onKeyDown={onKeyDown}
        className="mt-3.5 flex flex-wrap gap-2.5"
      >
        {versions.map((v, i) => (
          <button
            key={v}
            ref={tabRef(i)}
            id={tabId(i)}
            role="tab"
            type="button"
            aria-selected={i === index}
            aria-controls={panelId}
            tabIndex={i === index ? 0 : -1}
            onClick={() => select(i)}
            className={cn(
              "cursor-pointer border border-(--ovio-muted) px-2 font-[inherit] text-[22px] [text-shadow:none]",
              i === index
                ? "bg-(--ovio-accent) text-(--ovio-on-accent)"
                : "bg-transparent text-(--ovio-ink)",
            )}
          >
            [{v}]
          </button>
        ))}
      </div>

      <div aria-hidden className="mt-2.5">
        &gt;{" "}
        <motion.span
          animate={reduced ? undefined : { opacity: [1, 0] }}
          transition={motionTokens.retro.blink}
        >
          █
        </motion.span>
      </div>
    </div>
  );
}
