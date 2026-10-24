"use client";

import { useMotionValue, type MotionValue } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import {
  aimAt,
  angleOf,
  childAngle,
  directionOf,
  nearestAngle,
  nextEnabled,
  NOTHING,
  placeMenu,
  type Aim,
} from "./dial";
import type { DialMenuItem, DialMenuTrigger } from "./types";

/** How long a finger rests before the menu opens under it. */
const LONG_PRESS = 450;
/** Pointer travel, in px, that turns a press into a drag: past it, letting go picks. */
const DRAG = 12;
/** Page scroll, in px, that closes the popup. */
const SCROLL_AWAY = 48;

type Options = {
  items: DialMenuItem[];
  trigger: DialMenuTrigger;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelect?: (item: DialMenuItem, parent?: DialMenuItem) => void;
  disabled?: boolean;
};

const same = (a: Aim, b: Aim) => a.main === b.main && a.branch === b.branch && a.sub === b.sub;

/** Aim at item `main`, opening its branch when it has one. */
const aimItem = (items: DialMenuItem[], main: number): Aim => ({
  main,
  branch: items[main]?.items?.length ? main : -1,
  sub: -1,
});

export type Dial = ReturnType<typeof useDial>;

/**
 * The menu's state and every way in: right-click, long-press, click or the ContextMenu key opens
 * it around the pointer; the pointer's direction aims, so a flick and release picks like a marking
 * menu; a click picks too, and the hub closes. Arrow keys go round, Enter picks or steps into a
 * branch, Escape steps back out and then closes.
 */
export function useDial({ items, trigger, open, setOpen, onSelect, disabled }: Options) {
  const inline = trigger === "inline";
  const id = useId();
  /** The popup's centre on screen, kept from the press that opened it. */
  const [placed, setPlaced] = useState<{ x: number; y: number } | null>(null);
  const origin = open ? placed : null;
  const [aim, setAimState] = useState<Aim>(NOTHING);
  /** Whether the keys move round the branch rather than the ring. */
  const [inBranch, setInBranch] = useState(false);
  const aimRef = useRef(aim);
  /** The pointer's direction from the centre, unwound, for the needle on the hub. */
  const needle = useMotionValue(-90);
  const pointing = useMotionValue(0);

  const anchorRef = useRef<HTMLSpanElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const press = useRef<{ x: number; y: number; at: number; down: boolean } | null>(null);
  const longPress = useRef<ReturnType<typeof setTimeout>>(undefined);

  const shape = items.map((i) => ({ children: i.items?.length ?? 0, disabled: i.disabled }));
  const disabledMain = items.map((i) => !!i.disabled);

  const setAim = (next: Aim) => {
    if (same(aimRef.current, next)) return;
    aimRef.current = next;
    setAimState(next);
  };

  const point = (deg: number) => {
    needle.set(nearestAngle(needle.get(), deg));
    pointing.set(1);
  };

  /** Points the needle at whatever is aimed at, for keys. */
  const pointAt = (next: Aim) => {
    if (next.main < 0) return pointing.set(0);
    const parent = angleOf(next.main, items.length);
    const kids = items[next.main].items?.length ?? 0;
    point(next.sub >= 0 ? childAngle(parent, next.sub, kids) : parent);
  };

  const openAt = (x: number, y: number, byKeys: boolean) => {
    if (disabled || inline) return;
    restore.current = document.activeElement as HTMLElement | null;
    setPlaced(placeMenu(x, y, window.innerWidth, window.innerHeight));
    press.current = { x, y, at: performance.now(), down: false };
    const first = nextEnabled(disabledMain, -1, 1, false);
    const start = byKeys && first >= 0 ? aimItem(items, first) : NOTHING;
    setAim(start);
    setInBranch(false);
    pointAt(start);
    if (!open) setOpen(true);
  };

  const close = () => {
    setAim(NOTHING);
    setInBranch(false);
    pointing.set(0);
    if (inline) return;
    setOpen(false);
    restore.current?.focus({ preventScroll: true });
  };

  const choose = (item: DialMenuItem, parent?: DialMenuItem) => {
    onSelect?.(item, parent);
    if (inline) setInBranch(false);
    else close();
  };

  /** Acts on what's aimed at: picks it, steps into its branch, or closes on the hub. */
  const commit = (at: Aim, byKeys: boolean) => {
    const parent = items[at.main];
    if (at.sub >= 0 && parent?.items) return choose(parent.items[at.sub], parent);
    if (!parent) return byKeys || close();
    if (!parent.items?.length) return choose(parent);
    // A branch: the keys step into it; a click just leaves it open to pick from.
    if (byKeys) {
      const k = nextEnabled(
        parent.items.map((c) => !!c.disabled),
        -1,
        1,
        false,
      );
      const next = { main: at.main, branch: at.main, sub: Math.max(0, k) };
      setInBranch(true);
      setAim(next);
      pointAt(next);
    }
  };

  // Opened from outside (controlled `open`), it centres on the trigger once that's laid out; closed
  // from outside, it forgets where it was.
  useEffect(() => {
    if (inline || open === (placed !== null)) return;
    const frame = requestAnimationFrame(() => {
      if (!open) return setPlaced(null);
      const r = (anchorRef.current?.firstElementChild ?? document.body).getBoundingClientRect();
      setPlaced(placeMenu(r.left + r.width / 2, r.top + r.height / 2, innerWidth, innerHeight));
    });
    return () => cancelAnimationFrame(frame);
  }, [open, inline, placed]);

  /** Focuses the popup as it mounts, so the keys reach it. */
  const focusOnMount = useCallback(
    (el: HTMLDivElement | null) => {
      if (el && !inline) el.focus({ preventScroll: true });
    },
    [inline],
  );

  // While the popup is open the whole screen aims: the pointer can be anywhere, even mid-drag.
  const latest = useRef<{
    track: (e: globalThis.PointerEvent) => void;
    up: () => void;
    close: () => void;
  }>(null);
  const handlers: NonNullable<typeof latest.current> = {
    close,
    track: (e) => {
      if (!origin) return;
      const dx = e.clientX - origin.x;
      const dy = e.clientY - origin.y;
      setAim(aimAt(dx, dy, shape, aimRef.current.branch));
      if (Math.hypot(dx, dy) < 8) pointing.set(0);
      else point(directionOf(dx, dy));
      if (aimRef.current.main >= 0) setInBranch(false);
    },
    up: () => {
      const p = press.current;
      if (!p) return;
      const dragged = !p.down && performance.now() - p.at > 120 && aimRef.current.main >= 0;
      if (p.down || dragged) commit(aimRef.current, false);
      if (press.current) press.current.down = false;
    },
  };
  useEffect(() => {
    latest.current = handlers;
  });
  useEffect(() => {
    if (!open || inline) return;
    const move = (e: globalThis.PointerEvent) => latest.current?.track(e);
    const down = () => {
      if (press.current) press.current.down = true;
    };
    const up = () => latest.current?.up();
    // It's pinned where it opened, so it goes when the page moves out from under it; a smooth
    // scroll still settling as it opens doesn't count.
    const away = () => latest.current?.close();
    const startY = window.scrollY;
    const scrolled = () => {
      if (Math.abs(window.scrollY - startY) > SCROLL_AWAY) away();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("resize", away);
    window.addEventListener("scroll", scrolled);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("resize", away);
      window.removeEventListener("scroll", scrolled);
    };
  }, [open, inline]);

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const current = aimRef.current;
    const arrows: Record<string, 1 | -1> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    const by = arrows[e.key] as 1 | -1 | undefined;
    let next: Aim | null = null;
    if (inBranch && current.branch >= 0) {
      const kids = (items[current.branch].items ?? []).map((c) => !!c.disabled);
      if (by) next = { ...current, sub: nextEnabled(kids, current.sub, by, false) };
      else if (e.key === "Home") next = { ...current, sub: nextEnabled(kids, -1, 1, false) };
      else if (e.key === "End")
        next = { ...current, sub: nextEnabled(kids, kids.length, -1, false) };
      else if (e.key === "Escape" || e.key === "Backspace") {
        next = aimItem(items, current.branch);
        setInBranch(false);
      }
    } else {
      const from = current.main >= 0 ? current.main : by === -1 ? 0 : -1;
      if (by) next = aimItem(items, nextEnabled(disabledMain, from, by, true));
      else if (e.key === "Home") next = aimItem(items, nextEnabled(disabledMain, -1, 1, false));
      else if (e.key === "End")
        next = aimItem(items, nextEnabled(disabledMain, items.length, -1, false));
      else if (e.key === "Escape") {
        e.preventDefault();
        return close();
      } else if (e.key === "Tab" && !inline) {
        e.preventDefault();
        return close();
      }
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      return commit(current, true);
    }
    if (!next) return;
    e.preventDefault();
    setAim(next);
    pointAt(next);
  };

  /** Inline, the menu itself aims, from its own centre. */
  const trackInline = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    setAim(aimAt(dx, dy, shape, aimRef.current.branch));
    setInBranch(false);
    if (Math.hypot(dx, dy) < 8) pointing.set(0);
    else point(directionOf(dx, dy));
  };

  const cancelLongPress = () => clearTimeout(longPress.current);

  const itemId = (main: number, sub = -1) => `${id}-${main}${sub >= 0 ? `-${sub}` : ""}`;
  const active = aim.main >= 0 ? itemId(aim.main, aim.sub) : undefined;

  return {
    inline,
    origin,
    aim,
    inBranch,
    needle: needle as MotionValue<number>,
    pointing: pointing as MotionValue<number>,
    itemId,
    close,
    /** Spread on the wrapper round the trigger; it lays out as its children do. */
    anchor: {
      ref: anchorRef,
      className: "contents",
      onContextMenu: (e: MouseEvent) => {
        if (trigger !== "contextmenu" || disabled) return;
        e.preventDefault();
        // A long-press already opened it; the browser's own contextmenu follows.
        if (open && press.current && performance.now() - press.current.at < 800) return;
        openAt(e.clientX, e.clientY, false);
      },
      onClick: (e: MouseEvent) => {
        if (trigger !== "click" || disabled) return;
        // A key press clicks at 0,0: open on the focused element instead.
        if (e.detail === 0) {
          const r = (e.target as HTMLElement).getBoundingClientRect();
          openAt(r.left + r.width / 2, r.top + r.height / 2, true);
        } else openAt(e.clientX, e.clientY, false);
      },
      onKeyDown: (e: KeyboardEvent) => {
        if (trigger !== "contextmenu" || disabled) return;
        if (e.key !== "ContextMenu" && !(e.shiftKey && e.key === "F10")) return;
        e.preventDefault();
        const r = (e.target as HTMLElement).getBoundingClientRect();
        openAt(r.left + r.width / 2, r.top + r.height / 2, true);
      },
      onPointerDown: (e: PointerEvent) => {
        if (trigger !== "contextmenu" || e.pointerType !== "touch" || disabled) return;
        const { clientX: x, clientY: y } = e;
        cancelLongPress();
        longPress.current = setTimeout(() => openAt(x, y, false), LONG_PRESS);
        press.current = { x, y, at: performance.now(), down: false };
      },
      onPointerMove: (e: PointerEvent) => {
        const p = press.current;
        if (!open && p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > DRAG) cancelLongPress();
      },
      onPointerUp: cancelLongPress,
      onPointerCancel: cancelLongPress,
    },
    /** Spread on the menu: a focusable `menu` that answers the keys. */
    menu: {
      ref: focusOnMount,
      role: "menu",
      tabIndex: disabled ? -1 : 0,
      "aria-activedescendant": active,
      "aria-disabled": disabled || undefined,
      onKeyDown: onMenuKey,
      ...(inline && !disabled
        ? {
            onPointerMove: trackInline,
            onPointerLeave: () => !inBranch && setAim(NOTHING),
            onPointerDown: () => {
              press.current = { x: 0, y: 0, at: 0, down: true };
            },
            onPointerUp: () => {
              if (press.current?.down && aimRef.current.main >= 0) commit(aimRef.current, false);
              press.current = null;
            },
          }
        : {}),
    },
  };
}
