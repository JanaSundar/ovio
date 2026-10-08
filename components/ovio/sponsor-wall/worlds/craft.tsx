"use client";

import { AnimatePresence, motion } from "motion/react";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SponsorLink } from "../sponsor-link";
import type { PlacedSponsor, SponsorWallWorldProps } from "../sponsor-wall";

/** Sticker paper and ink. */
const STICKERS = [
  ["#e0713a", "#fff"],
  ["#3178c6", "#fff"],
  ["#ffe27a", "#2a1f14"],
  ["#2f9a45", "#fff"],
  ["#2a1f14", "#ffd9b8"],
  ["#f2c9a0", "#2a1f14"],
  ["#b8471f", "#fff"],
] as const;

const SIZE = {
  platinum: "px-4 py-2.5 text-lg @md:px-[22px] @md:py-3.5 @md:text-2xl",
  gold: "px-3 py-2 text-sm @md:px-4 @md:py-2.5 @md:text-base",
  backer: "px-2.5 py-1.5 text-xs",
} as const;

/**
 * Spreads each tier evenly through the run, so big stickers don't bunch up:
 * a sponsor sits at the middle of its share of the lid.
 */
function scatter(sponsors: PlacedSponsor[][]): PlacedSponsor[] {
  return sponsors
    .flatMap((tier, t) => tier.map((s, i) => ({ s, at: (i + 0.5) / tier.length + t * 0.01 })))
    .sort((a, b) => a.at - b.at)
    .map((x) => x.s);
}

const tilt = (i: number) => ((i * 37) % 24) - 12;
const nudge = (i: number) => ({ x: ((i * 29) % 9) - 4, y: ((i * 53) % 17) - 8 });

/** Craft: the sponsors as stickers slapped on a laptop lid. Hover one to press it flat. */
export function CraftSponsorWall({ groups, ctaHref, ctaLabel, className }: SponsorWallWorldProps) {
  const reduced = useReducedMotionSafe();
  const press = useOvioTransition(motionTokens.craft.base);
  const stick = useOvioTransition({ duration: 0.45, ease: [0.34, 1.6, 0.64, 1] });
  const stickers = scatter(groups.map((g) => g.sponsors));

  return (
    <section
      data-ovio-world="craft"
      aria-label="Sponsors"
      className={cn(
        "@container flex w-full max-w-[640px] flex-col items-center gap-4 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <h3 className="m-0 -rotate-2 bg-(--ovio-tape) px-4 py-0.5 font-(family-name:--ovio-hand) text-[26px] leading-tight font-bold">
        Thank you, sponsors!
      </h3>
      <div className="relative flex min-h-[220px] w-full items-center justify-center overflow-hidden rounded-[18px] bg-[linear-gradient(160deg,#d9dcdf,#b9bdc2)] px-3 py-6 shadow-[inset_0_2px_0_rgba(255,255,255,.7),0_22px_40px_-16px_rgba(40,30,20,.5)] @md:aspect-[16/9] @md:px-8 @md:py-8">
        <ul className="relative m-0 flex list-none flex-wrap items-center justify-center gap-x-1 gap-y-2 p-0 @md:gap-x-2 @md:gap-y-3">
          <AnimatePresence>
            {stickers.map((s, i) => {
              const [paper, ink] = STICKERS[s.index % STICKERS.length];
              return (
                <motion.li
                  key={s.key}
                  layout={!reduced}
                  initial={{ opacity: 0, scale: 1.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ ...stick, delay: reduced ? 0 : i * 0.07 }}
                  className="relative min-w-0 focus-within:z-10 hover:z-10"
                  style={nudge(i)}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: tilt(i), scale: 1, y: 0 }}
                    whileHover={{ rotate: 0, scale: 1.12, y: -4 }}
                    whileFocus={{ rotate: 0, scale: 1.12, y: -4 }}
                    transition={press}
                  >
                    <SponsorLink
                      sponsor={s}
                      className={cn(
                        "block max-w-full truncate border-[3px] border-white font-extrabold tracking-[-0.02em] no-underline shadow-[0_3px_6px_rgba(40,30,20,.3)]",
                        s.index % 3 === 0 ? "rounded-full" : "rounded-[10px]",
                        SIZE[s.tier],
                      )}
                      style={{ background: paper, color: ink }}
                    />
                  </motion.div>
                </motion.li>
              );
            })}
          </AnimatePresence>
          {ctaHref && (
            <motion.li
              layout={!reduced}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...stick, delay: reduced ? 0 : stickers.length * 0.07 }}
            >
              <motion.a
                href={ctaHref}
                target="_blank"
                rel="noreferrer"
                initial={false}
                animate={{ rotate: 4, y: 0 }}
                whileHover={{ rotate: 0, y: -3 }}
                whileFocus={{ rotate: 0, y: -3 }}
                transition={press}
                className="block rounded-[10px] border-2 border-dashed border-white/80 px-3 py-1 font-(family-name:--ovio-hand) text-xl leading-tight font-bold text-[#4d5156] no-underline"
              >
                + {ctaLabel}
              </motion.a>
            </motion.li>
          )}
        </ul>
      </div>
    </section>
  );
}
