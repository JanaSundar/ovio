/**
 * International Morse, and a keying schedule a frame callback can read without allocating:
 * the units of a message laid out once, then looked up by the current unit.
 */

const CODE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "@": ".--.-.",
  "-": "-....-",
  _: "..--.-",
  "+": ".-.-.",
  "/": "-..-.",
  ":": "---...",
  "'": ".----.",
};

/** A dot prints as a middle dot so it sits on the line like a dash does. */
const glyph = (symbol: string) => (symbol === "." ? "·" : "-");

/** A character's code, or a dot for one Morse has no code for (an accented letter, an emoji). */
export const morseOf = (char: string) => CODE[char.toUpperCase()] ?? ".";

/**
 * One glyph per character, spaces kept: the line as it would look mid-encode. In a monospace face
 * it has the same width as the text, so it can sit exactly over it.
 */
export const toGlyphs = (text: string) =>
  Array.from(text, (c) => (c === " " ? " " : glyph(morseOf(c)[0]))).join("");

/** Units in the standard timing: a dot is 1, a dash 3, 1 between symbols, 3 between letters, 7 between words. */
const DOT = 1;
const DASH = 3;
const SYMBOL_GAP = 1;
const LETTER_GAP = 3;
const WORD_GAP = 7;

export type Keying = {
  /** Every unit's state, indexed by the whole unit: is the key down, how much of the tape and text is out. */
  lit: Uint8Array;
  tapeEnd: Uint16Array;
  textEnd: Uint16Array;
  /** The full tape ("·- -···") and the text it spells, sliced by tapeEnd and textEnd. */
  tape: string;
  text: string;
  /** Units in the whole message. */
  total: number;
};

/** Lays out a message unit by unit. Glyphs land on the tape as each mark starts; letters decode when it ends. */
export function keying(message: string): Keying {
  const text = message.toUpperCase();
  const marks: { start: number; length: number; tape: number; text: number }[] = [];
  let unit = 0;
  let tape = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === " ") {
      unit += WORD_GAP - LETTER_GAP;
      tape += "   ";
      continue;
    }
    const code = morseOf(c);
    for (let s = 0; s < code.length; s++) {
      tape += glyph(code[s]);
      const length = code[s] === "." ? DOT : DASH;
      marks.push({
        start: unit,
        length,
        tape: tape.length,
        text: s === code.length - 1 ? i + 1 : i,
      });
      unit += length + SYMBOL_GAP;
    }
    tape += " ";
    unit += LETTER_GAP - SYMBOL_GAP;
  }

  const total = Math.max(1, unit);
  const lit = new Uint8Array(total + 1);
  const tapeEnd = new Uint16Array(total + 1);
  const textEnd = new Uint16Array(total + 1);
  let m = 0;
  let shownTape = 0;
  let shownText = 0;
  for (let u = 0; u <= total; u++) {
    while (m < marks.length && marks[m].start <= u) {
      shownTape = marks[m].tape;
      if (u >= marks[m].start + marks[m].length) shownText = marks[m].text;
      if (u < marks[m].start + marks[m].length) break;
      m++;
    }
    const mark = marks[m];
    lit[u] = mark && u >= mark.start && u < mark.start + mark.length ? 1 : 0;
    tapeEnd[u] = shownTape;
    textEnd[u] = shownText;
  }
  textEnd[total] = text.length;
  tapeEnd[total] = tape.length;
  return { lit, tapeEnd, textEnd, tape, text, total };
}

/** Telegram style: upper case, every sentence ended with STOP, a trailing comma dropped for one. */
export function telegram(text: string) {
  const line = text
    .toUpperCase()
    .replace(/[.!?](\s+|$)/g, " STOP ")
    .replace(/[,;:]\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return line && !line.endsWith("STOP") ? `${line} STOP` : line;
}
