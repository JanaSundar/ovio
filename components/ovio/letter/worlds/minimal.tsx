import { motion, stagger, useMotionValue, useTransform } from "motion/react";
import { useRef } from "react";
import { ease, motionTokens } from "@/lib/motion";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LetterWorldProps } from "../letter";
import { Paragraphs, Postscript, SentNotice, type PostscriptLook } from "../parts";
import { noseFor, PLANE, PLANE_TIMES, turn } from "../plane";
import { PLAY } from "../send";
import { useSend } from "../use-send";

/** Two faint creases where the sheet was folded in thirds. */
const CREASES =
  "linear-gradient(180deg,transparent 33.2%,rgba(0,0,0,.045) 33.3%,rgba(255,255,255,.7) 33.5%,transparent 33.7%,transparent 66.5%,rgba(0,0,0,.045) 66.6%,rgba(255,255,255,.7) 66.8%,transparent 67%)";

/** The trail is laid every few pixels of flight, so the dots stay evenly spaced at any speed. */
const TRAIL_STEP = 9;

/** The folded plane's size on screen: the 100 × 130 drawing at 0.88. */
const PAPER_W = 88;
const PAPER_H = 114;

/** The launch: thrown slightly downward, so the glide dips, then climbs and levels off as it recedes. */
const LAUNCH_HEADING = 30;
const DIP = 14;
const FLIGHT = 1.6;
/** Where it fades out: right of centre and up, as shares of the half-width and half-height. */
const LAND_X = 0.72;
const LAND_Y = -0.55;

/** How quickly the nose catches up with the direction of travel, and how much a turn rolls the wings. */
const STEER = 0.3;
const ROLL = 0.06;
const MAX_ROLL = 0.5;

const PS: PostscriptLook = {
  form: "mt-auto border-t border-(--ovio-line-2) pt-3.5 text-[13px] text-(--ovio-ink-2)",
  row: "flex flex-wrap items-baseline gap-x-2 gap-y-1",
  label: "text-(--ovio-ink)",
  input:
    "min-w-36 border-b border-(--ovio-line) py-0.5 text-(--ovio-ink) transition-colors placeholder:text-(--ovio-faint) focus:border-(--ovio-ink)",
  button: "border-0 bg-transparent p-0 font-medium text-(--ovio-ink) disabled:text-(--ovio-muted)",
  error: "mt-1.5 min-h-4 text-xs text-[#b23b2a]",
};

/**
 * Minimal: a typed letter on clean stationery. Sending shrinks it to a blank sheet that folds itself
 * into a paper plane; the plane is thrown, dips, climbs and banks toward the far corner on a dotted
 * trail, shrinking away inside the card. A receipt is left where the letter was.
 */
export default function MinimalLetter(p: LetterWorldProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  /** Wings narrowing as the plane rolls into a turn. */
  const roll = useMotionValue(1);
  /** Fold progress, 0 (a sheet) to 1 (a plane), morphing each outline through the stages. */
  const folding = useMotionValue(0);
  const left = useTransform(folding, PLANE_TIMES, PLANE.left);
  const right = useTransform(folding, PLANE_TIMES, PLANE.right);
  const keel = useTransform(folding, PLANE_TIMES, PLANE.keel);
  // Plain paper at the start, so it takes over from the letter unseen; the creases ink in as it folds.
  const edge = useTransform(folding, [0, 0.35], [0.15, 1]);
  const shade = useTransform(folding, [0.3, 1], [0, 0.08]);
  const trail = useRef<SVGPolylineElement>(null);

  const scope = useSend(p.status === "sent", async (animate, root, t) => {
    const sheet = root.querySelector<HTMLElement>("[data-sheet]")!;
    const plane = root.querySelector<HTMLElement>("[data-plane]")!;
    const cx = root.clientWidth / 2;
    const cy = root.clientHeight / 2;

    // Steering and the trail, read from the plane's position each frame it moves: no allocation
    // besides the trail's points, and those only every few pixels.
    let points = "";
    let travelled = 0;
    let laid = -TRAIL_STEP;
    let px = 0;
    let py = 0;
    let heading = LAUNCH_HEADING;
    const fly = () => {
      const nx = x.get();
      const ny = y.get();
      const dx = nx - px;
      const dy = ny - py;
      px = nx;
      py = ny;
      const step = Math.hypot(dx, dy);
      if (step < 0.01) return;
      const next = (Math.atan2(dy, dx) * 180) / Math.PI;
      const swing = turn(heading, next);
      heading += swing * STEER;
      rotate.set(noseFor(heading));
      roll.set(1 - Math.min(MAX_ROLL, Math.abs(swing) * ROLL));
      travelled += step;
      if (travelled - laid < TRAIL_STEP) return;
      laid = travelled;
      points += `${cx + nx},${cy + ny} `;
      trail.current?.setAttribute("points", points);
    };

    // The letter shrinks to the size of a small blank sheet as its writing fades.
    const sheetBox = sheet.getBoundingClientRect();
    await Promise.all([
      animate(
        sheet,
        {
          transform: [
            "scale(1, 1)",
            `scale(${PAPER_W / sheetBox.width}, ${PAPER_H / sheetBox.height})`,
          ],
        },
        t({ duration: 0.6, ease: ease.minimal }),
      ),
      animate(Array.from(sheet.children), { opacity: 0 }, t({ duration: 0.3, ease: ease.minimal })),
    ]);
    // The drawn sheet takes its place in the same frame, then folds into a plane.
    animate(sheet, { opacity: 0 }, t({ duration: 0 }));
    animate(plane, { opacity: 1 }, t({ duration: 0 }));
    await Promise.all([
      animate(folding, 1, t({ duration: 1.05, ease: "easeInOut" })),
      animate(rotate, [0, -5, 4, 0], t({ duration: 1.05, times: PLANE_TIMES, ease: "easeInOut" })),
    ]);
    // Picked up and aimed along the launch, then thrown.
    await Promise.all([
      animate(rotate, noseFor(LAUNCH_HEADING), t(motionTokens.toy.slide)),
      animate(plane, { scale: 0.92 }, t({ duration: 0.3, ease: ease.minimal })),
    ]);
    const stop = t === PLAY ? y.on("change", fly) : undefined;
    await animate(
      plane,
      {
        x: [0, cx * LAND_X],
        y: [0, DIP, cy * LAND_Y],
        scale: [0.92, 0.32],
        opacity: [1, 1, 0],
      },
      t({
        duration: FLIGHT,
        x: { duration: FLIGHT, ease: [0.25, 0.35, 0.6, 0.95] },
        y: {
          duration: FLIGHT,
          times: [0, 0.28, 1],
          ease: [
            [0.2, 0.6, 0.4, 1],
            [0.45, 0, 0.55, 1],
          ],
        },
        scale: { duration: FLIGHT, ease: [0.5, 0, 0.75, 0.6] },
        opacity: { duration: FLIGHT, times: [0, 0.82, 1] },
      }),
    );
    stop?.();
    animate("[data-trail]", { opacity: 0 }, t({ duration: 0.8 }));
    await animate(
      "[data-receipt] > *",
      { opacity: [0, 1], transform: ["translateY(6px)", "translateY(0px)"] },
      t({ duration: 0.4, ease: ease.minimal, delay: stagger(0.07) }),
    );
  });

  const sent = p.status === "sent";
  return (
    <div
      ref={scope}
      data-ovio-world="minimal"
      className={cn(
        "relative w-full max-w-115 overflow-hidden p-1 font-(family-name:--ovio-font) text-(--ovio-ink)",
        p.className,
      )}
    >
      <article
        data-sheet
        aria-hidden={sent || undefined}
        inert={sent}
        className="flex min-h-120 flex-col rounded-[2px] border border-(--ovio-line) bg-(--ovio-surface) px-7 pt-9 pb-6 shadow-[0_1px_2px_rgba(0,0,0,.04),0_12px_30px_-16px_rgba(0,0,0,.18)] sm:px-9.5"
        style={{ backgroundImage: CREASES }}
      >
        <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-(--ovio-ink) pb-3.5">
          <h2 className="m-0 text-[15px] font-medium tracking-[-0.01em]">{p.name}</h2>
          <span className="font-(family-name:--ovio-mono) text-[11px] text-(--ovio-muted)">
            No. {p.issue} ·{" "}
            <time dateTime={p.dateTime} className="whitespace-nowrap">
              {p.date}
            </time>
          </span>
        </header>
        <div className="mt-6 mb-6 flex flex-col gap-3 text-[13.5px] leading-[1.65] text-(--ovio-ink-2) [overflow-wrap:anywhere]">
          <p className="m-0 text-(--ovio-ink)">{p.greeting}</p>
          <Paragraphs body={p.body} />
          <p className="m-0 mt-2 text-(--ovio-ink)">
            {p.signOff && (
              <>
                {p.signOff}
                <br />
              </>
            )}
            <span className="text-[15px] font-medium">{p.signature}</span>
          </p>
        </div>
        <Postscript p={p} look={PS} lead="Want the next one?" action="Send it →" />
        {p.subscribers !== undefined && (
          <p className="m-0 mt-2.5 font-(family-name:--ovio-mono) text-[11px] text-(--ovio-faint)">
            {formatCount(p.subscribers, "reader")}
          </p>
        )}
      </article>

      <svg
        aria-hidden
        data-trail
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <polyline
          ref={trail}
          fill="none"
          stroke="var(--ovio-faint)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="0 9"
        />
      </svg>
      <motion.div
        aria-hidden
        data-plane
        className="pointer-events-none absolute top-1/2 left-1/2 -mt-[57px] -ml-11 h-[114px] w-22 opacity-0"
        style={{ x, y, rotate }}
      >
        <motion.svg
          viewBox="-1 -1 102 132"
          className="size-full overflow-visible"
          fill="none"
          stroke="var(--ovio-ink)"
          strokeWidth="1.3"
          strokeLinejoin="round"
          style={{ scaleX: roll, strokeOpacity: edge }}
        >
          <motion.path d={left} fill="var(--ovio-surface)" />
          <motion.path d={right} fill="var(--ovio-surface)" />
          <motion.path
            d={right}
            fill="var(--ovio-ink)"
            stroke="none"
            style={{ fillOpacity: shade }}
          />
          <motion.path d={keel} />
        </motion.svg>
      </motion.div>

      <SentNotice p={p} />
      {sent && (
        <div
          data-receipt
          aria-hidden
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center"
        >
          <p className="m-0 text-[26px] font-medium tracking-[-0.03em] opacity-0">Sent</p>
          <span aria-hidden className="h-px w-30 bg-(--ovio-line) opacity-0" />
          <p className="m-0 text-[13px] text-(--ovio-ink-2) opacity-0 [overflow-wrap:anywhere]">
            {p.sentTo}
          </p>
          <p className="m-0 font-(family-name:--ovio-mono) text-[11px] tracking-[0.06em] text-(--ovio-faint) uppercase opacity-0">
            No. {p.nextIssue} lands next
          </p>
        </div>
      )}
    </div>
  );
}
