"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { OvioProvider, useWorld } from "@/components/shared/world-provider";
import { ease, useOvioTransition, useReducedMotionSafe, worldIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** The content's height, kept current by a ResizeObserver. Null until measured (SSR, first paint). */
function useHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, height] as const;
}

const RESIZE = { duration: 0.45, ease: ease.stage };

/**
 * A demo stage: the world's backdrop around a component. Switching worlds blurs the new one in,
 * while the frame's height eases to the new world's, so the page below never jumps.
 * Retro adds CRT scanlines over the whole stage; crosshairs (site.css) mark its centre.
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
  const [ref, height] = useHeight<HTMLDivElement>();

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
            initial={reduced ? false : worldIn.initial}
            animate={worldIn.animate}
            exit={{ opacity: 0, pointerEvents: "none", transition: { duration: 0.15 } }}
            transition={worldIn.transition}
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
