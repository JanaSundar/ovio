"use client";

import { copyLabel, useCopy } from "@/components/site/copy-command";
import { cn } from "@/lib/utils";

/** Copies the page's own address. */
export function CopyLink() {
  const state = useCopy();
  return (
    <button
      type="button"
      onClick={() => state.copy(window.location.href.split("#")[0])}
      className={cn(
        "flex h-8 shrink-0 items-center gap-2 self-start rounded-lg border border-seam px-3 text-xs transition-colors lg:self-auto",
        state.copied ? "text-signal" : "text-mist hover:text-snow",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
      </svg>
      <span aria-live="polite">
        {state.copied || state.failed ? copyLabel(state) : "Copy link"}
      </span>
    </button>
  );
}
