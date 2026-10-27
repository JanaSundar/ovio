"use client";

import { useState, type ReactNode } from "react";
import { SAMPLE_DIAL } from "@/content/samples";
import { cn } from "@/lib/utils";
import { DialMenu, type DialMenuItem, type DialMenuTrigger } from "./dial-menu";

const icon = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const ICONS: Record<string, ReactNode> = {
  new: icon("M12 5v14M5 12h14"),
  search: icon("M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4"),
  comment: icon("M5 5h14v10H10l-5 4z"),
  share: icon("M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"),
  assign: icon(
    "M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c.8-3.4 3.6-5.5 7-5.5s6.2 2.1 7 5.5",
  ),
  pin: icon("M9 4h6l-1 6 3 3H7l3-3zM12 13v7"),
  archive: icon("M4 5h16v4H4zM5 9v10h14V9M10 13h4"),
  settings: icon(
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3l1.6 2.3 2.8-.5.5 2.8L19.2 9 18 11.6l1.2 2.6-2.3 1.6-.5 2.8-2.8-.5L12 20.4l-1.6-2.3-2.8.5-.5-2.8-2.3-1.6L6 11.6 4.8 9l2.3-1.4.5-2.8 2.8.5z",
  ),
  doc: icon("M7 3.5h6.5L18 8v12.5H7zM13.5 3.5V8H18"),
  task: icon("M5 12.5l4 4 10-10"),
  board: icon("M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"),
  channel: icon("M9 4 7 20M17 4l-2 16M4.5 9h16M3.5 15h16"),
  link: icon(
    "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  ),
  invite: icon(
    "M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c.8-3.4 3.4-5.5 7-5.5 1.5 0 2.8.4 3.9 1M18 14v6M15 17h6",
  ),
  export: icon("M12 4v11M8 11l4 4 4-4M5 20h14"),
};

const withIcon = <T extends { id: string }>(item: T) => ({ ...item, icon: ICONS[item.id] });
export const ITEMS: DialMenuItem[] = SAMPLE_DIAL.map((item) => ({
  ...withIcon(item),
  items: item.items?.map(withIcon),
}));

const TRIGGERS: { value: DialMenuTrigger; label: string }[] = [
  { value: "contextmenu", label: "Right-click" },
  { value: "click", label: "Click" },
  { value: "inline", label: "Inline" },
];

const CAPTION = "font-(family-name:--ovio-mono) text-[11px] tracking-widest uppercase";

export function DialMenuDemo() {
  const [trigger, setTrigger] = useState<DialMenuTrigger>("contextmenu");
  const [picked, setPicked] = useState<string>();

  const menu = (children?: ReactNode) => (
    <DialMenu
      items={ITEMS}
      trigger={trigger}
      onSelect={(item, parent) =>
        setPicked(parent ? `${parent.label} › ${item.label}` : item.label)
      }
    >
      {children}
    </DialMenu>
  );

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div role="radiogroup" aria-label="Open with" className="flex gap-1">
        {TRIGGERS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={trigger === t.value}
            onClick={() => setTrigger(t.value)}
            className={cn(
              CAPTION,
              "rounded-full px-3 py-1.5 transition-colors",
              trigger === t.value
                ? "bg-(--ovio-ink) text-(--ovio-surface)"
                : "text-(--ovio-muted) hover:text-(--ovio-ink)",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid h-80 w-full max-w-md place-items-center">
        {trigger === "inline" && menu()}
        {trigger === "click" &&
          menu(
            <button
              type="button"
              aria-label="Quick actions"
              className="grid size-14 place-items-center rounded-full bg-(--ovio-ink) text-(--ovio-surface) shadow-[0_10px_24px_-10px_rgba(0,0,0,.5)] transition-transform active:scale-95 [&_svg]:size-6"
            >
              {ICONS.new}
            </button>,
          )}
        {trigger === "contextmenu" &&
          menu(
            <div className="flex size-full flex-col gap-3 rounded-2xl border border-dashed border-(--ovio-line) p-6 select-none">
              <button
                type="button"
                className={cn(CAPTION, "self-start text-(--ovio-muted) hover:text-(--ovio-ink)")}
              >
                lumen / Project management
              </button>
              {[92, 78, 85, 60].map((w) => (
                <span
                  key={w}
                  aria-hidden
                  className="h-2 rounded-full bg-(--ovio-line)"
                  style={{ width: `${w}%` }}
                />
              ))}
              <span className={cn(CAPTION, "mt-auto text-center text-(--ovio-faint)")}>
                Right-click or long-press here · Shift F10 on the title
              </span>
            </div>,
          )}
      </div>
      <span aria-live="polite" className={cn(CAPTION, "text-(--ovio-muted)")}>
        {picked ? `Picked ${picked}` : "Aim with the pointer · flick and release to pick"}
      </span>
    </div>
  );
}
