import { useRef } from "react";
import { ToyKey } from "@/components/shared/toy";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { LetterWorldProps } from "../letter";
import { Paragraphs, Postscript, SentNotice, type PostscriptLook } from "../parts";
import { fold } from "../send";
import { useSend } from "../use-send";

/** Width the letter folds down to: a card that fits the slot. */
const CARD = 170;
const OVERSHOOT: [number, number, number, number] = [0.3, 1.45, 0.5, 1];
const { piece, slide } = motionTokens.toy;

const PS: PostscriptLook = {
  form: "mt-2 border-t-3 border-dotted border-(--ovio-line) pt-3.5",
  row: "flex flex-wrap items-center gap-2.5",
  label: "font-black",
  input:
    "h-10.5 min-w-36 rounded-xl bg-white px-3 text-sm text-(--ovio-ink) shadow-[inset_0_3px_0_var(--ovio-line)] placeholder:text-(--ovio-faint)",
  error: "mt-1.5 min-h-4 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-red-deep)",
};

/** Five plastic digit tiles. */
function Counter({ value }: { value: number }) {
  return (
    <span className="flex justify-center gap-1">
      {String(value % 1e5)
        .padStart(5, "0")
        .split("")
        .map((d, i) => (
          <span
            key={i}
            className="flex h-7 w-5.5 items-center justify-center rounded-md bg-(--ovio-surface) font-(family-name:--ovio-mono) text-base font-bold text-(--ovio-ink) shadow-[inset_0_-3px_0_var(--ovio-line)]"
          >
            {d}
          </span>
        ))}
    </span>
  );
}

/**
 * Toy: a chunky card of a letter. Sending folds it into a card that hops up and drops through the
 * slot of a plastic mailbox; the box squashes, the flag springs up and the counter ticks over.
 */
export default function ToyLetter(p: LetterWorldProps) {
  const mask = useRef<HTMLDivElement>(null);

  const scope = useSend(p.status === "sent", async (animate, root, t) => {
    const $ = (name: string) => root.querySelector<HTMLElement>(`[data-${name}]`)!;
    const sheet = $("sheet");
    const card = $("card");
    const box = root.getBoundingClientRect();
    const paper = sheet.getBoundingClientRect();
    const slot = $("slot").getBoundingClientRect();
    const s = CARD / paper.width;
    const height = (paper.height * s) / 3;
    const top = paper.top - box.top + paper.height / 2 - height / 2;
    // The card is cut off at the slot, so it disappears into the box rather than over it.
    mask.current!.style.height = `${slot.bottom - box.top}px`;
    Object.assign(card.style, { top: `${top}px`, height: `${height}px` });

    await fold(animate, sheet, s, t, OVERSHOOT, 0.9);
    animate(sheet, { opacity: 0 }, t({ duration: 0.01 }));
    animate(card, { opacity: 1 }, t({ duration: 0.01 }));
    animate("[data-mailbox]", { opacity: [0, 1], y: [90, 0], scale: [0.9, 1] }, t(piece));
    const lift = slot.top - box.top - 60 - height - top;
    await animate(card, { y: lift, rotate: -6 }, t(slide));
    await animate(
      card,
      { y: [lift, lift, slot.bottom - box.top - top + 8], rotate: [-6, 0, 0] },
      t({ duration: 0.48, times: [0, 0.3, 1], ease: [0.55, 0, 0.9, 0.5] }),
    );
    animate(
      "[data-mailbox]",
      { scaleX: [1, 1.04, 0.98, 1], scaleY: [1, 0.95, 1.03, 1] },
      t({ duration: 0.42 }),
    );
    animate("[data-flag]", { rotate: [95, 0] }, t(piece));
    animate("[data-was]", { opacity: 0, y: -10 }, t({ duration: 0.2 }));
    await animate("[data-now]", { opacity: [0, 1], y: [10, 0] }, t(slide));
  });

  const sent = p.status === "sent";
  return (
    <div
      ref={scope}
      data-ovio-world="toy"
      className={cn(
        "relative w-full max-w-115 overflow-hidden px-1 pt-1 pb-3 font-(family-name:--ovio-font) text-(--ovio-ink)",
        p.className,
      )}
    >
      <article
        data-sheet
        aria-hidden={sent || undefined}
        inert={sent}
        className="relative rounded-2xl bg-(--ovio-surface) px-6 pt-7.5 pb-5.5 shadow-[inset_0_-5px_0_var(--ovio-line),0_8px_0_#c4bdae]"
      >
        <span
          aria-hidden
          className="absolute top-4 right-4 flex size-15.5 -rotate-10 items-center justify-center rounded-full bg-(--ovio-red) text-[13px] font-black text-white shadow-[inset_0_-4px_0_var(--ovio-red-deep)]"
          style={{ fontStretch: "118%" }}
        >
          No.{Number(p.issue)}
        </span>
        <h2
          className="m-0 pr-18 text-[26px] leading-none font-black tracking-[-0.02em]"
          style={{ fontStretch: "120%" }}
        >
          {p.greeting.replace(/,$/, "!")}
        </h2>
        <p className="m-0 mt-1.5 pr-18 font-(family-name:--ovio-mono) text-[11px] font-medium tracking-[0.06em] text-(--ovio-muted) uppercase">
          {p.name} ·{" "}
          <time dateTime={p.dateTime} className="whitespace-nowrap">
            {p.date}
          </time>
        </p>
        <div className="mt-4.5 flex flex-col gap-2.5 text-[14.5px] leading-[1.6] text-(--ovio-ink-2) [overflow-wrap:anywhere]">
          <Paragraphs body={p.body} />
          <p className="m-0 font-bold text-(--ovio-ink)">
            {p.signOff && (
              <>
                {p.signOff}
                <br />
              </>
            )}
            <span className="text-xl font-black" style={{ fontStretch: "118%" }}>
              {p.signature} ✦
            </span>
          </p>
        </div>
        <Postscript p={p} look={PS} lead={null} />
        <div className="mt-1 flex justify-end">
          <ToyKey
            depth={5}
            side="var(--ovio-yellow-deep)"
            disabled={p.status !== "idle"}
            onClick={() => p.submit()}
            className="cursor-pointer rounded-xl border-0 bg-(--ovio-yellow) px-4 py-2.5 text-sm font-black text-(--ovio-ink)"
          >
            {p.status === "sending" ? "Mailing…" : "Mail me"}
          </ToyKey>
        </div>
      </article>

      <div
        ref={mask}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-3 overflow-hidden"
      >
        <div
          data-card
          className="absolute left-1/2 -ml-21.25 w-42.5 rounded-[10px] bg-(--ovio-surface) opacity-0 shadow-[inset_0_-4px_0_var(--ovio-line)]"
        >
          <span className="absolute top-1/2 right-2.5 -mt-3.25 size-6.5 rounded-full bg-(--ovio-red) shadow-[inset_0_-3px_0_var(--ovio-red-deep)]" />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-end justify-center pb-6"
      >
        <div data-mailbox className="relative w-49 opacity-0">
          <div
            data-flag
            className="absolute top-19.5 -right-3 h-18.5 w-2.5 origin-[50%_92%] rounded-full bg-(--ovio-red-deep)"
            style={{ transform: "rotate(95deg)" }}
          >
            <span className="absolute top-0 left-2 h-6 w-9 rounded-[5px] bg-(--ovio-red) shadow-[inset_0_-3px_0_var(--ovio-red-deep)]" />
          </div>
          <div className="relative h-51.5 rounded-[98px_98px_16px_16px] bg-(--ovio-accent) shadow-[inset_0_-8px_0_var(--ovio-accent-deep),0_8px_0_var(--ovio-accent-deep)]">
            <span
              data-slot
              className="absolute inset-x-8.5 top-14 h-3.25 rounded-full bg-[#14256e] shadow-[inset_0_3px_0_#0b1645]"
            />
            <span className="absolute inset-x-4.5 top-23 grid h-7.5 rounded-lg bg-(--ovio-surface) px-2 text-xs font-extrabold shadow-[inset_0_-3px_0_var(--ovio-line)]">
              <span data-was className="col-start-1 row-start-1 self-center truncate text-center">
                {p.name}
              </span>
              <span
                data-now
                className="col-start-1 row-start-1 self-center truncate text-center opacity-0"
              >
                {p.sentTo}
              </span>
            </span>
            {p.subscribers !== undefined && (
              <span className="absolute inset-x-0 bottom-7.5 grid">
                <span data-was className="col-start-1 row-start-1">
                  <Counter value={p.subscribers - (sent ? 1 : 0)} />
                </span>
                {sent && (
                  <span data-now className="col-start-1 row-start-1 opacity-0">
                    <Counter value={p.subscribers} />
                  </span>
                )}
              </span>
            )}
          </div>
          <span className="mx-auto mt-2 block h-11 w-6.5 rounded bg-(--ovio-faint) shadow-[inset_0_-4px_0_#8a8273]" />
        </div>
      </div>
      <SentNotice p={p} />
    </div>
  );
}
