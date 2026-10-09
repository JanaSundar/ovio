"use client";

import { motion } from "motion/react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ARROW, barLabel, KB_FORMAT, type BundleSizeWorldProps } from "../bundle-size";

const TREND_COLOR = { down: "#2f7a45", up: "#b4432a", same: "#77756e", first: "#77756e" };

export function MinimalBundleSize({
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
  const fast = useOvioTransition(motionTokens.minimal.base);
  const slide = useOvioTransition(motionTokens.minimal.slow);

  return (
    <article
      data-ovio-world="minimal"
      className={cn(
        "flex w-full max-w-[400px] flex-col gap-[22px] rounded-[10px] border border-(--ovio-line) bg-(--ovio-surface) px-7 py-[26px] font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 font-(family-name:--ovio-mono) text-[13px] font-normal">
          {packageName}
        </h3>
        <div
          role="tablist"
          aria-label={`${packageName} version`}
          onKeyDown={onKeyDown}
          className="flex flex-wrap gap-0.5 rounded-[7px] bg-[#f0eee9] p-0.5"
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
              className="relative cursor-pointer rounded-[5px] border-0 bg-transparent px-[9px] py-1 font-(family-name:--ovio-mono) text-[11px]"
            >
              {i === index && (
                <motion.span
                  aria-hidden
                  layoutId={`${panelId}-pill`}
                  transition={fast}
                  className="absolute inset-0 rounded-[5px] bg-white shadow-[0_1px_2px_rgba(22,22,20,.08)]"
                />
              )}
              <motion.span
                className="relative"
                initial={false}
                animate={{ color: i === index ? "#161614" : "#77756e" }}
                transition={fast}
              >
                {v}
              </motion.span>
            </button>
          ))}
        </div>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(index)}
        className="flex flex-col gap-[22px]"
      >
        <div className="flex items-baseline gap-1.5">
          <RollingNumber
            className="text-[52px] leading-none tracking-[-0.045em]"
            value={r.raw}
            format={KB_FORMAT}
          />
          <span className="text-lg text-(--ovio-muted)">kB</span>
        </div>

        <div>
          <div
            role="img"
            aria-label={barLabel(r)}
            className="relative h-1.5 rounded-[3px] bg-(--ovio-line-2)"
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-[3px]"
              initial={false}
              animate={{
                width: `${r.fill * 100}%`,
                backgroundColor: r.over ? "#b4432a" : "#161614",
              }}
              transition={slide}
            />
            {r.previousFill !== undefined && (
              <motion.div
                aria-hidden
                className="absolute -inset-y-1 w-[1.5px] bg-(--ovio-faint)"
                initial={false}
                animate={{ left: `${r.previousFill * 100}%` }}
                transition={slide}
              />
            )}
          </div>
          <div className="mt-2 flex justify-between gap-2 text-[11px] text-(--ovio-muted)">
            <span>0</span>
            <span>{r.previous && `${r.previous.version}: ${r.previous.raw.toFixed(1)} kB`}</span>
            <span>
              {r.scale} kB{r.budget !== undefined && " budget"}
            </span>
          </div>
        </div>

        <dl className="m-0 flex flex-col text-[13px]">
          <Row label="gzip" value={r.gzip} />
          {r.brotli !== undefined && <Row label="brotli" value={r.brotli} />}
          {r.dependencies !== undefined && (
            <Row label="dependencies" value={r.dependencies} unit="" />
          )}
        </dl>

        {/* The rolling number's box is 21px; the same line height keeps "first release" as tall. */}
        <motion.div
          className="text-[13px] leading-[21px]"
          initial={false}
          animate={{ color: TREND_COLOR[r.trend] }}
          transition={fast}
        >
          {ARROW[r.trend]}{" "}
          {(r.trend === "down" || r.trend === "up") && (
            <>
              <RollingNumber value={r.delta} format={KB_FORMAT} suffix="%" />{" "}
            </>
          )}
          <span className="text-(--ovio-muted)">
            {r.previous
              ? r.trend === "same"
                ? `same as ${r.previous.version}`
                : `${r.trend === "down" ? "smaller" : "larger"} than ${r.previous.version}`
              : "first release"}
          </span>
        </motion.div>
      </div>
    </article>
  );
}

function Row({ label, value, unit = " kB" }: { label: string; value: number; unit?: string }) {
  return (
    <div className="flex justify-between border-t border-(--ovio-line-2) py-2.5">
      <dt className="text-(--ovio-muted)">{label}</dt>
      <dd className="m-0 font-(family-name:--ovio-mono)">
        <RollingNumber value={value} format={unit ? KB_FORMAT : undefined} />
        {unit}
      </dd>
    </div>
  );
}
