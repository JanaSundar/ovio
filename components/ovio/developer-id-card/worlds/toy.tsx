"use client";

import { motion } from "motion/react";
import { Avatar } from "@/components/shared/avatar";
import { QrCode } from "@/components/shared/qr-code";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DeveloperIdCardWorldProps } from "../developer-id-card";

/** Plastic key colours for the stack: face, side, ink. */
const KEYS = [
  ["var(--ovio-accent)", "var(--ovio-accent-deep)", "#fff"],
  ["var(--ovio-red)", "var(--ovio-red-deep)", "#fff"],
  ["#33b07a", "#1f7c52", "#fff"],
  ["var(--ovio-yellow)", "var(--ovio-yellow-deep)", "var(--ovio-ink)"],
] as const;

export function ToyDeveloperIdCard({
  name,
  initials,
  shortTitle,
  stack,
  profile,
  location,
  available,
  avatarUrl,
  qrUrl,
  className,
}: DeveloperIdCardWorldProps) {
  const led = useOvioTransition(motionTokens.minimal.base);
  const place = location?.split(",")[0].toUpperCase();

  return (
    <div
      data-ovio-world="toy"
      role="group"
      aria-label={`Developer ID card for ${name}`}
      className={cn(
        "@container flex w-full max-w-[340px] flex-col gap-3 rounded-[24px] bg-(--ovio-surface) p-3.5 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_1px_0_#fff,0_8px_0_#d2ccbf,0_28px_34px_-16px_rgba(40,28,10,.5)] select-none",
        className,
      )}
    >
      <span
        aria-hidden
        className="mx-auto h-3.5 w-[58px] rounded-full bg-(--ovio-stage) shadow-[inset_0_3px_5px_rgba(40,28,10,.3)]"
      />

      <div className="flex items-center gap-3.5 rounded-2xl bg-(--ovio-accent) p-4 text-(--ovio-on-accent) shadow-[inset_0_-5px_0_rgba(0,0,0,.2),inset_0_2px_0_rgba(255,255,255,.2)] @max-[280px]:gap-3 @max-[280px]:p-3">
        <Avatar
          initials={initials}
          src={avatarUrl}
          className="size-[68px] rounded-full bg-(--ovio-yellow) text-2xl font-extrabold text-(--ovio-ink) shadow-[0_5px_0_var(--ovio-yellow-deep),0_10px_12px_-5px_rgba(0,0,0,.4)] @max-[280px]:size-14 @max-[280px]:text-xl"
        />
        <div className="min-w-0">
          <h3
            className="m-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] break-words @max-[280px]:text-2xl"
            style={{ fontStretch: "118%" }}
          >
            {name}
          </h3>
          {shortTitle && (
            <div className="mt-1.5 font-(family-name:--ovio-mono) text-[11px] tracking-[0.06em] uppercase">
              {shortTitle}
            </div>
          )}
        </div>
      </div>

      {stack.length > 0 && (
        <div role="list" aria-label="Stack" className="flex flex-wrap gap-2 pb-1.5">
          {stack.map((tech, i) => {
            const [face, side, ink] = KEYS[i % KEYS.length];
            return (
              <span
                key={`${i}:${tech}`}
                role="listitem"
                className="grow basis-[60px] rounded-[11px] px-2 py-2.5 text-center text-xs font-extrabold"
                style={{ background: face, color: ink, boxShadow: `0 5px 0 ${side}` }}
              >
                {tech}
              </span>
            );
          })}
        </div>
      )}

      {(place || profile || available !== undefined || qrUrl) && (
        <div className="flex items-center justify-between gap-3 rounded-[14px] bg-[#ebe6db] px-3.5 py-3 shadow-[inset_0_3px_6px_rgba(40,28,10,.2)]">
          <div className="flex min-w-0 flex-col gap-[3px] font-(family-name:--ovio-mono) text-[11px]">
            {(place || profile) && (
              <span className="break-words text-(--ovio-muted)">
                {[place, profile].filter(Boolean).join(" · ")}
              </span>
            )}
            {available !== undefined && (
              <span className="flex items-center gap-[7px]">
                <motion.span
                  className="size-2.5 shrink-0 rounded-full"
                  initial={false}
                  animate={{
                    backgroundColor: available ? "#33b07a" : "#a69e90",
                    boxShadow: `inset 0 1px 1px rgba(0,0,0,.3), 0 0 0 3px ${available ? "rgba(51,176,122,.25)" : "rgba(40,28,10,.08)"}`,
                  }}
                  transition={led}
                />
                {available ? "AVAILABLE" : "BUSY"}
              </span>
            )}
          </div>
          {qrUrl && <QrCode value={qrUrl} border={0} className="size-[52px]" />}
        </div>
      )}
    </div>
  );
}
