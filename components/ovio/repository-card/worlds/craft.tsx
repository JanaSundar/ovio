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
  return (
    <article
      data-ovio-world="craft"
      className={cn(
        "relative w-full max-w-95 rounded-(--ovio-radius) bg-(--ovio-surface) px-7 py-6.5 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-(--ovio-shadow) rotate-[1.4deg] transition-[rotate,translate] duration-300 ease-[cubic-bezier(.34,1.5,.5,1)] motion-reduce:transition-none hover:-translate-y-1.5 hover:rotate-0",
        className,
      )}
    >
      <span aria-hidden className="absolute -top-3 left-7 h-6 w-21 -rotate-4 bg-(--ovio-tape)" />
      {language && (
        <span
          title={language.name}
          className="absolute -top-4.5 -right-3.5 flex size-14.5 -rotate-10 items-center justify-center rounded-full text-xl font-extrabold shadow-[0_4px_10px_-3px_rgba(20,40,90,.5)]"
          style={{ background: language.color, color: language.ink }}
        >
          {language.short}
        </span>
      )}
      {/* Clear of the language badge in the corner. */}
      <div className="pr-12 text-[13px] text-(--ovio-muted) wrap-anywhere">{repo.owner} /</div>
      <h3 className="m-0 pr-8 text-[32px] leading-tight font-extrabold tracking-[-0.035em] wrap-anywhere">
        {repo.name}
      </h3>
      {repo.description && (
        <p
          title={repo.description}
          className="mt-2 mb-4.5 line-clamp-3 text-[15px] leading-[1.45] text-(--ovio-ink-2) wrap-anywhere"
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
              className="rounded-full bg-(--ovio-surface-2) px-2.5 py-1.25 text-[13px]"
            >
              {formatCount(stat === "forks" ? repo.forks : (repo.issues ?? 0), stat.slice(0, -1))}
            </span>
          ),
        )}
      </div>
    </article>
  );
}
