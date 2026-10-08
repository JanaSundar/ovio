"use client";

import { useState } from "react";
import { NowPlaying, type Track } from "./now-playing";

/** What Ada Park has on while working on lumen. */
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

export function NowPlayingDemo() {
  const [index, setIndex] = useState(0);
  const step = (by: number) => setIndex((i) => (i + by + QUEUE.length) % QUEUE.length);

  return (
    <NowPlaying
      track={QUEUE[index]}
      defaultProgress={134}
      onPrevious={() => step(-1)}
      onNext={() => step(1)}
    />
  );
}
