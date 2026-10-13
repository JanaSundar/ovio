import { ease } from "@/lib/motion";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LetterWorldProps } from "../letter";
import { Paragraphs, Postscript, SentNotice, type PostscriptLook } from "../parts";
import { fold } from "../send";
import { useSend } from "../use-send";

/** Ruled stationery: a faint line every 28px, which the handwriting sits on. */
const RULED = "repeating-linear-gradient(180deg,transparent 0 27px,rgba(42,31,20,.08) 27px 28px)";
const SHADOW = "0 2px 4px rgba(70,45,20,.12), 0 18px 34px -12px rgba(70,45,20,.4)";
/** The pocket's edge line and the envelope's shadow on the desk, both following its clipped shape. */
const FRONT_SHADOW =
  "drop-shadow(0 -1px 0 rgba(42,31,20,.18)) drop-shadow(0 18px 24px rgba(70,45,20,.35))";
/** The flap hinges at the envelope's top edge; perspective is in the transform so no parent needs it. */
const FLAP_OPEN = "perspective(800px) rotateX(180deg)";
const FLAP_EDGE = "perspective(800px) rotateX(90deg)";
const FLAP_SHUT = "perspective(800px) rotateX(0deg)";

const PS: PostscriptLook = {
  form: "mt-2.5 font-(family-name:--ovio-hand) text-[21px] leading-7",
  row: "flex flex-wrap items-center gap-x-2.5",
  label: "font-bold",
  input:
    "min-w-30 border-b-[1.5px] border-dashed border-(--ovio-line) font-(family-name:--ovio-hand) text-[22px] text-(--ovio-ink) placeholder:text-(--ovio-faint)",
  button: "border-0 bg-transparent p-0 font-bold text-(--ovio-accent-deep)",
  error: "min-h-5 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-accent-deep)",
};

/**
 * Craft: a handwritten letter on ruled paper. Sending folds it into thirds and slips it into an
 * envelope that rises from the desk; the flap closes, wax is pressed on, the address is written
 * and the post office stamps it.
 */
export default function CraftLetter(p: LetterWorldProps) {
  const scope = useSend(p.status === "sent", async (animate, root, t) => {
    const $ = (name: string) => root.querySelector<HTMLElement>(`[data-${name}]`)!;
    const sheet = $("sheet");
    const flap = $("flap");
    const parts = [$("back"), $("front")];

    const box = root.getBoundingClientRect();
    const env = $("back").getBoundingClientRect();
    const paper = sheet.getBoundingClientRect();
    const s = Math.min(0.7, (env.width - 34) / paper.width);
    const folded = (paper.height * s) / 3;
    const centre = paper.top - box.top + paper.height / 2;
    // Held just above the open envelope, then slid down until it rests low in the pocket.
    const hold = env.top - box.top - folded / 2 - 14 - centre;
    const drop = env.bottom - box.top - folded / 2 - 12 - centre;
    const at = (y: number) => `translateY(${y}px) scale(${s}, ${s / 3})`;
    const rise = t({ duration: 0.55, ease: ease.minimal, delay: 0.45 });

    animate(parts, { opacity: [0, 1], transform: ["translateY(70px)", "translateY(0px)"] }, rise);
    animate(
      flap,
      {
        opacity: [0, 1],
        transform: [`translateY(70px) ${FLAP_OPEN}`, `translateY(0px) ${FLAP_OPEN}`],
      },
      rise,
    );
    await fold(animate, sheet, s, t, ease.minimal);
    await animate(sheet, { transform: [at(0), at(hold)] }, t({ duration: 0.45, ease: ease.craft }));
    await animate(
      sheet,
      { transform: [at(hold), at(drop)] },
      t({ duration: 0.6, ease: [0.55, 0, 0.35, 1] }),
    );
    // Over the hinge the flap passes in front of the letter, so it swaps layers at the edge.
    await animate(flap, { transform: FLAP_EDGE }, t({ duration: 0.24, ease: "easeIn" }));
    flap.style.zIndex = "4";
    await animate(flap, { transform: FLAP_SHUT }, t({ duration: 0.3, ease: "easeOut" }));
    await animate(
      "[data-seal]",
      {
        opacity: [0, 1, 1],
        transform: [
          "translateY(-40px) scale(1.5) rotate(-24deg)",
          "translateY(0px) scale(1.12, 0.84) rotate(-8deg)",
          "translateY(0px) scale(1, 1) rotate(-8deg)",
        ],
      },
      t({ duration: 0.52, times: [0, 0.6, 1], ease: [ease.minimal, ease.craft] }),
    );
    await animate(
      "[data-address]",
      { clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
      t({ duration: 0.7, ease: "easeOut" }),
    );
    await animate(
      "[data-postmark]",
      {
        opacity: [0, 0.9, 0.85],
        transform: [
          "scale(1.4) rotate(-30deg)",
          "scale(0.95) rotate(-12deg)",
          "scale(1) rotate(-12deg)",
        ],
      },
      t({ duration: 0.32, times: [0, 0.6, 1], ease: ease.minimal }),
    );
  });

  const sent = p.status === "sent";
  return (
    <div
      ref={scope}
      data-ovio-world="craft"
      className={cn(
        "relative isolate w-full max-w-115 overflow-hidden px-3 pt-5 pb-4 font-(family-name:--ovio-font) text-(--ovio-ink)",
        p.className,
      )}
    >
      <article
        data-sheet
        aria-hidden={sent || undefined}
        inert={sent}
        className="relative z-2 -rotate-[1.2deg] bg-(--ovio-surface) px-7 pt-9 pb-6"
        style={{ backgroundImage: RULED, boxShadow: SHADOW }}
      >
        <span
          aria-hidden
          className="absolute -top-3 left-[42%] h-6 w-21.5 -rotate-3 bg-(--ovio-tape)"
        />
        <span
          aria-hidden
          className="absolute top-4.5 right-5 flex h-16.5 w-14 rotate-4 flex-col items-center justify-center bg-(--ovio-accent) text-(--ovio-on-accent) outline-3 -outline-offset-3 outline-(--ovio-surface) outline-dashed"
        >
          <span className="text-[9px] tracking-[0.16em]">ISSUE</span>
          <span className="text-[22px] font-bold">{Number(p.issue)}</span>
        </span>
        <p className="m-0 font-(family-name:--ovio-mono) text-[10px] font-medium tracking-[0.14em] text-(--ovio-muted) uppercase">
          {p.name} ·{" "}
          <time dateTime={p.dateTime} className="whitespace-nowrap">
            {p.date}
          </time>
        </p>
        <div className="mt-5.5 flex max-w-[82%] flex-col font-(family-name:--ovio-hand) text-[21px] leading-7 [overflow-wrap:anywhere]">
          <p className="m-0 text-2xl">{p.greeting}</p>
          <Paragraphs body={p.body} />
          {p.signOff && <p className="m-0 mt-3.5">{p.signOff}</p>}
          <p className="m-0 inline-block -rotate-4 text-[32px] font-bold text-(--ovio-accent-deep)">
            {p.signature}
          </p>
        </div>
        <Postscript
          p={p}
          look={PS}
          lead="send the next to"
          placeholder="your address"
          action="post it →"
          pending="posting…"
        />
        {p.subscribers !== undefined && (
          <p className="m-0 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
            {formatNumber(p.subscribers)} letters go out each issue
          </p>
        )}
      </article>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="relative aspect-50/31 w-[min(340px,calc(100%-24px))]">
          <div data-back className="absolute inset-0 z-0 rounded-[4px] bg-[#e3d3b6] opacity-0" />
          <div
            data-flap
            className="absolute inset-x-0 top-0 z-1 h-[56%] origin-top opacity-0 drop-shadow-[0_2px_1px_rgba(70,45,20,.25)]"
            style={{ transform: FLAP_OPEN }}
          >
            <div className="size-full bg-[#efe1c6] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
          </div>
          <div
            data-front
            className="absolute inset-0 z-3 opacity-0"
            style={{ filter: FRONT_SHADOW }}
          >
            <div className="absolute inset-0 bg-(--ovio-surface-2) [clip-path:polygon(0_0,50%_54%,100%_0,100%_100%,0_100%)]" />
            <p
              data-address
              className="absolute right-22 bottom-4 left-4.5 m-0 truncate font-(family-name:--ovio-hand) text-[23px] font-bold [clip-path:inset(0_100%_0_0)]"
            >
              to {p.sentTo}
            </p>
            <span className="absolute right-4 bottom-3.5 flex h-13 w-11 items-center justify-center bg-(--ovio-accent) text-base font-bold text-(--ovio-on-accent) outline-2 -outline-offset-2 outline-(--ovio-surface-2) outline-dashed">
              {Number(p.issue)}
            </span>
          </div>
          <div
            data-seal
            className="absolute top-[56%] left-1/2 z-5 -mt-7 -ml-7.5 flex h-14 w-15 items-center justify-center rounded-[46%_54%_50%_48%/52%_46%_54%_48%] bg-(--ovio-accent-deep) opacity-0 shadow-[inset_0_-4px_0_rgba(0,0,0,.22),inset_0_3px_2px_rgba(255,200,170,.35),0_3px_6px_rgba(70,45,20,.4)]"
          >
            <span className="flex size-9 items-center justify-center rounded-full border-2 border-black/20 font-(family-name:--ovio-hand) text-[22px] font-bold text-[#7a2e12]">
              {p.name.trim().charAt(0).toUpperCase()}
            </span>
          </div>
          <svg
            data-postmark
            viewBox="0 0 72 72"
            className="absolute right-15 bottom-1 z-6 size-18 opacity-0"
            fill="none"
            stroke="rgba(42,31,20,.55)"
            strokeWidth="1.4"
          >
            <circle cx="36" cy="36" r="27" />
            <circle cx="36" cy="36" r="20" />
            <text
              x="36"
              y="34"
              textAnchor="middle"
              fill="rgba(42,31,20,.6)"
              stroke="none"
              fontSize="8"
              className="font-(family-name:--ovio-mono) uppercase"
            >
              {p.date.split(",")[0]}
            </text>
            <text
              x="36"
              y="44"
              textAnchor="middle"
              fill="rgba(42,31,20,.6)"
              stroke="none"
              fontSize="7"
              className="font-(family-name:--ovio-mono)"
            >
              No. {p.issue}
            </text>
            <path d="M-8 30q8-5 16 0t16 0M-8 42q8-5 16 0t16 0" />
          </svg>
        </div>
      </div>
      <SentNotice p={p} />
    </div>
  );
}
