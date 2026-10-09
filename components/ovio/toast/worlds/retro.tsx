"use client";

import type { ToastKind, ToastWorldProps } from "../toast";

const TAG: Record<ToastKind, string> = { success: "OK", error: "ERR!", info: "INFO" };

const KEY =
  "cursor-pointer border-0 bg-transparent p-0 font-(family-name:--ovio-font) text-[19px] leading-none text-(--ovio-ink) hover:bg-(--ovio-accent) hover:text-(--ovio-on-accent)";

export function RetroToast({ kind, title, description, action, dismiss }: ToastWorldProps) {
  return (
    <div
      data-ovio-world="retro"
      className="w-full border-2 border-(--ovio-line) bg-(--ovio-stage) px-3 py-2 font-(family-name:--ovio-font) text-[19px] leading-[1.15] text-(--ovio-ink) [text-shadow:var(--ovio-glow)]"
    >
      <p className="m-0">
        <span
          className={
            kind === "error"
              ? "bg-(--ovio-ink) px-1 text-(--ovio-on-accent) [text-shadow:none]"
              : ""
          }
        >
          {TAG[kind]}
        </span>{" "}
        {title.toUpperCase()}
      </p>
      {description && <p className="m-0 text-(--ovio-muted)">&gt; {description}</p>}
      <div className="mt-1.5 flex gap-4">
        {action && (
          <button type="button" onClick={action.onClick} className={KEY}>
            [{action.label.toUpperCase()}]
          </button>
        )}
        <button type="button" onClick={dismiss} className={KEY}>
          [DISMISS]
        </button>
      </div>
    </div>
  );
}
