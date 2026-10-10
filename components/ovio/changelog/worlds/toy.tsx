"use client";

import { motion } from "motion/react";
import { ToyKey } from "@/components/shared/toy";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  TYPE_LABEL,
  type ChangeType,
  type ChangelogEntry,
  type ChangelogWorldProps,
} from "../changelog";

/** Version chip colours, in turn: [plastic, ink]. */
const CHIPS = [
  ["var(--ovio-red)", "#fff"],
  ["var(--ovio-yellow)", "var(--ovio-ink)"],
  ["var(--ovio-accent)", "#fff"],
  ["#33b07a", "#fff"],
];
const TYPE_CHIP: Record<ChangeType, string> = {
  added: "#33b07a",
  fixed: "var(--ovio-accent)",
  changed: "var(--ovio-red)",
};

/**
 * Toy: each release is a raised plastic key. Keys drop into the tray on a loose spring;
 * press one and it opens on a slide spring to show its notes (one open at a time).
 */
export function ToyChangelog({ releases, open, toggle, className }: ChangelogWorldProps) {
  const reduced = useReducedMotionSafe();
  const drop = useOvioTransition(motionTokens.toy.piece);
  const slide = useOvioTransition(motionTokens.toy.slide);

  return (
    <section
      data-ovio-world="toy"
      aria-label="Changelog"
      className={cn(
        "flex w-full max-w-[500px] flex-col gap-3 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2
          className="m-0 text-[26px] font-extrabold tracking-[-0.02em]"
          style={{ fontStretch: "118%" }}
        >
          Changelog
        </h2>
        <span
          aria-hidden
          className="font-(family-name:--ovio-mono) text-[11px] tracking-[0.08em] text-(--ovio-muted)"
        >
          PRESS TO OPEN
        </span>
      </div>
      {/*
        The list sits over an invisible sizer: every header plus every release's notes stacked in one
        grid cell, so the component is always as tall as its tallest open state. Opening or closing a
        release moves the keys inside, never the page around it.
      */}
      <div className="relative">
        <div aria-hidden className="invisible flex flex-col gap-3">
          {releases.map((r, i) => (
            <div key={r.version}>
              <Header release={r} index={i} />
              {i === releases.length - 1 && (
                <div className="grid">
                  {releases.map((rr) => (
                    <Notes key={rr.version} release={rr} className="[grid-area:1/1]" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <ol className="absolute inset-x-0 top-0 m-0 flex list-none flex-col gap-3 p-0">
          {releases.map((r, i) => {
            const isOpen = open === i;
            return (
              <motion.li
                key={r.version}
                initial={reduced ? false : { opacity: 0, y: -48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  y: { ...drop, delay: i * 0.05 },
                  opacity: { duration: reduced ? 0 : 0.2, delay: i * 0.05 },
                }}
              >
                <ToyKey
                  depth={6}
                  side="var(--ovio-line)"
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                  className="block w-full cursor-pointer rounded-2xl border-0 bg-(--ovio-surface) p-0 text-left font-[inherit] text-(--ovio-ink) touch-manipulation"
                >
                  <Header release={r} index={i} />
                  <motion.span
                    aria-hidden={!isOpen}
                    className="block overflow-hidden"
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={slide}
                  >
                    <Notes release={r} />
                  </motion.span>
                </ToyKey>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

type RowProps = { release: ChangelogEntry; index: number };

function Header({ release: r, index }: RowProps) {
  const [chip, chipInk] = CHIPS[index % CHIPS.length];
  return (
    <span className="flex items-center gap-3 px-3.5 py-3">
      <span
        className="rounded-[9px] px-2.5 py-1.5 text-sm font-extrabold shadow-[inset_0_-3px_0_rgba(0,0,0,.2)]"
        style={{ background: chip, color: chipInk, fontStretch: "110%" }}
      >
        v{r.version}
      </span>
      <span className="min-w-0 flex-1 text-base font-bold">{r.title}</span>
      <time
        dateTime={r.dateTime}
        className="font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)"
      >
        {r.date}
      </time>
    </span>
  );
}

function Notes({ release: r, className }: { release: ChangelogEntry; className?: string }) {
  return (
    <span className={cn("flex flex-col gap-1 px-4 pt-0.5 pb-3.5", className)}>
      {r.items.map((item, j) => (
        <span key={`${j}:${item.text}`} className="text-sm leading-[1.45] text-(--ovio-ink-2)">
          {item.type ? (
            <span
              className="mr-1.5 rounded-[5px] px-1.5 py-px align-[1px] font-(family-name:--ovio-mono) text-[11px] font-semibold tracking-[0.06em] text-white uppercase"
              style={{ background: TYPE_CHIP[item.type] }}
            >
              {TYPE_LABEL[item.type]}
            </span>
          ) : (
            <span aria-hidden>+ </span>
          )}
          {item.text}
        </span>
      ))}
    </span>
  );
}
