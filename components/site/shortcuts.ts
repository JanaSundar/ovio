/**
 * The key of a press meant as a site shortcut, or null when it belongs to something else:
 * a modified key (a browser or system shortcut) or typing in a field.
 */
export function shortcutKey(e: KeyboardEvent): string | null {
  if (e.metaKey || e.ctrlKey || e.altKey) return null;
  const t = e.target as HTMLElement | null;
  if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return null;
  return e.key;
}
