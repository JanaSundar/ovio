"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useWorld } from "@/components/shared/world-provider";
import { useReducedMotionSafe, worldIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * A demo stage: the world's backdrop around a component. Switching worlds blurs the new one in.
 * Retro adds CRT scanlines over the whole stage.
 */
export function PreviewFrame({
  children,
  minHeight = 400,
  className,
}: {
  children: ReactNode;
  minHeight?: number;
  className?: string;
}) {
  const world = useWorld();
  const reduced = useReducedMotionSafe();

  return (
    <div
      className={cn("relative flex overflow-hidden rounded-2xl border border-line", className)}
      style={{ minHeight }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={world}
          data-ovio-world={world}
          className="ovio-stage relative flex flex-1 items-center justify-center bg-(--ovio-stage) px-5 py-9 sm:px-8 sm:py-12"
          initial={reduced ? false : worldIn.initial}
          animate={worldIn.animate}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={worldIn.transition}
        >
          {children}
          {world === "retro" && <div aria-hidden className="ovio-scanlines" />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
