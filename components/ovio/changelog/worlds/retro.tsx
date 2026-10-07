"use client";

import { motion } from "motion/react";
import { motionTokens, steps, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  TYPE_LABEL,
  type ChangeType,
  type ChangelogEntry,
  type ChangelogWorldProps,
} from "../changelog";

const PROMPT = "$ git log --oneline --decorate";
const MARK: Record<ChangeType, string> = { added: "+", fixed: "*", changed: "~" };

/** Seconds per typed character: the prompt is typed by hand, the log prints faster. */
const TYPE_RATE = 0.025;
const PRINT_RATE = 0.008;
/** Gap before each printed line. */
const LINE_GAP = 0.06;

type Line = ReturnType<typeof typed> | ReturnType<typeof printed>;

/** A line that types out: monospace text, so a clip stepped once per character reveals it letter by letter. */
const typed = (text: string, delay: number, duration: number) => ({
  initial: { clipPath: "inset(0 100% 0 0)" },
  animate: { clipPath: "inset(0 0% 0 0)" },
  transition: { duration, delay, ease: steps(Math.max(1, text.length)) },
});

/** A line that appears whole, in one frame. */
const printed = (delay: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { ...motionTokens.retro.frames(1, 0.01), delay },
});

/** One schedule for every line, so each starts when the one above has finished. */
function schedule(releases: ChangelogEntry[]) {
  let clock = 0.15;
  const type = (text: string, rate: number) => {
    const duration = Math.min(0.75, text.length * rate);
    const line = typed(text, clock, duration);
    clock += duration + LINE_GAP;
    return line;
  };
  const print = () => {
    const line = printed(clock);
    clock += LINE_GAP;
    return line;
  };

  const prompt = type(PROMPT, TYPE_RATE);
  const lines = releases.map((r) => ({
    head: type(`${r.hash} (tag: v${r.version}) ${r.kind}: ${r.title.toUpperCase()}`, PRINT_RATE),
    items: r.items.map(print),
  }));
  return { prompt, lines, cursor: print() };
}

/**
 * Retro: `git log` in a phosphor terminal. The command types out a character at a time,
 * then each release prints in hard steps, its notes one frame after another, and the cursor blinks.
 */
export function RetroChangelog({ releases, className }: ChangelogWorldProps) {
  const reduced = useReducedMotionSafe();
  const plan = schedule(releases);
  // Under reduced motion every line is simply there.
  const line = (l: Line) => (reduced ? {} : l);

  return (
    <section
      data-ovio-world="retro"
      aria-label="Changelog"
      className={cn(
        "relative w-full max-w-[680px] overflow-hidden bg-(--ovio-stage) px-8 py-7 font-(family-name:--ovio-font) text-[21px] leading-[1.25] text-(--ovio-ink) [text-shadow:var(--ovio-glow)]",
        className,
      )}
    >
      <motion.div className="text-[#c9ffd2]" {...line(plan.prompt)}>
        {PROMPT}
      </motion.div>
      <ol className="m-0 list-none p-0">
        {releases.map((r, i) => (
          <li key={r.version} className="mt-2.5">
            <motion.h3
              className="m-0 text-[length:inherit] font-normal"
              {...line(plan.lines[i].head)}
            >
              <span className="text-[#ffd34d]">{r.hash}</span>{" "}
              <span className="text-(--ovio-ink-2)">
                (tag: v{r.version}
                <time dateTime={r.dateTime} className="sr-only">
                  , {r.date}
                </time>
                )
              </span>{" "}
              {r.kind}: {r.title.toUpperCase()}
            </motion.h3>
            <ul className="m-0 list-none p-0">
              {r.items.map((item, j) => (
                <motion.li
                  key={item.text}
                  className="pl-6 text-(--ovio-ink-2)"
                  {...line(plan.lines[i].items[j])}
                >
                  <span aria-hidden>{item.type ? MARK[item.type] : "+"} </span>
                  {item.type && <span className="sr-only">{TYPE_LABEL[item.type]}: </span>}
                  {item.text}
                </motion.li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <motion.div aria-hidden className="mt-3 text-[#c9ffd2]" {...line(plan.cursor)}>
        ${" "}
        <motion.span
          animate={reduced ? undefined : { opacity: [1, 0] }}
          transition={motionTokens.retro.blink}
        >
          █
        </motion.span>
      </motion.div>
      <div aria-hidden className="ovio-scanlines" />
    </section>
  );
}
