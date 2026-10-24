import type { ReactNode } from "react";

/** One entry on the ring. Items with `items` open a branch of children past the ring. */
export type DialMenuItem = {
  id: string;
  label: string;
  /** Drawn on the ring; give it `currentColor` so it takes the world's ink. Without one, the label's first letter. */
  icon?: ReactNode;
  /** Shown under the label in the hub, like "⌘K". */
  shortcut?: string;
  disabled?: boolean;
  /** Children, fanned out past the ring beside this item. One level deep. */
  items?: Omit<DialMenuItem, "items">[];
};

/** How the menu opens: on right-click or long-press, on click, or always open in place. */
export type DialMenuTrigger = "contextmenu" | "click" | "inline";
