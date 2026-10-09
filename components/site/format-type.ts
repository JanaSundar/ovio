/** Types up to this long stay on one line. */
const INLINE = 28;

const OPEN = "([{";
const CLOSE = ")]}";

/** Splits on `sep` where it isn't inside brackets. */
function splitTopLevel(text: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (OPEN.includes(text[i])) depth++;
    else if (CLOSE.includes(text[i])) depth--;
    else if (depth === 0 && text.startsWith(sep, i)) {
      parts.push(text.slice(start, i).trim());
      start = i + sep.length;
      i += sep.length - 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

/** The index of the bracket that closes the one at `open`. */
function closing(text: string, open: number) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (OPEN.includes(text[i])) depth++;
    else if (CLOSE.includes(text[i]) && --depth === 0) return i;
  }
  return text.length - 1;
}

/** Puts each member of a long object type on its own line; short objects stay inline. */
function expandObjects(type: string, depth: number): string {
  let out = "";
  for (let i = 0; i < type.length; i++) {
    if (type[i] !== "{") {
      out += type[i];
      continue;
    }
    const end = closing(type, i);
    if (end - i + 1 <= INLINE) {
      out += type.slice(i, end + 1);
      i = end;
      continue;
    }
    const body = type.slice(i + 1, end).trim();
    const sep = splitTopLevel(body, ";").length > 1 ? ";" : ",";
    const pad = "  ".repeat(depth + 1);
    const members = splitTopLevel(body, sep)
      .filter(Boolean)
      .map((m) => pad + expandObjects(m, depth + 1));
    out += `{\n${members.join(`${sep}\n`)}\n${"  ".repeat(depth)}}`;
    i = end;
  }
  return out;
}

/**
 * A prop's TypeScript type laid out for reading: a long union one member per line, and a long
 * object one member per line, indented. Short types are returned as they are.
 */
export function formatType(type: string): string {
  if (type.length <= INLINE) return type;
  const union = splitTopLevel(type, " | ");
  if (union.length > 1) return union.map((t) => `| ${expandObjects(t, 0)}`).join("\n");
  return expandObjects(type, 0);
}
