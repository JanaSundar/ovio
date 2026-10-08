"use client";

import { AnimatePresence, motion, type TargetAndTransition, type Transition } from "motion/react";
import type { ReactNode } from "react";
import { RollingNumber } from "@/components/shared/rolling-number";
import { plural } from "@/lib/format";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Crossfades content when `id` changes: the new content goes from `from` to `to`. */
export function Swap({
  id,
  from = { opacity: 0, y: 6 },
  to = { opacity: 1, y: 0 },
  transition,
  children,
  className,
}: {
  id: string;
  from?: TargetAndTransition;
  to?: TargetAndTransition;
  transition: Transition;
  children: ReactNode;
  className?: string;
}) {
  const t = useOvioTransition(transition);
  const reduced = useReducedMotionSafe();
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={id}
          initial={reduced ? false : from}
          animate={to}
          exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.12 } }}
          transition={t}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** A blinking block cursor; steady under reduced motion. */
export function Cursor({ className }: { className?: string }) {
  const reduced = useReducedMotionSafe();
  return (
    <motion.span
      aria-hidden
      className={className}
      // Same keyframes either way, so the server render matches a reduced-motion client; it rests lit.
      animate={{ opacity: [0, 1] }}
      transition={reduced ? { duration: 0 } : motionTokens.retro.blink}
    >
      █
    </motion.span>
  );
}

/** "11 commits · 3 branches", rolling as commits and branches are added. */
export function Counts({ commits, branches }: { commits: number; branches: number }) {
  return (
    <span>
      <RollingNumber value={commits} /> {plural(commits, "commit")} ·{" "}
      <RollingNumber value={branches} /> {plural(branches, "branch", "branches")}
    </span>
  );
}
