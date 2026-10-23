"use client";

import { useState } from "react";
import { SAMPLE_INVITE } from "@/content/samples";
import { ScratchToReveal } from "./scratch-to-reveal";

/** lumen's beta invite, in the world's own face and colours. */
function Invite() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 bg-(--ovio-surface) p-4 text-center text-(--ovio-ink)">
      <span className="font-(family-name:--ovio-mono) text-[11px] tracking-[0.18em] text-(--ovio-muted) uppercase">
        {SAMPLE_INVITE.title}
      </span>
      <span className="font-(family-name:--ovio-font) text-[28px] leading-tight font-bold tracking-[0.04em] tabular-nums">
        {SAMPLE_INVITE.code}
      </span>
      <span className="text-xs text-(--ovio-ink-2)">{SAMPLE_INVITE.note}</span>
    </div>
  );
}

export function ScratchToRevealDemo() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="flex flex-col items-center gap-5">
      <ScratchToReveal
        label={SAMPLE_INVITE.label}
        revealed={revealed}
        onRevealedChange={setRevealed}
      >
        <Invite />
      </ScratchToReveal>
      <button
        type="button"
        onClick={() => setRevealed(false)}
        disabled={!revealed}
        className="font-(family-name:--ovio-mono) text-[11px] tracking-widest text-(--ovio-muted) uppercase underline-offset-4 transition-opacity hover:underline disabled:pointer-events-none disabled:opacity-0"
      >
        Cover it again
      </button>
    </div>
  );
}
