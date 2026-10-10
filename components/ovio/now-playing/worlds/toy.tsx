"use client";

import { motion } from "motion/react";
import { useRef, type PointerEvent } from "react";
import { ToyKey } from "@/components/shared/toy";
import { RollingNumber } from "@/components/shared/rolling-number";
import { keyToIndex } from "@/lib/keys";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { NowPlayingWorldProps } from "../now-playing";
import { Time, useFillTransition, VOLUME_STEPS } from "../parts";

const ANGLE_MIN = -135;
const DETENT = 270 / (VOLUME_STEPS - 1);

const keyClass =
  "flex cursor-pointer touch-manipulation items-center justify-center rounded-xl border-0 py-3.5 font-(family-name:--ovio-font) text-[15px] font-extrabold";

const pointerAngle = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
};

/** A detented volume knob: turn it around its centre, or use the arrow keys. */
function VolumeKnob({ volume, setVolume }: Pick<NowPlayingWorldProps, "volume" | "setVolume">) {
  const turn = useOvioTransition(motionTokens.toy.knob);
  const drag = useRef<{ last: number; acc: number; start: number } | null>(null);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const a = pointerAngle(e);
    d.acc += ((((a - d.last) % 360) + 540) % 360) - 180;
    d.last = a;
    setVolume(Math.round(d.start + d.acc / DETENT));
  };

  const release = () => {
    drag.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        role="slider"
        tabIndex={0}
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={VOLUME_STEPS - 1}
        aria-valuenow={volume}
        onKeyDown={(e) => {
          const i = keyToIndex(e.key, volume, VOLUME_STEPS, { vertical: true, page: 3 });
          if (i === null) return;
          e.preventDefault();
          setVolume(i);
        }}
        onPointerDown={(e) => {
          if (!e.isPrimary || e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { last: pointerAngle(e), acc: 0, start: volume };
        }}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        className="relative size-24 shrink-0 cursor-grab touch-none active:cursor-grabbing"
      >
        {Array.from({ length: VOLUME_STEPS }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute top-0 left-[47px] h-[7px] w-0.5 origin-[1px_48px] rounded-[1px] transition-colors duration-150 motion-reduce:transition-none"
            style={{
              rotate: `${ANGLE_MIN + i * DETENT}deg`,
              background: i <= volume ? "var(--ovio-red)" : "var(--ovio-faint)",
            }}
          />
        ))}
        <div className="absolute inset-3 rounded-full bg-(--ovio-accent) shadow-[0_6px_0_var(--ovio-accent-deep),0_14px_16px_-8px_rgba(40,28,10,.5),inset_0_2px_0_rgba(255,255,255,.25)]" />
        <motion.div
          aria-hidden
          className="absolute inset-3 rounded-full"
          initial={false}
          animate={{ rotate: ANGLE_MIN + volume * DETENT }}
          transition={turn}
        >
          <span className="absolute top-1.5 left-1/2 -ml-[3px] h-[18px] w-1.5 rounded-[3px] bg-(--ovio-surface)" />
        </motion.div>
      </div>
      <span className="font-(family-name:--ovio-mono) text-[11px] tracking-widest text-(--ovio-muted)">
        VOL <RollingNumber value={volume} />
      </span>
    </div>
  );
}

export function ToyNowPlaying({
  track,
  playing,
  progress,
  ratio,
  ticking,
  volume,
  togglePlay,
  previous,
  next,
  setVolume,
  seekProps,
  className,
}: NowPlayingWorldProps) {
  const fill = useFillTransition(ticking);

  return (
    <article
      data-ovio-world="toy"
      className={cn(
        "@container w-full max-w-[500px] rounded-[24px] bg-(--ovio-surface) p-3.5 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_1px_0_#fff,0_8px_0_var(--ovio-line),0_24px_30px_-16px_rgba(40,28,10,.45)] @[400px]:p-[18px]",
        className,
      )}
    >
      <div className="grid items-center gap-4 @[440px]:grid-cols-[minmax(0,1fr)_116px] @[440px]:gap-[18px]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <div className="rounded-xl bg-[#2a2925] px-3.5 py-3 text-(--ovio-surface) shadow-[inset_0_3px_6px_rgba(0,0,0,.6)]">
            <div className="flex justify-between gap-2 font-(family-name:--ovio-mono) text-[10px] tracking-[0.08em] text-[#bdb6a8]">
              <span className="whitespace-nowrap">{playing ? "▶ PLAYING" : "❚❚ PAUSED"}</span>
              <span className="flex gap-1">
                <Time seconds={progress} />/<Time seconds={track.duration} />
              </span>
            </div>
            <h3
              className="m-0 mt-1 truncate text-[22px] font-extrabold tracking-[-0.01em]"
              style={{ fontStretch: "115%" }}
            >
              {track.title}
            </h3>
            <p className="m-0 truncate text-xs text-[#bdb6a8]">{track.artist}</p>
            <div {...seekProps} className="mt-2 flex h-3.5 cursor-pointer touch-none items-center">
              <span className="relative h-1.5 w-full overflow-hidden rounded-[3px] bg-[#45433d]">
                <motion.span
                  className="absolute inset-0 rounded-[3px] bg-(--ovio-yellow)"
                  initial={false}
                  animate={{ clipPath: `inset(0 ${(1 - ratio) * 100}% 0 0 round 3px)` }}
                  transition={fill}
                />
              </span>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-2.5">
            <ToyKey
              depth={6}
              side="#cfc8b8"
              aria-label="Previous"
              onClick={previous}
              className={cn(keyClass, "bg-white text-(--ovio-ink)")}
            >
              |◀
            </ToyKey>
            <ToyKey
              depth={6}
              side="var(--ovio-red-deep)"
              aria-label={playing ? "Pause" : "Play"}
              onClick={togglePlay}
              className={cn(keyClass, "bg-(--ovio-red) text-base text-white")}
            >
              {playing ? "❚❚" : "▶"}
            </ToyKey>
            <ToyKey
              depth={6}
              side="#cfc8b8"
              aria-label="Next"
              onClick={next}
              className={cn(keyClass, "bg-white text-(--ovio-ink)")}
            >
              ▶|
            </ToyKey>
          </div>
        </div>
        <div className="flex items-center gap-4 @[440px]:flex-col @[440px]:gap-2">
          <div
            aria-hidden
            className="h-24 flex-1 rounded-[10px] bg-[radial-gradient(circle,#2a2925_2.5px,transparent_3px)] bg-size-[10px_10px] bg-repeat-space @[440px]:h-11 @[440px]:w-full @[440px]:flex-none"
          />
          <VolumeKnob volume={volume} setVolume={setVolume} />
        </div>
      </div>
    </article>
  );
}
