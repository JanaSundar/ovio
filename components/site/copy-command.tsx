"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { motionTokens, useReducedMotionSafe } from "@/lib/motion";

/**
 * Copies text to the clipboard. `copied` turns true for a moment once the copy has happened, and
 * `failed` when the browser refused it (no clipboard access, an insecure page): never "Copied"
 * for a copy that didn't happen.
 */
export function useCopy() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const settle = (next: "copied" | "failed") => {
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1600);
  };
  const copy = (text: string) => {
    if (!navigator.clipboard) return settle("failed");
    navigator.clipboard.writeText(text).then(
      () => settle("copied"),
      () => settle("failed"),
    );
  };
  return { copied: state === "copied", failed: state === "failed", copy };
}

/** The button's label: what it does, or what just happened. */
export const copyLabel = ({ copied, failed }: { copied: boolean; failed: boolean }) =>
  copied ? "Copied" : failed ? "Failed" : "Copy";

/** The label, sliding up as it changes, so "Copied" reads as something that just happened. */
export function CopyLabel({ state }: { state: { copied: boolean; failed: boolean } }) {
  const reduced = useReducedMotionSafe();
  const label = copyLabel(state);
  const offset = reduced ? 0 : 4;
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={label}
        className="inline-block"
        initial={{ opacity: 0, y: offset }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -offset }}
        transition={motionTokens.minimal.base}
      >
        {label}
      </motion.span>
    </AnimatePresence>
  );
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
  const state = useCopy();
  return (
    <div className={variant}>
      <code>{command}</code>
      <button
        type="button"
        onClick={() => {
          state.copy(command);
          onCopy();
        }}
        aria-live="polite"
      >
        <CopyLabel state={state} />
      </button>
    </div>
  );
}
