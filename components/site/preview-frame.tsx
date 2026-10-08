"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useElementHeight } from "@/components/shared/auto-height";
import { OvioProvider, useWorld } from "@/components/shared/world-provider";
import { ease, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";

const RESIZE = { duration: 0.45, ease: ease.stage };

/**
 * The incoming world fades and settles in. Opacity and transform only, so it stays on the
 * compositor: a blur over the whole stage re-rasterised every frame and dropped frames.
 */
const STAGE_IN = {
  initial: { opacity: 0, scale: 0.985, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { duration: 0.5, ease: ease.stage },
} as const;

/**
 * A demo stage: the world's backdrop around a component. Switching worlds fades the new one in,
 * while the frame's height eases to the new world's, so the page below never jumps.
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
  const resize = useOvioTransition(RESIZE);
  const [ref, height] = useElementHeight<HTMLDivElement>();

  return (
    <motion.div
      className={cn("stage-frame relative box-content overflow-hidden", className)}
      initial={false}
      animate={{ height: height ?? "auto" }}
      transition={resize}
    >
      {/* popLayout takes the outgoing world out of flow, so this measures the incoming one. */}
      <div ref={ref} className="relative flex" style={{ minHeight }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={world}
            data-ovio-world={world}
            className="ovio-stage relative flex min-w-0 flex-1 items-center justify-center bg-(--ovio-stage) px-3 py-6 sm:px-8 sm:py-12"
            initial={reduced ? false : STAGE_IN.initial}
            animate={STAGE_IN.animate}
            exit={{ opacity: 0, pointerEvents: "none", transition: { duration: 0.15 } }}
            transition={STAGE_IN.transition}
          >
            {/* Pins the world, so the outgoing stage keeps rendering its own world while it fades. */}
            <OvioProvider world={world}>{children}</OvioProvider>
            {world === "retro" && <div aria-hidden className="ovio-scanlines" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
