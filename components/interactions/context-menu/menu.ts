/** Placement and keyboard logic for the Context Menu: no React, so it can be tested. */

export type ContextMenuAction = {
  id: string;
  label: string;
  /** Printed on the right, e.g. "⌘D". Display only: the menu doesn't bind it. */
  shortcut?: string;
  disabled?: boolean;
  /** Red, for actions that delete or can't be undone. */
  destructive?: boolean;
};

export type ContextMenuEntry<Icon = unknown> =
  | (ContextMenuAction & { type?: "item"; icon?: Icon })
  | { type: "separator"; id?: string }
  | { type: "label"; id?: string; label: string };

type Point = { x: number; y: number };
type Size = { width: number; height: number };

/**
 * Where the menu goes: at the pointer, opening down and right, flipped to whichever side has room,
 * then kept `margin` inside the viewport. The origin is the corner nearest the pointer, so the menu
 * grows out of where it was asked for.
 */
export function placeMenu(at: Point, menu: Size, viewport: Size, margin = 8) {
  const flipX = at.x + menu.width + margin > viewport.width && at.x - menu.width >= margin;
  const flipY = at.y + menu.height + margin > viewport.height && at.y - menu.height >= margin;
  const rawX = flipX ? at.x - menu.width : at.x;
  const rawY = flipY ? at.y - menu.height : at.y;
  const fit = (v: number, size: number, room: number) =>
    Math.max(margin, Math.min(v, room - size - margin));
  return {
    x: fit(rawX, menu.width, viewport.width),
    y: fit(rawY, menu.height, viewport.height),
    origin: `${flipX ? "right" : "left"} ${flipY ? "bottom" : "top"}`,
  };
}

const actionable = (entry: ContextMenuEntry) =>
  (entry.type === undefined || entry.type === "item") && !(entry as ContextMenuAction).disabled;

/** The next enabled item from `from` in `direction`, wrapping; -1 when none is enabled. */
export function stepIndex(entries: ContextMenuEntry[], from: number, direction: 1 | -1): number {
  const n = entries.length;
  for (let k = 1; k <= n; k++) {
    const i = (((from + direction * k) % n) + n) % n;
    if (actionable(entries[i])) return i;
  }
  return -1;
}

/** The first or last enabled item. */
export const edgeIndex = (entries: ContextMenuEntry[], edge: "first" | "last") =>
  edge === "first" ? stepIndex(entries, -1, 1) : stepIndex(entries, entries.length, -1);

/** The next enabled item after `from` whose label starts with `query`, case-insensitively. */
export function typeaheadIndex(entries: ContextMenuEntry[], from: number, query: string): number {
  const q = query.toLowerCase();
  const n = entries.length;
  // A repeated single letter cycles through matches; a longer query may stay on the current one.
  const start = q.length > 1 ? 0 : 1;
  for (let k = start; k < n + start; k++) {
    const i = (((from + k) % n) + n) % n;
    const e = entries[i];
    if (actionable(e) && (e as ContextMenuAction).label.toLowerCase().startsWith(q)) return i;
  }
  return -1;
}
