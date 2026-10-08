"use client";

import { AnimatePresence, motion } from "motion/react";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SponsorLink } from "../sponsor-link";
import type { SponsorWallWorldProps } from "../sponsor-wall";

/** Weight and tracking per sponsor, so plain text reads as a row of different wordmarks. */
const MARKS = [
  [700, "-0.04em"],
  [300, "0.02em"],
  [600, "-0.02em"],
  [500, "0.12em"],
  [800, "-0.05em"],
  [400, "0em"],
] as const;

const TILE = {
  platinum: "h-[88px] text-[22px] text-(--ovio-ink) @md:h-[110px] @md:text-[26px]",
  gold: "h-16 text-[15px] text-(--ovio-ink-2) @md:h-[72px] @md:text-base",
} as const;

const COLUMNS = {
  platinum: "grid-cols-1 @sm:grid-cols-2",
  gold: "grid-cols-2 @lg:grid-cols-4",
} as const;

export function MinimalSponsorWall({
  groups,
  ctaHref,
  ctaLabel,
  className,
}: SponsorWallWorldProps) {
  const reduced = useReducedMotionSafe();
  const transition = useOvioTransition(motionTokens.minimal.slow);
  const tiles = groups.filter((g) => g.tier !== "backer");
  const backers = groups.find((g) => g.tier === "backer");

  // The same initial state on server and client; reduced motion just makes the entrance instant.
  const enter = (i: number) => ({
    layout: !reduced,
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { ...transition, delay: reduced ? 0 : i * 0.05 },
  });

  return (
    <section
      data-ovio-world="minimal"
      aria-label="Sponsors"
      className={cn(
        "@container flex w-full max-w-[640px] flex-col gap-[22px] rounded-(--ovio-radius) border border-(--ovio-line) bg-(--ovio-surface) px-5 py-7 font-(family-name:--ovio-font) text-(--ovio-ink) @md:px-10 @md:py-9",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="m-0 text-[11px] font-normal tracking-[0.12em] text-(--ovio-muted) uppercase">
          Sponsors
        </h3>
        {ctaHref && (
          <a
            href={ctaHref}
            target="_blank"
            rel="noreferrer"
            className="group text-[13px] text-(--ovio-ink) no-underline"
          >
            {ctaLabel}{" "}
            <span
              aria-hidden
              className="inline-block transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
        )}
      </div>

      {tiles.length > 0 && (
        // Tiers share their rules: each cell draws its right and bottom edge, the frame clips the outer ones.
        <div className="overflow-hidden border border-(--ovio-line)">
          {tiles.map((g) => (
            <ul
              key={g.tier}
              aria-label={g.label}
              className={cn(
                "-mr-px -mb-px grid list-none p-0 [&+&]:border-t [&+&]:border-(--ovio-line)",
                COLUMNS[g.tier as keyof typeof COLUMNS],
              )}
            >
              <AnimatePresence>
                {g.sponsors.map((s) => {
                  const [weight, tracking] = MARKS[s.index % MARKS.length];
                  return (
                    <motion.li
                      key={s.key}
                      {...enter(s.index)}
                      className="min-w-0 border-r border-b border-(--ovio-line)"
                    >
                      <SponsorLink
                        sponsor={s}
                        className={cn(
                          "flex items-center justify-center truncate px-3 no-underline transition-colors duration-200 hover:bg-(--ovio-stage) hover:text-(--ovio-ink)",
                          TILE[g.tier as keyof typeof TILE],
                        )}
                        style={{ fontWeight: weight, letterSpacing: tracking }}
                      />
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          ))}
        </div>
      )}

      {backers && (
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 text-[13px] text-(--ovio-muted)">
          <h4 className="m-0 text-[13px] font-normal text-(--ovio-ink)">{backers.label}</h4>
          <ul className="m-0 contents list-none p-0">
            <AnimatePresence>
              {backers.sponsors.map((s) => (
                <motion.li key={s.key} {...enter(s.index)}>
                  <SponsorLink
                    sponsor={s}
                    className="text-inherit no-underline transition-colors duration-200 hover:text-(--ovio-ink)"
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </section>
  );
}
