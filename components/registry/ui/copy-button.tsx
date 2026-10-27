"use client";

import { copyLabel, useCopy } from "@/components/site/copy-command";
import { cn } from "@/lib/utils";

/** Copies exactly `text`, and says so only once the browser confirms it. */
export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const state = useCopy();
  const shown = state.copied || state.failed ? copyLabel(state) : label;
  return (
    <button
      type="button"
      onClick={() => state.copy(text)}
      className={cn(
        "h-7 shrink-0 rounded-md border border-seam-2 px-2.5 font-mono text-[11px] transition-colors",
        state.copied
          ? "border-signal/40 text-signal"
          : state.failed
            ? "text-[#ff8a80]"
            : "text-mist hover:text-snow",
        className,
      )}
    >
      <span aria-live="polite">{shown}</span>
    </button>
  );
}

/** A one-line command with its copy button. */
export function CommandLine({ command }: { command: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-seam bg-void py-1.5 pr-1.5 pl-3">
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[12.5px] whitespace-nowrap text-snow">
        <span className="text-haze select-none">$ </span>
        {command}
      </code>
      <CopyButton text={command} />
    </div>
  );
}
