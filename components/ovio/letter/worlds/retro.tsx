import { motion, stagger, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useMemo } from "react";
import { motionTokens, steps, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { LetterWorldProps } from "../letter";
import { keying, telegram, toGlyphs, type Keying } from "../morse";
import { Postscript, SentNotice, type PostscriptLook } from "../parts";
import { useSend } from "../use-send";

/** Seconds per Morse unit, slowed for short addresses and sped up so a long one keys out in ~4s. */
const unitFor = (total: number) => Math.min(0.022, 4 / total);

const PS: PostscriptLook = {
  form: "mt-1 border-t border-dashed border-(--ovio-faint) pt-2.5",
  row: "flex flex-wrap items-baseline gap-x-2",
  input:
    "min-w-40 font-[inherit] text-(--ovio-ink) uppercase caret-(--ovio-ink) placeholder:text-(--ovio-faint)",
  button:
    "border-0 bg-transparent p-0 font-[inherit] text-(--ovio-ink) disabled:text-(--ovio-muted)",
  error: "min-h-5.5 text-(--ovio-ink-2)",
};

/**
 * Retro: a telegram on a phosphor screen. Sending encodes every line to Morse, then keys the
 * reader's address out on a lamp and tape, dimming each line as the wire carries it.
 */
export function RetroLetter(p: LetterWorldProps) {
  const unit = useMotionValue(0);
  const sent = p.status === "sent";
  const wire = useMemo(() => keying(`${p.issue} ${p.sentTo} K`), [p.issue, p.sentTo]);
  const lines = useMemo(
    () => [
      ...[p.greeting, ...p.body, p.signOff ?? ""].map(telegram).filter(Boolean),
      `-- ${p.signature.toUpperCase()}`,
    ],
    [p.greeting, p.body, p.signOff, p.signature],
  );

  const scope = useSend(sent, async (animate, _root, t) => {
    await animate(
      "[data-glyphs]",
      { clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
      t({ duration: 0.9, ease: steps(14), delay: stagger(0.08) }),
    );
    const duration = wire.total * unitFor(wire.total);
    animate(
      "[data-line]",
      { opacity: 0.3 },
      t({ duration: 0.01, delay: stagger(duration / lines.length) }),
    );
    await animate(unit, wire.total, t({ duration, ease: "linear" }));
    await animate("[data-ack]", { opacity: 1 }, t(motionTokens.retro.frames(1, 0.01)));
  });

  return (
    <div
      ref={scope}
      data-ovio-world="retro"
      className={cn(
        "relative w-full max-w-115 overflow-hidden border-2 border-(--ovio-line) bg-(--ovio-surface) font-(family-name:--ovio-font) text-[19px] leading-[22px] text-(--ovio-ink) text-shadow-(--ovio-glow)",
        p.className,
      )}
    >
      <div className="flex justify-between gap-3 bg-(--ovio-accent) px-2.5 py-0.5 text-(--ovio-on-accent) text-shadow-none">
        <span className="truncate">OVIO TELEGRAPH</span>
        <span className="shrink-0">WIRE {p.issue}</span>
      </div>
      <div className="px-4 pt-4 pb-3">
        <div className="flex justify-between gap-3">
          <span className="min-w-0 truncate">FROM: {p.name.toUpperCase()}</span>
          <time dateTime={p.dateTime} className="shrink-0">
            {p.date.toUpperCase()}
          </time>
        </div>
        <div aria-hidden className="mb-3 overflow-hidden whitespace-nowrap text-(--ovio-ink-2)">
          {"-".repeat(60)}
        </div>
        <div
          aria-hidden={sent || undefined}
          className="flex flex-col gap-[22px] [overflow-wrap:anywhere]"
        >
          {lines.map((line, i) => (
            <p key={i} data-line className="relative m-0">
              {line}
              <span
                aria-hidden
                data-glyphs
                className="absolute inset-0 bg-(--ovio-surface) [clip-path:inset(0_100%_0_0)]"
              >
                {toGlyphs(line)}
              </span>
            </p>
          ))}
        </div>
        <div className="mt-[22px]">
          {sent ? (
            <Transmitter wire={wire} unit={unit} subscribers={p.subscribers} />
          ) : (
            <Postscript
              p={p}
              look={PS}
              lead="WIRE NEXT TO:"
              placeholder="YOU@DOMAIN.COM"
              action="[SEND]"
              pending="[KEYING…]"
            />
          )}
        </div>
      </div>
      <SentNotice p={p} />
      <div aria-hidden className="ovio-scanlines" />
    </div>
  );
}

/**
 * The key, lamp and tape, all read from one motion value counting Morse units: no React render
 * per symbol, only the text and opacity of three nodes changing as it runs.
 */
function Transmitter({
  wire,
  unit,
  subscribers,
}: {
  wire: Keying;
  unit: MotionValue<number>;
  subscribers?: number;
}) {
  const at = (u: number) => Math.min(wire.total, Math.floor(u));
  const tape = useTransform(() => wire.tape.slice(0, wire.tapeEnd[at(unit.get())]));
  const text = useTransform(() => wire.text.slice(0, wire.textEnd[at(unit.get())]));
  const lamp = useTransform(() => (wire.lit[at(unit.get())] ? 1 : 0.2));
  const reduced = useReducedMotionSafe();

  return (
    <div aria-hidden className="border-t border-dashed border-(--ovio-faint) pt-2.5">
      <div className="flex items-center gap-2.5">
        <motion.span
          className="size-3 shrink-0 bg-(--ovio-ink) shadow-[0_0_10px_var(--ovio-ink)]"
          style={{ opacity: lamp }}
        />
        <span className="shrink-0">TX</span>
        <div className="flex min-w-0 flex-1 justify-end overflow-hidden whitespace-pre">
          <motion.span>{tape}</motion.span>
        </div>
      </div>
      <motion.p className="m-0 min-h-[22px] truncate text-(--ovio-ink-2)">{text}</motion.p>
      <p data-ack className="m-0 opacity-0">
        ACK -.- {subscribers === undefined ? "COPY RECEIVED" : `COPY ${subscribers} ON THE WIRE`}
        <motion.span
          animate={reduced ? undefined : { opacity: [1, 0] }}
          transition={motionTokens.retro.blink}
        >
          _
        </motion.span>
      </p>
    </div>
  );
}
