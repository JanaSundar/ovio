"use client";

import { motion } from "motion/react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { ToyKey } from "@/components/shared/toy";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { RepositoryCardWorldProps } from "../repository-card";
import { formatNumber } from "@/lib/format";

const keyClass =
  "flex items-center justify-center gap-2 rounded-xl border-0 px-2.5 py-3.5 font-(family-name:--ovio-font) text-base font-extrabold text-(--ovio-ink)";

export function ToyRepositoryCard({
  repo,
  stats,
  starred,
  starCount,
  toggleStar,
  language,
  className,
}: RepositoryCardWorldProps) {
  const led = useOvioTransition(motionTokens.minimal.fast);
  const counts = stats.filter((s) => s !== "stars");

  return (
    <article
      data-ovio-world="toy"
      className={cn(
        "flex w-full max-w-[400px] flex-col gap-3.5 rounded-[22px] bg-(--ovio-surface) p-3.5 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_1px_0_#fff,0_7px_0_#d2ccbf,0_22px_30px_-16px_rgba(40,28,10,.45)]",
        className,
      )}
    >
      <div className="relative rounded-(--ovio-radius) bg-(--ovio-accent) px-5 pt-[18px] pb-5 text-white shadow-[inset_0_-4px_0_rgba(0,0,0,.2),inset_0_2px_0_rgba(255,255,255,.2)]">
        {/* Clear of the two dots in the corner. */}
        <div className="pr-10 font-(family-name:--ovio-mono) text-[11px] tracking-[0.08em] uppercase [overflow-wrap:anywhere]">
          {repo.owner} /
        </div>
        <h3
          className="m-0 mt-1 leading-none font-extrabold tracking-[-0.03em] [overflow-wrap:anywhere]"
          // 46px fits about eleven letters on the plate; longer names step down to 28px, then wrap.
          style={{
            fontStretch: "118%",
            fontSize: Math.round(Math.max(28, Math.min(46, (46 * 11) / repo.name.length))),
          }}
        >
          {repo.name}
        </h3>
        <div aria-hidden className="absolute top-3.5 right-3.5 flex gap-1.5">
          <span className="size-[11px] rounded-full bg-(--ovio-accent-deep) shadow-[inset_0_2px_2px_rgba(0,0,0,.4)]" />
          <span className="size-[11px] rounded-full bg-(--ovio-accent-deep) shadow-[inset_0_2px_2px_rgba(0,0,0,.4)]" />
        </div>
      </div>
      {repo.description && (
        <p
          title={repo.description}
          className="mx-1.5 my-0 line-clamp-3 text-sm leading-[1.45] text-(--ovio-ink-2) [overflow-wrap:anywhere]"
        >
          {repo.description}
        </p>
      )}
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_64px] items-stretch gap-2.5">
        {stats.includes("stars") && (
          <ToyKey
            depth={6}
            side="var(--ovio-yellow-deep)"
            aria-pressed={starred}
            aria-label={starred ? "Unstar" : "Star"}
            onClick={toggleStar}
            className={cn(keyClass, "bg-(--ovio-yellow)")}
          >
            <motion.span
              aria-hidden
              className="size-2 rounded-full shadow-[inset_0_1px_1px_rgba(0,0,0,.3)]"
              animate={{ backgroundColor: starred ? "#ef4f2b" : "#9c7414" }}
              transition={led}
            />
            ★ <RollingNumber value={starCount} />
          </ToyKey>
        )}
        {counts.slice(0, 1).map((stat) => (
          <span
            key={stat}
            className={cn(keyClass, "bg-white shadow-[0_6px_0_#cfc8b8]")}
            aria-label={`${stat === "forks" ? repo.forks : (repo.issues ?? 0)} ${stat}`}
          >
            {stat === "forks" ? "⑂" : "◎"}{" "}
            {formatNumber(stat === "forks" ? repo.forks : (repo.issues ?? 0))}
          </span>
        ))}
        <div className="flex items-center justify-center rounded-xl bg-[#e6e1d6] shadow-[inset_0_3px_5px_rgba(40,28,10,.25)]">
          {language && (
            <span
              title={language.name}
              aria-label={language.name}
              role="img"
              className="flex size-[38px] items-center justify-center rounded-full bg-(--ovio-accent) text-[13px] font-extrabold text-white shadow-[0_4px_0_var(--ovio-accent-deep),0_8px_10px_-4px_rgba(40,28,10,.4)]"
            >
              {language.short}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
