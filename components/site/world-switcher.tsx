"use client";

import { motion } from "motion/react";
import { useId, useRef, type KeyboardEvent } from "react";
import { GooFilter } from "@/components/ovio/gooey-tabs/goo";
import { WORLD_INFO } from "@/content/worlds";
import { keyToIndex } from "@/lib/keys";
import { ease, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useSiteWorld } from "./site-world";

/** The site's world picker: a goo tab bar whose indicator stretches between worlds. */
export function WorldSwitcher({
  showKeys = false,
  className,
}: {
  showKeys?: boolean;
  className?: string;
}) {
  const { world, setWorld } = useSiteWorld();
  const reduced = useReducedMotionSafe();
  const filterId = `site-goo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = WORLD_INFO.findIndex((w) => w.id === world);
  const left = `${index * 25}%`;
  const trail = [0.4, 0.6, 0.8].map((duration) =>
    reduced ? { duration: 0 } : { duration, ease: ease.glide },
  );

  const onKeyDown = (e: KeyboardEvent) => {
    const next = keyToIndex(e.key, index, WORLD_INFO.length, { wrap: true });
    if (next === null) return;
    e.preventDefault();
    setWorld(WORLD_INFO[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div className={cn("relative rounded-[14px] bg-paper-2 p-1", className)}>
      <GooFilter id={filterId} blur={9} />
      <div aria-hidden className="absolute inset-1" style={{ filter: `url(#${filterId})` }}>
        {[
          { top: "0%", width: "25%", ml: "0%", r: "10px" },
          { top: "12%", width: "20%", ml: "2.5%", r: "999px" },
          { top: "26%", width: "12%", ml: "6.5%", r: "999px" },
        ].map((b, j) => (
          <motion.div
            key={j}
            className="absolute bg-ink"
            initial={false}
            animate={{ left }}
            transition={trail[j]}
            style={{
              top: b.top,
              bottom: b.top,
              width: b.width,
              marginLeft: b.ml,
              borderRadius: b.r,
            }}
          />
        ))}
      </div>
      <div
        role="tablist"
        aria-label="Design world"
        onKeyDown={onKeyDown}
        className="relative grid grid-cols-4"
      >
        {WORLD_INFO.map((w, i) => {
          const active = w.id === world;
          return (
            <motion.button
              key={w.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              type="button"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setWorld(w.id)}
              className={cn(
                "flex cursor-pointer items-baseline justify-center gap-2 rounded-[9px] border-0 bg-transparent px-1 leading-none",
                showKeys ? "py-[11px]" : "py-2.5",
              )}
              initial={false}
              animate={{ color: active ? "#f5f4f0" : "#4a4944" }}
              transition={reduced ? { duration: 0 } : { duration: 0.25, delay: 0.12 }}
            >
              {showKeys && <span className="font-mono text-[10px] opacity-50">{i + 1}</span>}
              <span
                style={{
                  fontFamily: w.font,
                  fontSize: showKeys ? w.size : `calc(${w.size} - 1px)`,
                  letterSpacing: w.tracking,
                  fontWeight: showKeys ? undefined : w.weight === 800 ? 700 : w.weight,
                }}
              >
                {w.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
