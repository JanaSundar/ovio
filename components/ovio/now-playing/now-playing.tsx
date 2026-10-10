"use client";

import {
  type ComponentType,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { keyToIndex } from "@/lib/keys";
import { formatTime, VOLUME_STEPS } from "./parts";
import { MinimalNowPlaying } from "./worlds/minimal";
import { CraftNowPlaying } from "./worlds/craft";
import { RetroNowPlaying } from "./worlds/retro";
import { ToyNowPlaying } from "./worlds/toy";
import type { Track } from "./types";

export type { Track } from "./types";

export type NowPlayingProps = {
  track: Track;
  variant?: World;
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  /** Seconds elapsed. Advances once a second while playing. */
  progress?: number;
  defaultProgress?: number;
  onProgressChange?: (progress: number) => void;
  /** 0–10, turned with the Toy volume knob. */
  volume?: number;
  defaultVolume?: number;
  onVolumeChange?: (volume: number) => void;
  onPrevious?: () => void;
  /** Fires on the next key and when the track ends. */
  onNext?: () => void;
  className?: string;
};

/** Everything a world needs to draw the player. Worlds only render; state lives here. */
export type NowPlayingWorldProps = {
  track: Track;
  playing: boolean;
  /** Paused at the very start, as after the stop key. */
  stopped: boolean;
  progress: number;
  /** progress / duration, 0–1. */
  ratio: number;
  /** The last change came from the clock, so a bar can glide over the coming second. */
  ticking: boolean;
  volume: number;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  stop: () => void;
  previous: () => void;
  next: () => void;
  setVolume: (volume: number) => void;
  /** Spread on a progress track: slider semantics, arrow-key and pointer seeking. */
  seekProps: {
    role: "slider";
    tabIndex: 0;
    "aria-label": string;
    "aria-valuemin": number;
    "aria-valuemax": number;
    "aria-valuenow": number;
    "aria-valuetext": string;
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
    onPointerDown: (e: PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  };
  className?: string;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const VIEWS = {
  minimal: MinimalNowPlaying,
  craft: CraftNowPlaying,
  retro: RetroNowPlaying,
  toy: ToyNowPlaying,
} satisfies Record<World, ComponentType<NowPlayingWorldProps>>;

export function NowPlaying({
  track,
  variant,
  playing: playingProp,
  defaultPlaying = true,
  onPlayingChange,
  progress: progressProp,
  defaultProgress = 0,
  onProgressChange,
  volume: volumeProp,
  defaultVolume = 6,
  onVolumeChange,
  onPrevious,
  onNext,
  className,
}: NowPlayingProps) {
  const world = useWorld(variant);
  // A length that isn't a number (a broken upstream value) is no length at all.
  const duration = Number.isFinite(track.duration) ? Math.max(0, Math.round(track.duration)) : 0;
  const [playingState, setPlayingState] = useState(defaultPlaying);
  const [progressState, setProgressState] = useState(defaultProgress);
  const [volumeState, setVolumeState] = useState(defaultVolume);
  const [ticking, setTicking] = useState(false);
  const playing = playingProp ?? playingState;
  const progress = clamp(Math.round(progressProp ?? progressState), 0, duration);
  const volume = clamp(Math.round(volumeProp ?? volumeState), 0, VOLUME_STEPS - 1);

  const setPlaying = (next: boolean) => {
    if (next === playing) return;
    if (playingProp === undefined) setPlayingState(next);
    onPlayingChange?.(next);
  };

  const setProgress = (next: number, tick = false) => {
    setTicking(tick);
    if (progressProp === undefined) setProgressState(next);
    onProgressChange?.(next);
  };

  const seek = (seconds: number) => {
    const next = clamp(Math.round(seconds), 0, duration);
    if (next !== progress) setProgress(next);
  };

  const setVolume = (next: number) => {
    const v = clamp(next, 0, VOLUME_STEPS - 1);
    if (v === volume) return;
    if (volumeProp === undefined) setVolumeState(v);
    onVolumeChange?.(v);
  };

  // The clock reads the latest values without restarting every second.
  const live = useRef({ progress, duration, setProgress, onNext });
  useEffect(() => {
    live.current = { progress, duration, setProgress, onNext };
  });
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const l = live.current;
      if (!l.duration) return;
      if (l.progress + 1 >= l.duration) {
        l.setProgress(0);
        l.onNext?.();
      } else l.setProgress(l.progress + 1, true);
    }, 1000);
    return () => clearInterval(id);
  }, [playing]);

  const scrub = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seek(clamp((e.clientX - r.left) / r.width, 0, 1) * duration);
  };

  const props: NowPlayingWorldProps = {
    track,
    playing,
    stopped: !playing && progress === 0,
    progress,
    ratio: duration ? progress / duration : 0,
    ticking,
    volume,
    togglePlay: () => setPlaying(!playing),
    setPlaying,
    stop: () => {
      setPlaying(false);
      seek(0);
    },
    previous: () => {
      seek(0);
      onPrevious?.();
    },
    next: () => {
      seek(0);
      onNext?.();
    },
    setVolume,
    seekProps: {
      role: "slider",
      tabIndex: 0,
      "aria-label": "Seek",
      "aria-valuemin": 0,
      "aria-valuemax": duration,
      "aria-valuenow": progress,
      "aria-valuetext": `${formatTime(progress)} of ${formatTime(duration)}`,
      onKeyDown: (e) => {
        const i = keyToIndex(e.key, progress, duration + 1, { vertical: true, step: 5, page: 30 });
        if (i === null) return;
        e.preventDefault();
        seek(i);
      },
      onPointerDown: (e) => {
        if (!e.isPrimary || e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        scrub(e);
      },
      onPointerMove: (e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) scrub(e);
      },
    },
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
