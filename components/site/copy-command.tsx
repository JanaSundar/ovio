"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/** Copies text to the clipboard; `copied` stays true for a moment after. */
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };
  return { copied, copy };
}

/**
 * A command with a Copy button: dark with a lime button on the homepage (`command`), a light
 * box with an ink button in the docs (`install-box`).
 */
export function CopyCommand({
  command,
  variant = "command",
  onCopy = () => track("install_command_copied", { command_variant: variant }),
}: {
  command: string;
  variant?: "command" | "install-box";
  /** Reports the copy; an install command by default. */
  onCopy?: () => void;
}) {
  const { copied, copy } = useCopy();
  return (
    <div className={variant}>
      <code>{command}</code>
      <button
        type="button"
        onClick={() => {
          copy(command);
          onCopy();
        }}
        aria-live="polite"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
