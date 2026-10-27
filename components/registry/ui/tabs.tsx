"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = { id: string; label: string; content: ReactNode };

/** WAI-ARIA tabs: arrow keys, Home and End move between tabs, and only the open panel renders. */
export function Tabs({ tabs, label }: { tabs: TabItem[]; label: string }) {
  const id = useId();
  const [open, setOpen] = useState(tabs[0]?.id);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.id === open),
  );

  const onKeyDown = (e: KeyboardEvent) => {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : e.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setOpen(tabs[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <div className="flex flex-col">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="reg-scroll flex gap-1 overflow-x-auto border-b border-seam"
      >
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            id={`${id}-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={i === index}
            aria-controls={`${id}-panel`}
            tabIndex={i === index ? 0 : -1}
            onClick={() => setOpen(t.id)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-[13px] whitespace-nowrap transition-colors",
              i === index
                ? "border-violet text-snow"
                : "border-transparent text-haze hover:text-snow",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${tabs[index]?.id}`}
        tabIndex={0}
        className="pt-5 outline-none"
      >
        {tabs[index]?.content}
      </div>
    </div>
  );
}
