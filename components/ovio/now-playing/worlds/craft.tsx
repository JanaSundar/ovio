import { animate, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { NowPlayingWorldProps } from "../now-playing";
import { Artwork, Time, useFillTransition, useFit } from "../parts";

/** The arrangement is drawn at this size and scaled down on narrow stages. */
const W = 430;
const H = 292;
/** One turn every 1.8s, near 33⅓ rpm. */
const SPIN_MS = 1800;
/** Tonearm angles: lifted clear of the record, then outer to inner groove as the track plays. */
const ARM_REST = 4;
const ARM_START = 22;
const ARM_SPAN = 17;

export default function CraftNowPlaying({
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

  // One endless native spin, run on the compositor; only its playback rate is eased, so the platter
  // spins up and winds down instead of stopping dead, and nothing runs on the main thread while it turns.
  const platter = useRef<HTMLSpanElement>(null);
  const spin = useRef<Animation>(null);
  useEffect(() => {
    const el = platter.current;
    if (!el) return;
    const a = el.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], {
      duration: SPIN_MS,
      iterations: Infinity,
    });
    a.playbackRate = 0;
    spin.current = a;
    return () => a.cancel();
  }, []);
  useEffect(() => {
    const a = spin.current;
    if (!a) return;
    if (reduced) {
      a.playbackRate = 0;
      return;
    }
    const run = animate(a.playbackRate, playing ? 1 : 0, {
      type: "spring",
      stiffness: 30,
      damping: 14,
      onUpdate: (v) => (a.playbackRate = Math.max(0, v)),
    });
    return () => run.stop();
  }, [playing, reduced]);

  return (
    <article
      ref={ref}
      data-ovio-world="craft"
      aria-label={`Now playing: ${track.title} by ${track.artist}`}
      className={cn(
        "relative w-full max-w-107.5 font-(family-name:--ovio-font) text-(--ovio-ink)",
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
          animate={{ transform: `translateX(${playing ? 0 : -46}px)` }}
          transition={settle}
          className="absolute top-5 left-31 size-56 cursor-pointer rounded-full border-0 p-0 shadow-[0_10px_20px_-6px_rgba(40,25,10,.5)]"
        >
          <span
            ref={platter}
            aria-hidden
            className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,#1a140e_0_2px,#2a211a_2px_4px)]"
          >
            <span className="absolute inset-0 m-auto flex size-19.5 items-center justify-center rounded-full bg-(--ovio-accent)">
              <span className="absolute top-2.5 font-(family-name:--ovio-hand) text-sm leading-none text-(--ovio-on-accent)">
                side A
              </span>
              <span className="size-2 rounded-full bg-(--ovio-stage)" />
            </span>
          </span>
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_20deg,transparent_0_12%,rgba(255,255,255,.1)_16%,transparent_22%_62%,rgba(255,255,255,.07)_66%,transparent_72%)]"
          />
        </motion.button>

        <div className="absolute top-0 left-0 flex size-60 -rotate-3 flex-col justify-end overflow-hidden rounded-sm bg-[#f2c9a0] bg-[repeating-linear-gradient(135deg,rgba(90,50,20,.06)_0_8px,transparent_8px_16px)] p-3.5 shadow-[0_2px_4px_rgba(70,45,20,.15),0_18px_30px_-12px_rgba(70,45,20,.45)]">
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
          className="absolute -top-2.5 left-21.5 h-6 w-19.5 rotate-2 bg-(--ovio-tape)"
        />

        <motion.div
          aria-hidden
          className="absolute top-5.5 left-96 h-46.5 w-0 origin-top"
          initial={false}
          animate={{ transform: `rotate(${playing ? ARM_START + ratio * ARM_SPAN : ARM_REST}deg)` }}
          transition={ticking && playing ? { duration: 1, ease: "linear" } : settle}
        >
          <span className="absolute top-3 -left-0.75 h-40 w-1.5 rounded-full bg-[linear-gradient(90deg,#b9b2a6,#efe9df,#a49c90)] shadow-[2px_3px_4px_rgba(40,25,10,.3)]" />
          <span className="absolute -bottom-1 -left-2.25 h-6.5 w-4.5 rounded-[3px] bg-(--ovio-ink) shadow-[2px_3px_4px_rgba(40,25,10,.35)]" />
          <span className="absolute -top-3.5 -left-3.5 size-7 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f4efe6,#a49c90)] shadow-[0_3px_6px_rgba(40,25,10,.35)]" />
        </motion.div>

        <motion.div
          className="absolute top-47.5 left-57.5 w-48.5 bg-[#ffe27a] px-4 pt-3.5 pb-3 shadow-[0_6px_12px_-4px_rgba(90,60,0,.4)]"
          initial={false}
          animate={{ transform: `rotate(${playing ? 4 : 1.5}deg)` }}
          transition={settle}
        >
          <h3
            title={track.title}
            className="m-0 truncate font-(family-name:--ovio-hand) text-[26px] leading-none font-bold"
          >
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
              className="absolute inset-x-0 h-0.75 rounded-full bg-(--ovio-accent-deep)"
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
