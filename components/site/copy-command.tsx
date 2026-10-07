"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };
  return { copied, copy };
}

/** The hero's install button: the whole command is the button. */
export function InstallButton({ command }: { command: string }) {
  const { copied, copy } = useCopy(command);
  return (
    <button
      type="button"
      onClick={copy}
      className="flex cursor-pointer items-center gap-3 rounded-lg border-0 bg-ink px-4 py-3 font-mono text-[13px] text-paper transition-colors hover:bg-[#2c2b28]"
    >
      <span className="text-code-muted">$</span>
      <span>{command}</span>
      <span className="text-[11px] text-code-muted" aria-live="polite">
        {copied ? "copied" : "copy"}
      </span>
    </button>
  );
}

/** A dark command box with a Copy button, as on the docs pages. */
export function CopyCommand({ command, className }: { command: string; className?: string }) {
  const { copied, copy } = useCopy(command);
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-[10px] bg-ink px-4 py-3.5 font-mono text-[13px] text-paper",
        className,
      )}
    >
      <span className="overflow-x-auto whitespace-nowrap">
        <span className="text-code-muted">$ </span>
        {command}
      </span>
      <button
        type="button"
        onClick={copy}
        className="flex-none cursor-pointer rounded-md border border-[#3a3935] bg-transparent px-2.5 py-[5px] font-[inherit] text-[11px] text-[#d8d6cf]"
        aria-live="polite"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
