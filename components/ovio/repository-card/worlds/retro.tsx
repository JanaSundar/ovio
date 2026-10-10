"use client";

import { motion } from "motion/react";
import { motionTokens, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { RepositoryCardWorldProps } from "../repository-card";
import { dots, formatNumber } from "@/lib/format";

const LABEL: Record<string, string> = { stars: "STARS", forks: "FORKS", issues: "ISSUES" };

export function RetroRepositoryCard({
  repo,
  stats,
  starCount,
  language,
  className,
}: RepositoryCardWorldProps) {
  const reduced = useReducedMotionSafe();
  const lines = [
    ...stats.map((stat) => ({
      label: LABEL[stat],
      value: stat === "stars" ? starCount : stat === "forks" ? repo.forks : (repo.issues ?? 0),
    })),
  ];

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
      className={cn(
        "w-full max-w-[420px] border-4 border-double border-(--ovio-accent) font-(family-name:--ovio-font) text-(--ovio-ink) [text-shadow:var(--ovio-glow)]",
        className,
      )}
    >
      <div className="flex justify-between bg-(--ovio-accent) px-2.5 py-1 text-xl text-(--ovio-on-accent) [text-shadow:none]">
        <span>REPO.EXE</span>
        <span aria-hidden>[X]</span>
      </div>
      <div className="px-[18px] py-4 text-[22px] leading-[1.2]">
        <h3 className="m-0 font-normal [overflow-wrap:anywhere]">
          &gt; {repo.owner.toUpperCase()}/{repo.name.toUpperCase()}
          <motion.span
            aria-hidden
            animate={reduced ? undefined : { opacity: [1, 0] }}
            transition={motionTokens.retro.blink}
          >
            _
          </motion.span>
        </h3>
        {repo.description && (
          <motion.p
            title={repo.description}
            className="mt-2 mb-3.5 line-clamp-4 text-(--ovio-ink-2) uppercase [overflow-wrap:anywhere]"
            {...line(0)}
          >
            {repo.description.replace(/\.$/, "")}
          </motion.p>
        )}
        {lines.map((l, i) => (
          <motion.div key={l.label} {...line(i + 1)}>
            {dots(l.label)}
            {formatNumber(l.value)}
          </motion.div>
        ))}
        {language && (
          <motion.div {...line(lines.length + 1)}>
            {dots("LANG")}
            {language.short}
          </motion.div>
        )}
      </div>
    </article>
  );
}
