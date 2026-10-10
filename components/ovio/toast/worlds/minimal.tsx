"use client";

import type { ToastKind, ToastWorldProps } from "../toast";

const DOT: Record<ToastKind, string> = {
  success: "#2f8f5b",
  error: "#b4432a",
  info: "#77756e",
};

export function MinimalToast({ kind, title, description, action, dismiss }: ToastWorldProps) {
  return (
    <div
      data-ovio-world="minimal"
      className="flex w-full items-start gap-3 rounded-(--ovio-radius) border border-(--ovio-line) bg-(--ovio-surface) py-3 pr-2.5 pl-3.5 font-(family-name:--ovio-font) text-[13px] leading-[1.45] text-(--ovio-ink) shadow-[0_10px_28px_-14px_rgba(22,22,20,.3)]"
    >
      <span
        aria-hidden
        className="mt-[5px] size-2 shrink-0 rounded-full"
        style={{ background: DOT[kind] }}
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 font-medium">{title}</p>
        {description && <p className="m-0 mt-0.5 text-(--ovio-muted)">{description}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 cursor-pointer rounded-[6px] border-0 bg-(--ovio-accent) px-2.5 py-1 transition-transform duration-[80ms] ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.97] font-(family-name:--ovio-font) text-[12px] text-(--ovio-on-accent)"
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="-my-0.5 size-6 shrink-0 cursor-pointer rounded-[6px] border-0 bg-transparent text-base leading-none text-(--ovio-muted) hover:bg-(--ovio-line-2)"
      >
        ×
      </button>
    </div>
  );
}
