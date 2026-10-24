"use client";

import { AnimatePresence } from "motion/react";
import { type ComponentType, type ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { useWorld } from "@/components/shared/world-provider";
import { everyWorld, type InstalledWorld } from "@/lib/world";
import { MENU_SIZE } from "./dial";
import type { DialMenuItem, DialMenuTrigger } from "./types";
import { useDial, type Dial } from "./use-dial";
import * as worlds from "./worlds";

export type { DialMenuItem, DialMenuTrigger } from "./types";

export interface DialMenuProps {
  variant?: InstalledWorld<typeof worlds>;
  /** Round the ring from 12 o'clock, clockwise. Up to eight read best; children up to five. */
  items: DialMenuItem[];
  /** Right-click or long-press the children, click them, or keep the menu open in place. */
  trigger?: DialMenuTrigger;
  /** What opens it: the area to right-click, or the button to click. Unused inline. */
  children?: ReactNode;
  /** Controlled. Opened from outside, it centres on the children. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fires with the item picked, and its parent when it's a child. */
  onSelect?: (item: DialMenuItem, parent?: DialMenuItem) => void;
  /** Accessible name for the menu, shown in the hub while nothing is aimed at. */
  label?: string;
  disabled?: boolean;
  className?: string;
}

export type DialWorldProps = {
  items: DialMenuItem[];
  dial: Dial;
  label: string;
  disabled?: boolean;
  className?: string;
};

/** The installed worlds; a single-world install draws its one world for any provider world. */
const VIEWS = everyWorld<ComponentType<DialWorldProps>>(worlds);

export function DialMenu({
  variant,
  items,
  trigger = "contextmenu",
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  label = "Quick actions",
  disabled,
  className,
}: DialMenuProps) {
  const world = useWorld(variant);
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const dial = useDial({
    items,
    trigger,
    open,
    setOpen: (next) => {
      if (openProp === undefined) setInner(next);
      onOpenChange?.(next);
    },
    onSelect,
    disabled,
  });

  const View = VIEWS[world] ?? VIEWS.minimal;
  const view = (
    <View items={items} dial={dial} label={label} disabled={disabled} className={className} />
  );
  if (dial.inline) return view;

  const { origin } = dial;
  return (
    <>
      <span {...dial.anchor}>{children}</span>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && origin && (
              <div
                key="dial-menu"
                className="fixed inset-0 z-1000 touch-none select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                <div
                  className="absolute"
                  style={{
                    left: origin.x - MENU_SIZE / 2,
                    top: origin.y - MENU_SIZE / 2,
                    width: MENU_SIZE,
                    height: MENU_SIZE,
                  }}
                >
                  {view}
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
