import { describe, expect, it } from "vitest";
import { keying, morseOf, telegram, toGlyphs } from "@/components/ovio/letter/morse";
import { noseFor, PLANE, PLANE_TIMES, turn } from "@/components/ovio/letter/plane";
import { foldFrames, isEmail } from "@/components/ovio/letter/send";

describe("letter morse", () => {
  it("encodes letters, digits and the @ of an address", () => {
    expect(morseOf("s")).toBe("...");
    expect(morseOf("0")).toBe("-----");
    expect(morseOf("@")).toBe(".--.-.");
    expect(morseOf("é")).toBe(".");
  });

  it("draws one glyph per character, so the glyph line lies exactly over the text", () => {
    const line = "UNTIL NEXT THURSDAY STOP";
    expect(toGlyphs(line)).toHaveLength(line.length);
    expect(toGlyphs("SOS")).toBe("·-·");
    expect(toGlyphs("A B")).toBe("· -");
  });

  it("writes telegram lines that end on one STOP", () => {
    expect(telegram("Dear reader,")).toBe("DEAR READER STOP");
    expect(telegram("It broke twice. Guards see more.")).toBe(
      "IT BROKE TWICE STOP GUARDS SEE MORE STOP",
    );
    expect(telegram("")).toBe("");
  });

  it("keys a message: tape and text fill in order and finish complete", () => {
    const k = keying("42 K");
    expect(k.text).toBe("42 K");
    expect(k.tape).toBe("····- ··---    -·- ");
    for (let u = 1; u <= k.total; u++) {
      expect(k.tapeEnd[u]).toBeGreaterThanOrEqual(k.tapeEnd[u - 1]);
      expect(k.textEnd[u]).toBeGreaterThanOrEqual(k.textEnd[u - 1]);
    }
    expect(k.textEnd[k.total]).toBe(k.text.length);
    expect(k.tapeEnd[k.total]).toBe(k.tape.length);
    // The key is down for 3 dashes' and 7 dots' worth of units in "4" (....-) and "2" (..---) and "K" (-.-).
    expect(k.lit.reduce((a, b) => a + b, 0)).toBe(4 + 3 + (2 + 9) + (3 + 1 + 3));
  });
});

describe("letter send", () => {
  it("accepts an address and rejects what isn't one", () => {
    expect(isEmail(" reader@example.com ")).toBe(true);
    expect(isEmail("first.last+news@sub.example.co.uk")).toBe(true);
    expect(isEmail("reader@example")).toBe(false);
    expect(isEmail("two words@example.com")).toBe(false);
    expect(isEmail("")).toBe(false);
  });

  it("folds from full size to a third of the scaled height", () => {
    expect(foldFrames(0.6)).toEqual([
      "scale(1, 1)",
      "scale(0.6, 0.6)",
      "scale(0.6, 0.4)",
      "scale(0.6, 0.2)",
    ]);
  });
});

describe("letter plane", () => {
  it("draws every fold stage with the same commands, so the outline can morph", () => {
    const shape = (d: string) => d.replace(/[\d.]+/g, "n");
    for (const stages of [PLANE.left, PLANE.right, PLANE.keel]) {
      expect(stages).toHaveLength(PLANE_TIMES.length);
      expect(new Set(stages.map(shape)).size).toBe(1);
    }
  });

  it("mirrors the right wing from the left", () => {
    expect(PLANE.left[0]).toBe("M0 0 L50 0 L50 130 L0 130 L0 45 Z");
    expect(PLANE.right[0]).toBe("M100 0 L50 0 L50 130 L100 130 L100 45 Z");
  });

  it("turns the short way round, and points the nose-up drawing along a heading", () => {
    expect(turn(170, -170)).toBe(20);
    expect(turn(-170, 170)).toBe(-20);
    expect(turn(10, 40)).toBe(30);
    expect(noseFor(-90)).toBe(0);
  });
});
