"use client";

import { AnimatePresence, motion } from "motion/react";
import { Avatar } from "@/components/shared/avatar";
import { QrCode } from "@/components/shared/qr-code";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DeveloperIdCardWorldProps } from "../developer-id-card";

export function MinimalDeveloperIdCard({
  name,
  initials,
  title,
  stack,
  profile,
  location,
  available,
  avatarUrl,
  serial,
  qrUrl,
  className,
}: DeveloperIdCardWorldProps) {
  const transition = useOvioTransition(motionTokens.minimal.base);

  return (
    <motion.article
      data-ovio-world="minimal"
      aria-label={`Developer ID card for ${name}`}
      initial={false}
      whileHover={{ y: -2, boxShadow: "0 12px 30px -16px rgba(0,0,0,.25)" }}
      transition={transition}
      style={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
      className={cn(
        "@container flex w-full max-w-[380px] flex-col gap-[22px] rounded-[10px] border border-(--ovio-line) bg-(--ovio-surface) p-7 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="flex min-h-4 justify-between gap-3 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
        <span>developer{serial && ` / ${serial}`}</span>
        <AnimatePresence initial={false} mode="popLayout">
          {available !== undefined && (
            <motion.span
              key={String(available)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={transition}
              className="flex items-center gap-1.5"
            >
              <span
                className="size-[7px] rounded-full"
                style={{ background: available ? "#2f9a45" : "var(--ovio-faint)" }}
              />
              {available ? "available" : "busy"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4">
        <Avatar
          initials={initials}
          src={avatarUrl}
          className="size-16 rounded-full bg-(--ovio-track) text-xl font-medium"
        />
        <div className="min-w-0">
          <h3 className="m-0 text-2xl leading-tight font-medium tracking-[-0.03em] break-words">
            {name}
          </h3>
          {title && <div className="text-sm text-(--ovio-muted)">{title}</div>}
        </div>
      </div>

      {stack.length > 0 && (
        <ul aria-label="Stack" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-(--ovio-line) px-2.5 py-1 text-xs text-(--ovio-ink-2)"
            >
              {tech}
            </li>
          ))}
        </ul>
      )}

      {(location || profile || qrUrl) && (
        <div className="flex items-end justify-between gap-3 border-t border-(--ovio-line-2) pt-4 text-[13px]">
          <div className="flex min-w-0 flex-col gap-[3px]">
            {location && <span className="text-(--ovio-muted)">{location}</span>}
            {profile && (
              <span className="font-(family-name:--ovio-mono) text-xs break-words">{profile}</span>
            )}
          </div>
          {qrUrl && <QrCode value={qrUrl} border={0} className="size-14 @max-[220px]:size-12" />}
        </div>
      )}
    </motion.article>
  );
}
