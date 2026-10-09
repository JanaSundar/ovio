"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { barLabel, KB_FORMAT, signedDelta, type BundleSizeWorldProps } from "../bundle-size";
import { formatNumber } from "@/lib/format";

/** Each version tag is cut and stuck down a little crooked. */
const TILT = [-3, 2, -1];

const NOTE = {
  down: "lighter than before!",
  up: "a little heavier…",
  same: "same as before",
  first: "where it began",
};

export function CraftBundleSize({
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
  const settle = useOvioTransition(motionTokens.craft.base);
  const fill = useOvioTransition(motionTokens.craft.slow);
  const stamp = r.previous ? signedDelta(r) : "NEW";

  return (
    <div
      data-ovio-world="craft"
      className={cn(
        "relative w-full max-w-[380px] -rotate-1 rounded-md bg-(--ovio-surface) px-7 pt-[26px] pb-[22px] font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[0_2px_4px_rgba(70,45,20,.12),0_20px_34px_-14px_rgba(70,45,20,.4)]",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -top-3 left-[34px] h-6 w-[84px] -rotate-3 bg-(--ovio-tape)"
      />

      {/* A fresh stamp lands each time the version changes. */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={r.version}
          aria-hidden
          className="absolute top-[18px] right-5 rounded border-[3px] border-(--ovio-accent-deep) px-2.5 py-1.5 text-lg font-extrabold tracking-[0.02em] text-(--ovio-accent-deep)"
          initial={reduced ? false : { opacity: 0, scale: 1.5, rotate: 18 }}
          animate={{ opacity: 1, scale: 1, rotate: 9 }}
          exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.12 } }}
          transition={settle}
        >
          {stamp}
        </motion.div>
      </AnimatePresence>

      <h3 className="m-0 font-(family-name:--ovio-mono) text-[12px] font-normal tracking-[0.14em] text-[#7d6650] uppercase">
        Package label · {packageName}
      </h3>

      <div id={panelId} role="tabpanel" aria-labelledby={tabId(index)}>
        <div className="mt-3.5 mb-1.5 flex items-baseline gap-1.5">
          <RollingNumber
            className="text-[60px] leading-[.95] font-extrabold tracking-[-0.05em]"
            value={r.raw}
            format={KB_FORMAT}
          />
          <span className="text-xl font-bold text-[#7d6650]">kB</span>
        </div>

        {/* A ruler with a strip of orange tape laid along it. */}
        <div
          role="img"
          aria-label={barLabel(r)}
          className="relative mt-2.5 mb-1 h-[18px] border-b-2 border-(--ovio-ink)"
          style={{
            background:
              "repeating-linear-gradient(90deg,#2a1f14 0 1px,transparent 1px 10%) 0 100%/100% 8px no-repeat",
          }}
        >
          <motion.div
            className="absolute bottom-0 left-0 h-3"
            initial={false}
            animate={{
              width: `${r.fill * 100}%`,
              backgroundColor: r.over ? "#b8471f" : "#e0713a",
            }}
            transition={fill}
          />
        </div>
        <div className="flex justify-between font-(family-name:--ovio-mono) text-[11.5px] text-[#7d6650]">
          <span>0</span>
          <span>{r.scale / 2}</span>
          <span>
            {r.scale} kB{r.budget !== undefined && r.over && " · over budget"}
          </span>
        </div>

        <dl className="m-0 mt-3.5 border-t border-dashed border-[#b9a88f] pt-2 font-(family-name:--ovio-mono) text-[12.5px] leading-[1.8]">
          <Row label="gzip">{formatNumber(r.gzip, KB_FORMAT)} kB</Row>
          {r.brotli !== undefined && (
            <Row label="brotli">{formatNumber(r.brotli, KB_FORMAT)} kB</Row>
          )}
          {r.dependencies !== undefined && <Row label="deps">{r.dependencies}</Row>}
        </dl>
        {/* The stamp is decorative; this is its text. */}
        <p className="sr-only">
          {r.previous ? `${stamp} compared with ${r.previous.version}` : "First release"}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {/* Every note shares one cell, sized to the longest, so the tabs never move. */}
        <span
          aria-hidden
          className="inline-grid -rotate-3 font-(family-name:--ovio-hand) text-[25px] text-[#2b4a9b]"
        >
          {Object.entries(NOTE).map(([trend, note]) => (
            <span key={trend} className={cn("[grid-area:1/1]", trend !== r.trend && "invisible")}>
              {note}
            </span>
          ))}
        </span>
        <div
          role="tablist"
          aria-label={`${packageName} version`}
          onKeyDown={onKeyDown}
          className="flex flex-wrap gap-1.5"
        >
          {versions.map((v, i) => (
            <motion.button
              key={v}
              ref={tabRef(i)}
              id={tabId(i)}
              role="tab"
              type="button"
              aria-selected={i === index}
              aria-controls={panelId}
              tabIndex={i === index ? 0 : -1}
              onClick={() => select(i)}
              initial={false}
              animate={{
                rotate: TILT[i % TILT.length],
                y: 0,
                backgroundColor: i === index ? "#ffe27a" : "#efe3c8",
              }}
              whileHover={{ rotate: 0, y: -3 }}
              whileFocus={{ rotate: 0, y: -3 }}
              transition={settle}
              className="cursor-pointer border-0 px-[9px] py-1 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-ink) shadow-[0_3px_6px_-2px_rgba(70,45,20,.4)]"
            >
              {v}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="m-0">{children}</dd>
    </div>
  );
}
