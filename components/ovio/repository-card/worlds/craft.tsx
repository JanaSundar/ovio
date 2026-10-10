"use client";

import { motion } from "motion/react";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { RepositoryCardWorldProps } from "../repository-card";
import { COMPACT, formatCount, formatNumber } from "@/lib/format";

export function CraftRepositoryCard({
  repo,
  stats,
  starCount,
  language,
  className,
}: RepositoryCardWorldProps) {
  const lift = useOvioTransition(motionTokens.craft.base);

  return (
    <motion.article
      data-ovio-world="craft"
      initial={false}
      animate={{ rotate: 1.4, y: 0 }}
      whileHover={{ rotate: 0, y: -6 }}
      transition={lift}
      className={cn(
        "relative w-full max-w-[380px] rounded-(--ovio-radius) bg-(--ovio-surface) px-7 py-[26px] font-(family-name:--ovio-font) text-(--ovio-ink) shadow-(--ovio-shadow)",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -top-3 left-7 h-6 w-[84px] -rotate-4 bg-(--ovio-tape)"
      />
      {language && (
        <span
          title={language.name}
          className="absolute -top-[18px] -right-3.5 flex size-[58px] -rotate-10 items-center justify-center rounded-full text-xl font-extrabold shadow-[0_4px_10px_-3px_rgba(20,40,90,.5)]"
          style={{ background: language.color, color: language.ink }}
        >
          {language.short}
        </span>
      )}
      {/* Clear of the language badge in the corner. */}
      <div className="pr-12 text-[13px] text-(--ovio-muted) [overflow-wrap:anywhere]">
        {repo.owner} /
      </div>
      <h3 className="m-0 pr-8 text-[32px] leading-tight font-extrabold tracking-[-0.035em] [overflow-wrap:anywhere]">
        {repo.name}
      </h3>
      {repo.description && (
        <p
          title={repo.description}
          className="mt-2 mb-[18px] line-clamp-3 text-[15px] leading-[1.45] text-(--ovio-ink-2) [overflow-wrap:anywhere]"
        >
          {repo.description}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2.5">
        {stats.map((stat) =>
          stat === "stars" ? (
            <span
              key={stat}
              className="font-(family-name:--ovio-hand) text-[30px] leading-none text-(--ovio-accent-deep)"
            >
              ★ <span className="lowercase">{formatNumber(starCount, COMPACT)}</span>
            </span>
          ) : (
            <span
              key={stat}
              className="rounded-full bg-(--ovio-surface-2) px-2.5 py-[5px] text-[13px]"
            >
              {formatCount(stat === "forks" ? repo.forks : (repo.issues ?? 0), stat.slice(0, -1))}
            </span>
          ),
        )}
      </div>
    </motion.article>
  );
}
