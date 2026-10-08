"use client";

import { motion, type Transition } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motionTokens, useOvioTransition } from "@/lib/motion";

type AutoHeightProps = {
  children: ReactNode;
  /** Classes for the content box inside the clip. */
  className?: string;
  /** Room around the content, in px, for shadows and goo the clip would otherwise cut. */
  bleed?: number;
  transition?: Transition;
};

/** Eases its height to fit its content, so wrapping text and swapped content never jump. */
export function AutoHeight({
  children,
  className,
  bleed = 0,
  transition = motionTokens.minimal.slow,
}: AutoHeightProps) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const t = useOvioTransition(transition);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ height: height === "auto" ? height : height + bleed * 2 }}
      transition={t}
      className="overflow-hidden"
      style={bleed ? { margin: -bleed, padding: bleed } : undefined}
    >
      <div ref={inner} className={className}>
        {children}
      </div>
    </motion.div>
  );
}
