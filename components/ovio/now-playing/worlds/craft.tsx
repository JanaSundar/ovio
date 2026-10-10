"use client";

import { motion, useAnimationFrame, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { NowPlayingWorldProps } from "../now-playing";
import { Artwork, Time, useFillTransition, useFit } from "../parts";

/** The arrangement is drawn at this size and scaled down on narrow stages. */
const W = 430;
const H = 292;
/** One turn every 1.8s, near 33⅓ rpm. */
const DEG_PER_MS = 360 / 1800;
/** Tonearm angles: lifted clear of the record, then outer to inner groove as the track plays. */
const ARM_REST = 4;
const ARM_START = 22;
const ARM_SPAN = 17;

export function CraftNowPlaying({
  track,
  playing,
  progress,
  ratio,
  ticking,
  togglePlay,
  seekProps,
  className,
}: NowPlayingWorldProps) {
  const reduced = useReducedMotionSafe();
  const settle = useOvioTransition(motionTokens.craft.slow);
  const fill = useFillTransition(ticking);
  const [ref, fit] = useFit(W);

  // The platter spins up and winds down instead of stopping dead.
  const rotate = useMotionValue(0);
  const speed = useSpring(0, { stiffness: 30, damping: 14 });
  useEffect(() => {
    if (reduced) speed.jump(0);
    else speed.set(playing ? 1 : 0);
  }, [playing, reduced, speed]);
  useAnimationFrame((_, delta) => {
    const s = speed.get();
    if (s > 0.001) rotate.set((rotate.get() + s * delta * DEG_PER_MS) % 360);
  });

  return (
    <article
      ref={ref}
      data-ovio-world="craft"
      aria-label={`Now playing: ${track.title} by ${track.artist}`}
      className={cn(
        "relative w-full max-w-[430px] font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
      style={{ height: H * fit }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: W, height: H, scale: fit }}
      >
        <motion.button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          initial={false}
          animate={{ x: playing ? 0 : -46 }}
          transition={settle}
          className="absolute top-5 left-[124px] size-[224px] cursor-pointer rounded-full border-0 p-0 shadow-[0_10px_20px_-6px_rgba(40,25,10,.5)]"
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,#1a140e_0_2px,#2a211a_2px_4px)]"
            style={{ rotate }}
          >
            <span className="absolute inset-0 m-auto flex size-[78px] items-center justify-center rounded-full bg-(--ovio-accent)">
              <span className="absolute top-2.5 font-(family-name:--ovio-hand) text-sm leading-none text-(--ovio-on-accent)">
                side A
              </span>
              <span className="size-2 rounded-full bg-(--ovio-stage)" />
            </span>
          </motion.span>
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_20deg,transparent_0_12%,rgba(255,255,255,.1)_16%,transparent_22%_62%,rgba(255,255,255,.07)_66%,transparent_72%)]"
          />
        </motion.button>

        <div className="absolute top-0 left-0 flex size-[240px] -rotate-3 flex-col justify-end overflow-hidden rounded-[4px] bg-[#f2c9a0] bg-[repeating-linear-gradient(135deg,rgba(90,50,20,.06)_0_8px,transparent_8px_16px)] p-3.5 shadow-[0_2px_4px_rgba(70,45,20,.15),0_18px_30px_-12px_rgba(70,45,20,.45)]">
          <Artwork
            src={track.artwork}
            fallback={
              <>
                <span className="font-(family-name:--ovio-hand) text-[34px] leading-none text-[#7d5a3a]">
                  {track.album ?? track.title}
                </span>
                <span className="mt-1 font-(family-name:--ovio-mono) text-[10px] tracking-[0.08em] text-[#9a7552] uppercase">
                  {track.artist} · LP
                </span>
              </>
            }
          />
        </div>
        <span
          aria-hidden
          className="absolute -top-2.5 left-[86px] h-6 w-[78px] rotate-2 bg-(--ovio-tape)"
        />

        <motion.div
          aria-hidden
          className="absolute top-[22px] left-[384px] h-[186px] w-0 origin-top"
          initial={false}
          animate={{ rotate: playing ? ARM_START + ratio * ARM_SPAN : ARM_REST }}
          transition={ticking && playing ? { duration: 1, ease: "linear" } : settle}
        >
          <span className="absolute top-3 -left-[3px] h-[160px] w-1.5 rounded-full bg-[linear-gradient(90deg,#b9b2a6,#efe9df,#a49c90)] shadow-[2px_3px_4px_rgba(40,25,10,.3)]" />
          <span className="absolute -bottom-1 -left-[9px] h-[26px] w-[18px] rounded-[3px] bg-(--ovio-ink) shadow-[2px_3px_4px_rgba(40,25,10,.35)]" />
          <span className="absolute -top-3.5 -left-3.5 size-7 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f4efe6,#a49c90)] shadow-[0_3px_6px_rgba(40,25,10,.35)]" />
        </motion.div>

        <motion.div
          className="absolute top-[190px] left-[230px] w-[194px] bg-[#ffe27a] px-4 pt-3.5 pb-3 shadow-[0_6px_12px_-4px_rgba(90,60,0,.4)]"
          initial={false}
          animate={{ rotate: playing ? 4 : 1.5 }}
          transition={settle}
        >
          <h3 className="m-0 truncate font-(family-name:--ovio-hand) text-[26px] leading-none font-bold">
            {track.title}
          </h3>
          <div className="flex items-baseline gap-1.5 font-(family-name:--ovio-hand) text-xl leading-tight text-(--ovio-ink-2)">
            <span className="truncate">{track.artist}</span>·
            <Time seconds={progress} />
          </div>
          <div
            {...seekProps}
            className="relative mt-1.5 flex h-3 cursor-pointer touch-none items-center"
          >
            <span className="h-0.5 w-full rounded-full bg-[repeating-linear-gradient(90deg,rgba(42,31,20,.35)_0_4px,transparent_4px_7px)]" />
            <motion.span
              className="absolute inset-x-0 h-[3px] rounded-full bg-(--ovio-accent-deep)"
              initial={false}
              // Clipped rather than resized, so the fill moves on the compositor and keeps its round end.
              animate={{ clipPath: `inset(0 ${(1 - ratio) * 100}% 0 0 round 99px)` }}
              transition={fill}
            />
          </div>
        </motion.div>
      </div>
    </article>
  );
}
