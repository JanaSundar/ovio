"use client";

import { useState } from "react";
import { LiveDemo } from "@/components/site/live-demo";
import { NowPlaying, type Track } from "./now-playing";

/** The sample: what Ada Park has on while working on lumen. */
const QUEUE: Track[] = [
  { title: "Midnight Compile", artist: "The Linters", album: "Hot Reload", duration: 228 },
  {
    title: "Merge Conflict",
    artist: "Null Pointer Sisters",
    album: "Detached Head",
    duration: 196,
  },
  { title: "Green Build", artist: "The Linters", album: "Hot Reload", duration: 254 },
];

const SAMPLE = { service: "sample", track: QUEUE[0], progress: 134, playing: true };

/**
 * Half the route's 30-second cache: the first request after it expires gets the stale copy while
 * Next refreshes it, so polling twice per window picks up the fresh one a poll later.
 */
const POLL = 15_000;

function SampleQueue() {
  const [index, setIndex] = useState(0);
  const step = (by: number) => setIndex((i) => (i + by + QUEUE.length) % QUEUE.length);
  return (
    <NowPlaying
      track={QUEUE[index]}
      defaultProgress={SAMPLE.progress}
      onPrevious={() => step(-1)}
      onNext={() => step(1)}
    />
  );
}

export function NowPlayingDemo() {
  return (
    <LiveDemo slug="now-playing" fallback={SAMPLE} refreshMs={POLL} source={(now) => now.service}>
      {(now, live) =>
        live ? (
          // A new track starts the player over at the service's progress.
          <NowPlaying
            key={`${now.track.artist} — ${now.track.title}`}
            track={now.track}
            defaultProgress={now.progress}
            defaultPlaying={now.playing}
          />
        ) : (
          <SampleQueue />
        )
      }
    </LiveDemo>
  );
}
