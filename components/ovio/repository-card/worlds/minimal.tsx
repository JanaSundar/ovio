"use client";

import { motion } from "motion/react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { RepositoryCardWorldProps } from "../repository-card";

const COMPACT = { notation: "compact", maximumFractionDigits: 1 } as const;

export function MinimalRepositoryCard({
  repo,
  stats,
  starCount,
  language,
  updated,
  className,
}: RepositoryCardWorldProps) {
  const transition = useOvioTransition(motionTokens.minimal.base);

  return (
    <motion.article
      data-ovio-world="minimal"
      initial={false}
      whileHover={{ y: -2, borderColor: "#c9c6bf" }}
      transition={transition}
      className={cn(
        "w-full max-w-[420px] rounded-(--ovio-radius) border border-(--ovio-line) bg-(--ovio-surface) px-7 py-[26px] font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="mb-1.5 text-xs text-(--ovio-muted)">{repo.owner} /</div>
      <h3 className="m-0 text-[22px] font-medium tracking-[-0.02em]">{repo.name}</h3>
      {repo.description && (
        <p className="mt-3 mb-6 text-sm leading-normal text-(--ovio-ink-2)">{repo.description}</p>
      )}
      <div className="flex flex-wrap items-center gap-[22px] border-t border-(--ovio-line-2) pt-4 text-[13px] text-(--ovio-ink-2)">
        {language && (
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: language.color }} />
            {language.name}
          </span>
        )}
        {stats.map((stat) => (
          <span key={stat} className="flex items-center gap-1" aria-label={`${stat}`}>
            <span aria-hidden>{stat === "stars" ? "★" : stat === "forks" ? "⑂" : "◎"}</span>
            <RollingNumber
              className="font-(family-name:--ovio-mono) lowercase"
              value={
                stat === "stars" ? starCount : stat === "forks" ? repo.forks : (repo.issues ?? 0)
              }
              format={COMPACT}
            />
          </span>
        ))}
        {updated && (
          <span className="ml-auto text-(--ovio-faint)" suppressHydrationWarning>
            {updated}
          </span>
        )}
      </div>
    </motion.article>
  );
}
