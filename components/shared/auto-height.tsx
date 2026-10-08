"use client";

import { motion, type Transition } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motionTokens, useOvioTransition } from "@/lib/motion";

type AutoHeightProps = {
  children: ReactNode;
  /** Classes for the content box inside the clip. */
  className?: string;
  /** Room around the content, in px, for shadows and goo the clip would otherwise cut. */
  bleed?: number;
  transition?: Transition;
};

/** An element's border-box height, kept current by a ResizeObserver. Null until measured. */
export function useElementHeight<T extends HTMLElement>(): [RefObject<T | null>, number | null] {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, height];
}

/** Eases its height to fit its content, so wrapping text and swapped content never jump. */
export function AutoHeight({
  children,
  className,
  bleed = 0,
  transition = motionTokens.minimal.slow,
}: AutoHeightProps) {
  const [inner, height] = useElementHeight<HTMLDivElement>();
  const t = useOvioTransition(transition);

  return (
    <motion.div
      initial={false}
      animate={{ height: height === null ? "auto" : height + bleed * 2 }}
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
