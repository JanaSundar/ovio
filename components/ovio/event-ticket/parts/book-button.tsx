"use client";

import { AnimatePresence, motion, type Transition } from "motion/react";
import { useId, useState } from "react";
import { GooFilter } from "@/components/shared/goo-filter";
import { ToyKey } from "@/components/shared/toy";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type GooBookLook = {
  pill: string;
  knob: string;
  /** Classes for the label and arrow on the pill and knob. */
  label: string;
  arrow: string;
  /** Corner radius of the pill at rest. */
  radius: number;
  transition: Transition;
};

/** Blobs that orbit out of the bead while the booking is sent. */
const DROPS = [
  { x: -58, y: -10, delay: 0 },
  { x: 52, y: 18, delay: 0.15 },
  { x: 6, y: -50, delay: 0.3 },
  { x: -12, y: 48, delay: 0.45 },
];

/** Hover pulls the knob out to the pill's top-right corner, half outside it. */
const HOVER_POP = { x: 30, y: -34 };

/**
 * The goo book button. Hover pulls the knob out over the pill's corner on goo; pressing it shrinks
 * the pill into a bead that swallows the knob, and droplets orbit it until the booking lands.
 */
export function GooBookButton({ sending, look }: { sending: boolean; look: GooBookLook }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reduced = useReducedMotionSafe();
  const transition = useOvioTransition(look.transition);
  const pop = useOvioTransition(motionTokens.craft.base);
  const [hover, setHover] = useState(false);
  const knob = hover && !sending ? HOVER_POP : { x: 0, y: 0 };

  return (
    <motion.button
      type="submit"
      aria-label="Book your spot"
      aria-busy={sending}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className="relative block h-24 w-full cursor-pointer border-0 bg-transparent p-0 text-left"
    >
      <GooFilter id={id} crisp />
      <div aria-hidden className="absolute inset-0" style={{ filter: `url(#${id})` }}>
        <motion.div
          layout
          transition={transition}
          className={cn(
            "absolute inset-y-0",
            sending ? "left-[calc(50%-48px)] w-24" : "inset-x-0",
            look.pill,
          )}
          initial={false}
          animate={{ borderRadius: sending ? 48 : look.radius }}
        />
        <motion.div
          layout
          className={cn(
            "absolute top-5 size-14 rounded-full",
            sending ? "right-[calc(50%-28px)]" : "right-4",
            look.knob,
          )}
          initial={false}
          animate={knob}
          transition={{ default: pop, layout: transition }}
        />
        {sending &&
          !reduced &&
          DROPS.map((d, i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute top-1/2 left-1/2 -m-[15px] size-[30px] rounded-full",
                look.pill,
              )}
              initial={{ x: 0, y: 0, scale: 0.5 }}
              animate={{ x: [0, d.x, 0], y: [0, d.y, 0], scale: [0.5, 1, 0.5] }}
              transition={{
                duration: 0.9,
                ease: [0.5, 0, 0.5, 1],
                repeat: Infinity,
                delay: d.delay,
              }}
            />
          ))}
      </div>
      <motion.span
        aria-hidden
        className={cn("absolute top-1/2 left-[18px] -translate-y-1/2", look.label)}
        initial={false}
        animate={{ opacity: sending ? 0 : 1 }}
      >
        Book
        <br />
        your spot
      </motion.span>
      <motion.span
        aria-hidden
        className={cn(
          "absolute top-5 right-4 flex size-14 items-center justify-center text-[26px]",
          look.arrow,
        )}
        initial={false}
        animate={{ ...knob, opacity: sending ? 0 : 1 }}
        transition={pop}
      >
        ↗
      </motion.span>
    </motion.button>
  );
}

const TOY_POP = { x: 26, y: -30 };

/**
 * Toy: a red plastic key with a blue knob. Hover springs the knob out to the key's corner, the red
 * plastic stretching after it under the goo filter. While sending, three pegs hop in turn.
 */
export function ToyBookButton({ sending }: { sending: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reduced = useReducedMotionSafe();
  const swap = useOvioTransition(motionTokens.minimal.base);
  const spring = useOvioTransition(motionTokens.toy.piece);
  const [hover, setHover] = useState(false);
  const knob = hover && !sending ? TOY_POP : { x: 0, y: 0 };

  return (
    <ToyKey
      type="submit"
      depth={6}
      side="var(--ovio-red-deep)"
      aria-label="Book your spot"
      aria-busy={sending}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className="relative flex h-[88px] w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border-0 bg-(--ovio-red) py-0 pr-4 pl-5 text-left font-(family-name:--ovio-font) text-[22px] leading-[1.05] font-extrabold tracking-[-0.035em] text-white touch-manipulation"
    >
      <GooFilter id={id} crisp />
      <div aria-hidden className="absolute inset-0" style={{ filter: `url(#${id})` }}>
        <div className="absolute inset-0 rounded-2xl bg-(--ovio-red)" />
        <motion.div
          className="absolute top-[14px] right-[10px] size-[60px] rounded-full bg-(--ovio-red)"
          initial={false}
          animate={knob}
          transition={spring}
        />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {sending ? (
          <motion.span
            key="sending"
            aria-hidden
            className="relative flex gap-2"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={swap}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-3.5 rounded-full bg-white shadow-[0_3px_0_var(--ovio-red-deep)]"
                animate={reduced ? undefined : { y: [0, -9, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12, ease: "easeOut" }}
              />
            ))}
          </motion.span>
        ) : (
          <motion.span
            key="label"
            aria-hidden
            className="relative"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={swap}
          >
            Book
            <br />
            your spot
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span
        aria-hidden
        className="relative flex size-12 flex-none items-center justify-center rounded-full bg-(--ovio-accent) text-2xl shadow-[inset_0_-3px_0_var(--ovio-accent-deep),0_2px_0_rgba(0,0,0,.2)]"
        initial={false}
        animate={{ ...knob, rotate: sending && !reduced ? 360 : 0 }}
        transition={{
          default: spring,
          rotate: sending ? { duration: 0.9, ease: "linear", repeat: Infinity } : { duration: 0 },
        }}
      >
        ↗
      </motion.span>
    </ToyKey>
  );
}
