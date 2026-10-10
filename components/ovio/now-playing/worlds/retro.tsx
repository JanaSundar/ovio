"use client";

import { motion } from "motion/react";
import { steps, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { NowPlayingWorldProps } from "../now-playing";
import { EqBars, Time, useFillTransition } from "../parts";

const SEGMENTS = 24;

export function RetroNowPlaying({
  track,
  playing,
  stopped,
  progress,
  ratio,
  ticking,
  setPlaying,
  stop,
  previous,
  next,
  seekProps,
  className,
}: NowPlayingWorldProps) {
  const reduced = useReducedMotionSafe();
  const fill = useFillTransition(ticking, true);
  const scrolling = playing && !reduced;
  const marquee =
    `*** ${track.title} *** ${[track.artist, track.album].filter(Boolean).join(" · ")}`.toUpperCase();

  const keys = [
    { label: "|◀", name: "Previous", on: false, run: previous },
    { label: "▶", name: "Play", on: playing, run: () => setPlaying(true) },
    { label: "❚❚", name: "Pause", on: !playing && !stopped, run: () => setPlaying(false) },
    { label: "■", name: "Stop", on: stopped, run: stop },
    { label: "▶|", name: "Next", on: false, run: next },
  ];

  return (
    <article
      data-ovio-world="retro"
      className={cn(
        "@container w-full max-w-[460px] border-2 border-[#4a4e48] bg-[#2b2e2a] p-2.5 font-(family-name:--ovio-font) shadow-[inset_0_2px_0_#5c6159,inset_0_-2px_0_#1a1c19] @[360px]:p-3.5",
        className,
      )}
    >
      <div className="relative overflow-hidden border-2 border-[#1c2a1d] bg-(--ovio-stage) px-3 py-2.5 text-(--ovio-ink) [border-style:inset] [text-shadow:var(--ovio-glow)] @[360px]:px-3.5 @[360px]:py-3">
        <div className="flex justify-between gap-3 text-lg leading-none @[360px]:text-xl">
          <span>{playing ? "▶ PLAY" : stopped ? "■ STOP" : "❚❚ PAUSE"}</span>
          <span className="truncate">STEREO 44KHZ</span>
        </div>
        <div className="my-1.5 flex items-end justify-between gap-4">
          <Time
            seconds={progress}
            className="text-[46px] leading-none text-[#c9ffd2] @[360px]:text-[58px]"
          />
          <EqBars
            count={12}
            playing={playing}
            stepped
            className="h-[38px] min-w-0 gap-[3px] overflow-hidden @[360px]:h-[46px]"
            barClassName="w-[7px] shrink-0 bg-[repeating-linear-gradient(0deg,var(--ovio-accent)_0_4px,transparent_4px_6px)] [&:nth-child(n+7)]:hidden @[340px]:[&:nth-child(n+7)]:block"
          />
        </div>
        <div {...seekProps} className="flex h-3 cursor-pointer touch-none gap-px">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span key={i} className="relative flex-1 bg-(--ovio-surface)">
              <motion.span
                className="absolute inset-0 bg-(--ovio-accent)"
                initial={false}
                animate={{ opacity: (i + 0.5) / SEGMENTS <= ratio ? 1 : 0 }}
                transition={fill}
              />
            </span>
          ))}
        </div>
        <div className="mt-2 overflow-hidden border-t border-dashed border-(--ovio-faint) pt-1.5 text-[22px] leading-tight whitespace-nowrap @[360px]:text-2xl">
          {scrolling ? (
            <motion.div
              key={marquee}
              className="inline-block pl-[100%]"
              animate={{ x: ["0%", "-100%"] }}
              transition={{ duration: 9, ease: steps(90), repeat: Infinity }}
            >
              {marquee}
            </motion.div>
          ) : (
            <div className="truncate">{marquee}</div>
          )}
        </div>
        <div aria-hidden className="ovio-scanlines" />
      </div>
      <div className="mt-2.5 flex gap-1.5">
        {keys.map((k) => (
          <motion.button
            key={k.name}
            type="button"
            aria-label={k.name}
            aria-pressed={k.name === "Previous" || k.name === "Next" ? undefined : k.on}
            onClick={k.run}
            whileTap={{ y: 2 }}
            transition={{ duration: 0 }}
            className={cn(
              "flex-1 cursor-pointer border border-[#1a1c19] py-1.5 text-center font-(family-name:--ovio-font) text-lg leading-none shadow-[inset_0_1px_0_#5c6159]",
              k.on
                ? "bg-[#2f332e] text-(--ovio-ink) [text-shadow:var(--ovio-glow)]"
                : "bg-[#3b3f3a] text-[#c9c9c0]",
            )}
          >
            {k.label}
          </motion.button>
        ))}
      </div>
    </article>
  );
}
