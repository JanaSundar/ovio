"use client";

import { AnimatePresence, motion } from "motion/react";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { NowPlayingWorldProps } from "../now-playing";
import { Artwork, EqBars, Time, useFillTransition } from "../parts";

export function MinimalNowPlaying({
  track,
  playing,
  progress,
  ratio,
  ticking,
  togglePlay,
  seekProps,
  className,
}: NowPlayingWorldProps) {
  const fast = useOvioTransition(motionTokens.minimal.base);
  const fill = useFillTransition(ticking);

  return (
    <article
      data-ovio-world="minimal"
      className={cn(
        "@container w-full max-w-[440px] rounded-(--ovio-radius) border border-(--ovio-line) bg-(--ovio-surface) p-4 font-(family-name:--ovio-font) text-(--ovio-ink) @[360px]:p-5",
        className,
      )}
    >
      <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 @[360px]:grid-cols-[88px_minmax(0,1fr)] @[360px]:gap-5">
        <motion.button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          initial={false}
          whileHover="hover"
          className="group relative flex aspect-square w-full cursor-pointer items-end overflow-hidden rounded-[6px] border-0 bg-(--ovio-track) bg-[repeating-linear-gradient(135deg,rgba(0,0,0,.05)_0_6px,transparent_6px_12px)] p-1.5 text-left font-(family-name:--ovio-mono) text-[9px] text-(--ovio-faint)"
        >
          <Artwork src={track.artwork} fallback="cover" />
          <motion.span
            aria-hidden
            className="absolute inset-0 m-auto flex size-8 items-center justify-center rounded-full bg-(--ovio-accent) text-[11px] text-(--ovio-on-accent)"
            initial={false}
            animate={{ opacity: playing ? 0 : 1, scale: playing ? 0.8 : 1 }}
            variants={{ hover: { opacity: 1, scale: 1 } }}
            transition={fast}
          >
            {playing ? "❚❚" : "▶"}
          </motion.span>
        </motion.button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] tracking-widest text-(--ovio-muted) uppercase">
            <EqBars
              count={3}
              playing={playing}
              className="h-2.5 gap-0.5"
              barClassName="w-0.5 bg-(--ovio-ink)"
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={playing ? "on" : "off"}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={fast}
              >
                {playing ? "Listening now" : "Paused"}
              </motion.span>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`${track.title}\0${track.artist}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={fast}
            >
              <h3 className="m-0 mt-2 truncate text-lg font-medium tracking-[-0.02em]">
                {track.title}
              </h3>
              <p className="m-0 truncate text-[13px] text-(--ovio-muted)">{track.artist}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-3 flex items-center gap-2.5 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
            <Time seconds={progress} />
            <div
              {...seekProps}
              className="group/seek relative flex h-3 flex-1 cursor-pointer touch-none items-center"
            >
              <span className="relative h-0.5 w-full overflow-hidden bg-(--ovio-line-2) transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover/seek:scale-y-200 motion-reduce:transition-none">
                <motion.span
                  className="absolute inset-0 origin-left bg-(--ovio-accent)"
                  initial={false}
                  animate={{ scaleX: ratio }}
                  transition={fill}
                />
              </span>
            </div>
            <Time seconds={track.duration} />
          </div>
        </div>
      </div>
    </article>
  );
}
