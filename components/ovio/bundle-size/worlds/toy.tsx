"use client";

import { motion } from "motion/react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { ToyKey } from "@/components/shared/toy";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { barLabel, deltaLabel, KB_FORMAT, type BundleSizeWorldProps } from "../bundle-size";

const BLOCKS = 20;
/** Blocks past this one are the red zone near the budget. */
const WARN_FROM = 16;

/** Selected key colours, cycling blue, red, yellow: [cap, text, side]. */
const KEYS = [
  ["var(--ovio-accent)", "#fff", "var(--ovio-accent-deep)"],
  ["var(--ovio-red)", "#fff", "var(--ovio-red-deep)"],
  ["var(--ovio-yellow)", "var(--ovio-ink)", "var(--ovio-yellow-deep)"],
];

export function ToyBundleSize({
  pkg,
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
  const pop = useOvioTransition(motionTokens.toy.piece);
  const lit = Math.round(r.fill * BLOCKS);
  const stagger = "stiffness" in pop;

  return (
    <div
      data-ovio-world="toy"
      className={cn(
        "flex w-full max-w-[420px] flex-col gap-4 rounded-[24px] bg-(--ovio-surface) p-5 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_1px_0_#fff,0_8px_0_#d2ccbf,0_26px_32px_-16px_rgba(40,28,10,.45)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
        <h3 className="m-0 font-normal tracking-[0.08em] uppercase">Bundle size · {pkg}</h3>
        <span>{deltaLabel(r)}</span>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(index)}
        className="flex flex-col gap-4"
      >
        {/* A little LCD set into the plastic. */}
        <div className="flex items-baseline gap-2 rounded-[14px] bg-[#2a2925] px-[18px] py-2.5 font-(family-name:--ovio-mono) font-semibold text-(--ovio-surface) shadow-[inset_0_3px_6px_rgba(0,0,0,.6)]">
          <RollingNumber className="text-[44px] leading-none" value={r.raw} format={KB_FORMAT} />
          <span className="text-lg text-[#bdb6a8]">kB</span>
        </div>

        {/* A row of blocks that pop up out of their tray, one after another. */}
        <div
          role="img"
          aria-label={barLabel(r)}
          className="grid gap-[3px] rounded-xl bg-[#ebe6db] p-2 shadow-[inset_0_3px_6px_rgba(40,28,10,.2)]"
          style={{ gridTemplateColumns: `repeat(${BLOCKS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: BLOCKS }, (_, k) => {
            const on = k < lit;
            return (
              <motion.span
                key={k}
                aria-hidden
                className="h-[26px] rounded"
                initial={false}
                animate={{
                  y: on ? -3 : 2,
                  backgroundColor: on
                    ? r.over || k >= WARN_FROM
                      ? "#ef4f2b"
                      : "#2c55e0"
                    : "#d6d0c3",
                  boxShadow: on
                    ? "0 3px 0 rgba(0,0,0,.25), inset 0 2px 0 rgba(255,255,255,.3)"
                    : "0 0px 0 rgba(0,0,0,0), inset 0 0px 0 rgba(255,255,255,0)",
                }}
                transition={stagger ? { ...pop, delay: k * 0.018 } : pop}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2.5 font-(family-name:--ovio-mono) text-xs">
          <span className="rounded-[11px] bg-white px-3 py-2 shadow-[0_4px_0_#cfc8b8]">
            gzip <RollingNumber className="font-bold" value={r.gzip} format={KB_FORMAT} />
          </span>
          {r.brotli !== undefined && (
            <span className="rounded-[11px] bg-white px-3 py-2 shadow-[0_4px_0_#cfc8b8]">
              brotli <RollingNumber className="font-bold" value={r.brotli} format={KB_FORMAT} />
            </span>
          )}
        </div>
      </div>

      <div
        role="tablist"
        aria-label={`${pkg} version`}
        onKeyDown={onKeyDown}
        className="grid gap-2.5"
        style={{ gridTemplateColumns: `repeat(${Math.min(versions.length, 4)}, minmax(0, 1fr))` }}
      >
        {versions.map((v, i) => {
          const [cap, text, side] =
            i === index ? KEYS[i % KEYS.length] : ["#fff", "var(--ovio-ink)", "#cfc8b8"];
          return (
            <ToyKey
              key={v}
              ref={tabRef(i)}
              id={tabId(i)}
              role="tab"
              aria-selected={i === index}
              aria-controls={panelId}
              tabIndex={i === index ? 0 : -1}
              onClick={() => select(i)}
              depth={6}
              side={side}
              style={{ background: cap, color: text }}
              className="cursor-pointer touch-manipulation rounded-xl border-0 py-3 font-(family-name:--ovio-mono) text-[13px] font-semibold outline-none focus-visible:ring-3 focus-visible:ring-(--ovio-accent)/50"
            >
              {v}
            </ToyKey>
          );
        })}
      </div>
    </div>
  );
}
