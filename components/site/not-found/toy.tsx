"use client";

import { animate, motion, useMotionValue } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

const DROP = { type: "spring", stiffness: 260, damping: 13 } as const;
const SNAP = { type: "spring", stiffness: 320, damping: 20 } as const;

/**
 * Toy: 404 knocked over on the pegboard, the 0 rolled away. Drag it back between the 4s and the
 * blocks stand up again; the big key takes you home.
 */
export function ToyNotFound() {
  const reduced = useReducedMotionSafe();
  const board = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const zero = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [fixed, setFixed] = useState(false);

  const onDragEnd = () => {
    // Both rects are in viewport coordinates, so this holds however far the page is scrolled.
    const s = slot.current!.getBoundingClientRect();
    const z = zero.current!.getBoundingClientRect();
    const dx = s.left + s.width / 2 - (z.left + z.width / 2);
    const dy = s.top + s.height / 2 - (z.top + z.height / 2);
    if (Math.hypot(dx, dy) < s.width * 0.75) {
      // Drop it into the gap: move by the distance between the two centres.
      animate(x, x.get() + dx, SNAP);
      animate(y, y.get() + dy, SNAP);
      setFixed(true);
    } else {
      animate(x, 0, SNAP);
      animate(y, 0, SNAP);
    }
  };

  // Blocks fall onto the board one after another.
  const enter = reduced ? false : { y: "-120%", opacity: 0 };

  return (
    <div className="nf-toy" ref={board}>
      <div className="nf-floor" aria-hidden />
      <div ref={slot} className={fixed ? "nf-slot done" : "nf-slot"} aria-hidden />
      <motion.div
        className="nf-blk four a"
        initial={enter}
        animate={{ y: 0, opacity: 1, rotate: fixed ? 0 : -8 }}
        transition={{ ...DROP, delay: 0 }}
      >
        4
      </motion.div>
      <motion.div
        className="nf-blk four b"
        initial={enter}
        animate={{ y: 0, opacity: 1, rotate: fixed ? 0 : 14 }}
        transition={{ ...DROP, delay: fixed ? 0 : 0.12 }}
      >
        4
      </motion.div>
      <motion.div
        ref={zero}
        className="nf-blk zero"
        style={{ x, y }}
        initial={reduced ? false : { opacity: 0, rotate: -200 }}
        animate={{ opacity: 1, rotate: fixed ? 0 : 24 }}
        transition={{ ...DROP, delay: 0.24 }}
        drag={!fixed}
        dragConstraints={board}
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        whileDrag={{ scale: 1.08, cursor: "grabbing" }}
        aria-label="The 0 block. Drag it back between the 4s."
        role="img"
      >
        0
      </motion.div>
      <span className="nf-hint" aria-hidden>
        {fixed ? "good as new!" : "drag me back!"}
      </span>
      <Link href="/" className="nf-key">
        <span>TAKE ME HOME</span>
      </Link>
    </div>
  );
}
