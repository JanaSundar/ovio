"use client";

import { useState } from "react";
import { Letter, type LetterContent } from "./letter";

const ISSUE: LetterContent = {
  name: "The Weekly Diff",
  issue: 42,
  date: "2026-10-09",
  body: [
    "This week we split the machine into parallel regions. Each one keeps its own clock, so a slow exit on one side no longer holds up the other.",
    "It broke twice on the way. The second time taught us that guards need to see the latest context, not the one they were born with.",
  ],
  signOff: "Until next Thursday,",
  signature: "Jana",
};

/** Stands in for a newsletter service: a short wait, then subscribed. */
const subscribe = () => new Promise<void>((resolve) => setTimeout(resolve, 700));

export function LetterDemo() {
  const [round, setRound] = useState(0);
  const [sent, setSent] = useState(false);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Letter
        key={round}
        letter={ISSUE}
        subscribers={2481}
        onSubscribe={async () => {
          await subscribe();
          setSent(true);
        }}
      />
      {sent && (
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setRound((r) => r + 1);
          }}
          className="cursor-pointer border-0 bg-transparent font-(family-name:--ovio-mono) text-xs text-(--ovio-muted)"
        >
          ↺ Write another
        </button>
      )}
    </div>
  );
}
