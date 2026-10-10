"use client";

import { motion } from "motion/react";
import { useMemo, type ReactNode } from "react";
import { QrCode } from "@/components/shared/qr-code";
import { dots } from "@/lib/format";
import { motionTokens, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { sprite } from "../card";
import type { DeveloperIdCardWorldProps } from "../developer-id-card";

export function RetroDeveloperIdCard({
  name,
  shortTitle,
  stack,
  profile,
  location,
  available,
  serial,
  qrUrl,
  className,
}: DeveloperIdCardWorldProps) {
  const reduced = useReducedMotionSafe();
  const face = useMemo(() => sprite(name), [name]);

  const lines: [string, ReactNode][] = [];
  if (serial) lines.push(["ID", `DEV-${serial}`]);
  if (location) lines.push(["LOC", location.toUpperCase()]);
  if (stack.length) lines.push(["STACK", stack.join(" ")]);
  if (available !== undefined)
    lines.push([
      "STATUS",
      <span key="status" className="text-[#ffd34d]">
        {available ? "AVAILABLE" : "BUSY"}
      </span>,
    ]);
  if (profile) lines.push(["GITHUB", profile]);

  // Lines print one after another in hard frames, like a slow terminal.
  const line = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { ...motionTokens.retro.frames(1, 0.01), delay: 0.12 + i * 0.14 },
        };

  return (
    <article
      data-ovio-world="retro"
      aria-label={`Developer ID card for ${name}`}
      className={cn(
        "@container w-full max-w-[420px] border-4 border-double border-(--ovio-accent) bg-(--ovio-stage) font-(family-name:--ovio-font) text-(--ovio-ink) [text-shadow:var(--ovio-glow)]",
        className,
      )}
    >
      <div className="flex justify-between bg-(--ovio-accent) px-2.5 py-[3px] text-xl text-(--ovio-on-accent) [text-shadow:none]">
        <span>IDCARD.EXE</span>
        <span aria-hidden>[X]</span>
      </div>
      <div className="flex flex-col gap-3.5 px-[18px] py-4 text-[22px] leading-[1.1] @max-[300px]:px-3">
        <div className="flex items-center gap-4 @max-[300px]:gap-3">
          <svg
            viewBox="0 0 8 8"
            shapeRendering="crispEdges"
            aria-hidden
            className="size-24 shrink-0 border-2 border-(--ovio-ink-2) bg-(--ovio-surface) @max-[300px]:size-16"
          >
            <path d={face} fill="currentColor" />
          </svg>
          <div className="min-w-0">
            <h3 className="m-0 text-[34px] leading-none font-normal break-words text-[#c9ffd2] @max-[300px]:text-[28px]">
              {name.toUpperCase()}
            </h3>
            {shortTitle && (
              <div className="mt-1 text-(--ovio-ink-2)">{shortTitle.toUpperCase()}</div>
            )}
          </div>
        </div>

        {lines.length > 0 && (
          <dl className="m-0 border-t border-dashed border-(--ovio-faint) pt-2.5">
            {lines.map(([label, value], i) => (
              <motion.div key={label} className="flex" {...line(i)}>
                <dt className="shrink-0">{dots(label)}</dt>
                <dd className="m-0 min-w-0 break-words">{value}</dd>
              </motion.div>
            ))}
          </dl>
        )}

        <div className="flex items-end justify-between gap-3">
          <span aria-hidden>
            &gt; _
            <motion.span
              animate={reduced ? undefined : { opacity: [1, 0] }}
              transition={motionTokens.retro.blink}
            >
              █
            </motion.span>
          </span>
          {qrUrl && <QrCode value={qrUrl} border={0} className="size-16" />}
        </div>
      </div>
    </article>
  );
}
