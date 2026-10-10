"use client";

import { AnimatePresence, motion } from "motion/react";
import { TOY_PLASTIC, ToyKeyLink } from "@/components/shared/toy";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SponsorName } from "../parts";
import type { SponsorTier, SponsorWallWorldProps } from "../sponsor-wall";

/** Plastic colours: face, side, ink. */
const { blue, red, yellow, green, black, white } = TOY_PLASTIC;
const PLASTIC = [blue, red, yellow, green, black, white] as const;

const ROW: Record<SponsorTier, string> = {
  platinum: "grid grid-cols-1 gap-2.5 @sm:grid-cols-2 @sm:gap-3",
  gold: "grid grid-cols-2 gap-2 @lg:grid-cols-4 @sm:gap-2.5",
  backer: "flex flex-wrap gap-2",
};

const BLOCK: Record<SponsorTier, string> = {
  platinum:
    "h-[72px] rounded-xl text-xl font-extrabold tracking-[-0.02em] [font-stretch:118%] @md:h-[84px] @md:text-2xl",
  gold: "h-[54px] rounded-[10px] text-[15px] font-extrabold",
  backer: "rounded-full px-3 py-2 font-(family-name:--ovio-mono) text-xs font-medium",
};

const DEPTH: Record<SponsorTier, number> = { platinum: 6, gold: 5, backer: 4 };

const block = "flex items-center justify-center truncate no-underline select-none";

/** Toy: sponsors as plastic blocks hung on a pegboard. A linked block is a key that opens its site. */
export function ToySponsorWall({ groups, ctaHref, ctaLabel, className }: SponsorWallWorldProps) {
  const reduced = useReducedMotionSafe();
  const drop = useOvioTransition(motionTokens.toy.piece);

  return (
    <section
      data-ovio-world="toy"
      aria-label="Sponsors"
      className={cn(
        "@container flex w-full max-w-[620px] flex-col gap-3.5 rounded-[22px] bg-(--ovio-surface) p-3.5 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_1px_0_#fff,0_7px_0_#d2ccbf,0_22px_30px_-16px_rgba(40,28,10,.45)] @md:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1.5">
        <h3 className="m-0 text-2xl leading-none font-extrabold tracking-[-0.02em] [font-stretch:118%]">
          Sponsors
        </h3>
        {ctaHref && (
          <ToyKeyLink
            href={ctaHref}
            target="_blank"
            rel="noreferrer"
            depth={5}
            side="var(--ovio-red-deep)"
            className="rounded-[11px] bg-(--ovio-red) px-4 py-2.5 text-sm font-extrabold text-white no-underline"
          >
            {ctaLabel}
          </ToyKeyLink>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-[14px] bg-[#ebe6db] bg-[radial-gradient(circle,rgba(60,45,20,.16)_3px,transparent_3.5px)] bg-size-[20px_20px] bg-position-[4px_4px] p-3 pb-4 shadow-[inset_0_3px_6px_rgba(40,28,10,.22)] @md:p-3.5 @md:pb-[18px]">
        {groups.map((g) => (
          <ul key={g.tier} aria-label={g.label} className={cn("m-0 list-none p-0", ROW[g.tier])}>
            <AnimatePresence>
              {g.sponsors.map((s) => {
                const [face, side, ink] =
                  s.tier === "backer" ? PLASTIC[5] : PLASTIC[s.index % PLASTIC.length];
                return (
                  <motion.li
                    key={s.key}
                    layout={!reduced}
                    initial={{ opacity: 0, y: -48 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ ...drop, delay: reduced ? 0 : s.index * 0.04 }}
                    className="relative min-w-0 active:z-10"
                  >
                    {s.url ? (
                      <ToyKeyLink
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        draggable={false}
                        depth={DEPTH[s.tier]}
                        side={side}
                        className={cn(block, BLOCK[s.tier], s.tier !== "backer" && "px-2")}
                        style={{ background: face, color: ink }}
                      >
                        <SponsorName sponsor={s} />
                      </ToyKeyLink>
                    ) : (
                      <span
                        className={cn(block, BLOCK[s.tier], s.tier !== "backer" && "px-2")}
                        style={{
                          background: face,
                          color: ink,
                          boxShadow: `0 ${DEPTH[s.tier]}px 0 ${side}, 0 ${DEPTH[s.tier] * 2}px 14px -6px rgba(40,28,10,.4), inset 0 2px 0 rgba(255,255,255,.3)`,
                        }}
                      >
                        <SponsorName sponsor={s} />
                      </span>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        ))}
      </div>
    </section>
  );
}
