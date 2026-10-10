"use client";

import { motion, useAnimationFrame, useMotionValue } from "motion/react";
import { useLayoutEffect, useRef, type FocusEvent } from "react";
import { motionTokens, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SponsorLink } from "../parts";
import type { SponsorWallWorldProps } from "../sponsor-wall";

/** Height of the credits window, in px (h-[340px] below). */
const VIEW = 340;
/** The roll moves in whole steps: STEP px every FRAME ms, like a cabinet redrawing. */
const STEP = 4;
const FRAME = 1000 / 12;

const NAME = {
  platinum: "text-[30px] text-[#c9ffd2] @md:text-[38px]",
  gold: "text-[24px] @md:text-[28px]",
  backer: "text-[20px] @md:text-[22px]",
} as const;

/**
 * Retro: end credits rolling up a CRT. Hovering the screen holds the roll;
 * tabbing to a sponsor stops it with that name centred. Reduced motion shows the credits still.
 */
export function RetroSponsorWall({ groups, ctaHref, ctaLabel, className }: SponsorWallWorldProps) {
  const reduced = useReducedMotionSafe();
  const roll = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const height = useRef(0);
  const held = useRef({ hover: false, focus: false, acc: 0 });

  useLayoutEffect(() => {
    const el = roll.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => (height.current = entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    const h = held.current;
    if (reduced || h.hover || h.focus || !height.current) return;
    h.acc += delta;
    const steps = Math.floor(h.acc / FRAME);
    if (!steps) return;
    h.acc -= steps * FRAME;
    const next = y.get() - steps * STEP;
    // Once the last line leaves the top, the credits start again from the bottom.
    y.set(next < -height.current ? VIEW : next);
  });

  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    held.current.focus = true;
    const el = e.target as HTMLElement;
    if (!reduced) y.set(Math.round(VIEW / 2 - el.offsetTop - el.offsetHeight / 2));
  };

  return (
    <section
      data-ovio-world="retro"
      aria-label="Sponsors"
      className={cn(
        "@container relative flex w-full max-w-[640px] flex-col items-center overflow-hidden bg-[#050a06] font-(family-name:--ovio-font) text-(--ovio-ink) [text-shadow:var(--ovio-glow)]",
        className,
      )}
    >
      <div
        onPointerEnter={() => (held.current.hover = true)}
        onPointerLeave={() => (held.current.hover = false)}
        onFocus={onFocus}
        onBlur={() => (held.current.focus = false)}
        // Sized in CSS, so the server renders the same still credits a reduced-motion viewer gets.
        className="h-[340px] w-full overflow-clip mask-[linear-gradient(transparent,#000_16%,#000_84%,transparent)] motion-reduce:h-auto motion-reduce:mask-none"
      >
        <motion.div
          ref={roll}
          style={{ y }}
          className="relative flex flex-col items-center gap-1.5 px-4 py-8 text-center"
        >
          <h3 className="m-0 mb-3.5 text-[34px] leading-none font-normal text-[#ffd34d] [text-shadow:0_0_10px_rgba(255,211,77,.6)] @md:text-[40px]">
            SPECIAL THANKS
          </h3>
          {groups.map((g) => (
            <section
              key={g.tier}
              aria-label={g.label}
              className="flex flex-col items-center gap-1.5 [&+&]:mt-[18px]"
            >
              <h4 className="m-0 text-xl leading-none font-normal text-(--ovio-ink-2) uppercase">
                -- {g.label} --
              </h4>
              <ul className="m-0 flex list-none flex-col items-center gap-1 p-0">
                {g.sponsors.map((s) => (
                  <li key={s.key} className="max-w-full">
                    <SponsorLink
                      sponsor={s}
                      className={cn(
                        "block leading-[1.05] break-words text-(--ovio-ink) uppercase no-underline hover:bg-(--ovio-accent) hover:text-(--ovio-on-accent) hover:[text-shadow:none]",
                        NAME[s.tier],
                      )}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="m-0 mt-6 text-2xl leading-none text-[#ffd34d]">THANK YOU FOR PLAYING</p>
        </motion.div>
      </div>
      {ctaHref && (
        <a
          href={ctaHref}
          target="_blank"
          rel="noreferrer"
          className="mb-5 flex items-baseline px-2 text-[22px] text-(--ovio-ink) uppercase no-underline hover:bg-(--ovio-accent) hover:text-(--ovio-on-accent) hover:[text-shadow:none]"
        >
          &gt; {ctaLabel}
          <motion.span
            aria-hidden
            animate={reduced ? undefined : { opacity: [1, 0] }}
            transition={motionTokens.retro.blink}
          >
            _
          </motion.span>
        </a>
      )}
      <div aria-hidden className="ovio-scanlines" />
    </section>
  );
}
