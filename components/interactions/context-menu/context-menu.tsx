"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  edgeIndex,
  placeMenu,
  stepIndex,
  typeaheadIndex,
  type ContextMenuAction,
  type ContextMenuEntry,
} from "./menu";

export type { ContextMenuAction };
export type ContextMenuItem = ContextMenuEntry<ReactNode>;

export interface ContextMenuProps {
  items: ContextMenuItem[];
  /** The area that opens the menu: right-click, long-press, or Shift F10 when focused. */
  children: ReactNode;
  onSelect?: (item: ContextMenuAction) => void;
  onOpenChange?: (open: boolean) => void;
  /** The menu's accessible name. */
  label?: string;
  /** How long a touch holds before the menu opens, in ms. */
  longPress?: number;
  disabled?: boolean;
  className?: string;
}

type Opened = { x: number; y: number; byKeyboard: boolean };

const ITEM =
  "flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] [&_svg]:size-4 [&_svg]:shrink-0";

export function ContextMenu({
  items,
  children,
  onSelect,
  onOpenChange,
  label = "Actions",
  longPress = 480,
  disabled,
  className,
}: ContextMenuProps) {
  const [opened, setOpened] = useState<Opened | null>(null);
  const area = useRef<HTMLDivElement>(null);

  const open = (next: Opened) => {
    if (disabled) return;
    setOpened(next);
    onOpenChange?.(true);
  };
  const close = (restoreFocus: boolean) => {
    setOpened(null);
    onOpenChange?.(false);
    if (restoreFocus) area.current?.focus({ preventScroll: true });
  };

  // A touch held still opens the menu; moving or lifting first cancels it.
  const press = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  const cancelPress = () => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  };
  useEffect(() => () => clearTimeout(press.current?.timer), []);

  return (
    <>
      {/* An area, not a button: it opens on right-click, long-press or Shift F10, never on click. */}
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={area}
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="menu"
        aria-expanded={!!opened}
        aria-label={`${label}: right-click, long-press, or Shift F10`}
        className={cn("outline-offset-2", className)}
        style={{ WebkitTouchCallout: "none" }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!opened) open({ x: e.clientX, y: e.clientY, byKeyboard: false });
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "touch") return;
          const { clientX: x, clientY: y } = e;
          cancelPress();
          press.current = {
            x,
            y,
            timer: setTimeout(() => open({ x, y, byKeyboard: false }), longPress),
          };
        }}
        onPointerMove={(e) => {
          const p = press.current;
          if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) cancelPress();
        }}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onKeyDown={(e) => {
          if (!((e.shiftKey && e.key === "F10") || e.key === "ContextMenu")) return;
          e.preventDefault();
          const r = e.currentTarget.getBoundingClientRect();
          open({ x: r.left + 16, y: r.top + 16, byKeyboard: true });
        }}
      >
        {children}
      </div>
      <AnimatePresence>
        {opened && (
          <MenuPanel
            key="menu"
            at={opened}
            items={items}
            label={label}
            onClose={close}
            onSelect={(item) => {
              close(true);
              onSelect?.(item);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function MenuPanel({
  at,
  items,
  label,
  onClose,
  onSelect,
}: {
  at: Opened;
  items: ContextMenuItem[];
  label: string;
  onClose: (restoreFocus: boolean) => void;
  onSelect: (item: ContextMenuAction) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const reduced = useReducedMotion() ?? false;
  const [place, setPlace] = useState<ReturnType<typeof placeMenu> | null>(null);
  const [active, setActive] = useState(at.byKeyboard ? edgeIndex(items, "first") : -1);
  const typed = useRef({ query: "", at: 0 });

  // Measure, then place inside the viewport before the first paint.
  useLayoutEffect(() => {
    const el = ref.current!;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    setPlace(placeMenu(at, { width: el.offsetWidth, height: el.offsetHeight }, viewport));
    el.focus({ preventScroll: true });
  }, [at]);

  // Anything outside the menu, a scroll or a resize closes it.
  useEffect(() => {
    const away = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) onClose(false);
    };
    const dismiss = () => onClose(false);
    document.addEventListener("pointerdown", away, true);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      document.removeEventListener("pointerdown", away, true);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [onClose]);

  const choose = (i: number) => {
    const item = items[i];
    if (item && (item.type ?? "item") === "item" && !(item as ContextMenuAction).disabled)
      onSelect(item as ContextMenuAction);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const move = (i: number) => {
      e.preventDefault();
      if (i >= 0) setActive(i);
    };
    if (e.key === "ArrowDown") return move(stepIndex(items, active, 1));
    if (e.key === "ArrowUp") return move(stepIndex(items, active < 0 ? items.length : active, -1));
    if (e.key === "Home") return move(edgeIndex(items, "first"));
    if (e.key === "End") return move(edgeIndex(items, "last"));
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      return choose(active);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      return onClose(true);
    }
    if (e.key === "Tab") return onClose(true);
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      const now = Date.now();
      const query = (now - typed.current.at < 600 ? typed.current.query : "") + e.key;
      typed.current = { query, at: now };
      move(typeaheadIndex(items, active, query));
    }
  };

  const enter = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -4 };

  return createPortal(
    <motion.div
      ref={ref}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed z-50 min-w-56 rounded-xl border border-white/8 bg-[#16161b]/95 p-1 text-[#ededf0] shadow-[0_18px_50px_-12px_rgba(0,0,0,.7)] outline-none"
      style={{
        left: place?.x ?? at.x,
        top: place?.y ?? at.y,
        transformOrigin: place?.origin,
        visibility: place ? "visible" : "hidden",
      }}
      initial={enter}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={reduced ? { duration: 0.12 } : { type: "spring", stiffness: 520, damping: 34 }}
      onPointerLeave={() => setActive(-1)}
    >
      {items.map((item, i) => {
        if (item.type === "separator")
          return <hr key={item.id ?? `sep-${i}`} className="mx-1 my-1 h-px border-0 bg-white/8" />;
        if (item.type === "label")
          return (
            <div
              key={item.id ?? `label-${i}`}
              role="presentation"
              className="px-2 pt-2 pb-1 font-mono text-[10px] tracking-[0.14em] text-[#75757f] uppercase"
            >
              {item.label}
            </div>
          );
        // The menu owns the keyboard and points at items with aria-activedescendant.
        return (
          // oxlint-disable-next-line jsx-a11y/click-events-have-key-events
          <div
            key={item.id}
            id={`${id}-${i}`}
            role="menuitem"
            aria-label={item.label}
            aria-disabled={item.disabled || undefined}
            className={cn(
              ITEM,
              "relative cursor-default",
              item.disabled ? "opacity-40" : item.destructive ? "text-[#ff8a80]" : "",
            )}
            onPointerMove={() => !item.disabled && active !== i && setActive(i)}
            onClick={() => choose(i)}
          >
            {active === i && (
              <motion.span
                layoutId={`${id}-highlight`}
                className={cn(
                  "absolute inset-0 rounded-md",
                  item.destructive ? "bg-[#ff5d52]/14" : "bg-white/[0.07]",
                )}
                transition={
                  reduced ? { duration: 0 } : { type: "spring", stiffness: 700, damping: 45 }
                }
              />
            )}
            <span className="relative flex size-4 items-center justify-center text-[#a9a9b3]">
              {item.icon}
            </span>
            <span className="relative flex-1">{item.label}</span>
            {item.shortcut && (
              <kbd className="relative font-mono text-[11px] text-[#75757f]">{item.shortcut}</kbd>
            )}
          </div>
        );
      })}
    </motion.div>,
    document.body,
  );
}
