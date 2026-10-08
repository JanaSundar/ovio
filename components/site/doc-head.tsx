"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";
import { AutoHeight } from "@/components/shared/auto-height";
import { COMPONENTS, pad2 } from "@/content/components";
import { ease, useReducedMotionSafe } from "@/lib/motion";

const SWAP = { duration: 0.35, ease: ease.stage };
const RESIZE = { duration: 0.45, ease: ease.stage };

/**
 * The docs page header. It lives in the docs layout so it stays mounted from one component to
 * the next: the text cross-fades and the header eases to its new height, so a longer or shorter
 * description no longer makes the page below jump.
 */
export function DocHead() {
  const slug = useSelectedLayoutSegment();
  const reduced = useReducedMotionSafe();
  const i = COMPONENTS.findIndex((c) => c.slug === slug);
  if (i < 0) return null;
  const c = COMPONENTS[i];

  // The outgoing text leaves the flow at once (popLayout), so the height eases to the new text.
  const swap = (children: ReactNode, Tag: typeof motion.div | typeof motion.span = motion.div) => (
    <AnimatePresence mode="popLayout" initial={false}>
      <Tag
        key={c.slug}
        className="block"
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.15 } }}
        transition={SWAP}
      >
        {children}
      </Tag>
    </AnimatePresence>
  );

  return (
    <section className="dochead row-12">
      <aside className="trail">
        <b>Docs / Components</b>
        {pad2(i + 1)} / {pad2(COMPONENTS.length)} <br />
        {c.name}
      </aside>
      <div className="head-main">
        <AutoHeight transition={RESIZE} bleed={8}>
          {swap(
            <>
              <p className="eyebrow">Component reference</p>
              <h1>{c.name}</h1>
              <p>{c.description}</p>
            </>,
          )}
        </AutoHeight>
      </div>
      <aside className="head-meta">
        <span className="meta-top">
          <b>Renderer</b>
          {swap(c.tech, motion.span)}
        </span>
        <span className="doc-pill">4 WORLDS</span>
      </aside>
    </section>
  );
}
