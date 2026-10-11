"use client";

import { Avatar } from "@/components/shared/avatar";
import { QrCode } from "@/components/shared/qr-code";
import { cn } from "@/lib/utils";
import type { DeveloperIdCardWorldProps } from "../developer-id-card";

/** Sticker colours for the stack: background, ink. */
const STICKERS = [
  ["#2b4a9b", "#fff"],
  ["var(--ovio-accent)", "#fff"],
  ["#2f9a45", "#fff"],
  ["#ffe27a", "var(--ovio-ink)"],
] as const;

const PAPER =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 .35 0 0 0 0 .25 0 0 0 0 .15 0 0 0 .1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Hover or focus fans the sheets out and lifts the card; the QR and the note come forward. */
const MOVE =
  "transition-[translate,rotate,opacity] duration-300 ease-[cubic-bezier(.34,1.5,.5,1)] motion-reduce:transition-none";
const sheet = cn("absolute inset-0 rounded-lg shadow-[0_2px_3px_rgba(70,45,20,.15)]", MOVE);
/** The card lifts on translate, and its deeper shadow fades in on a layer behind it, so no shadow is repainted. */
const LIFT = cn(
  MOVE,
  "group-hover:-translate-y-1.5 group-focus:-translate-y-1.5 after:absolute after:inset-0 after:-z-10 after:rounded-lg after:opacity-0 after:shadow-[0_4px_6px_rgba(70,45,20,.1),0_34px_46px_-14px_rgba(70,45,20,.4)] after:transition-opacity after:duration-300 group-hover:after:opacity-100 group-focus:after:opacity-100",
);
const label = "font-(family-name:--ovio-mono) uppercase";

export function CraftDeveloperIdCard({
  name,
  initials,
  title,
  stack,
  profile,
  website,
  location,
  available,
  avatarUrl,
  serial,
  since,
  qrUrl,
  className,
}: DeveloperIdCardWorldProps) {
  const [first, ...rest] = name.split(/\s+/);

  return (
    <div
      data-ovio-world="craft"
      role="group"
      aria-label={`Developer ID card for ${name}`}
      // Focusable so keyboard and touch users can lift the card too.
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={cn(
        "group @container relative w-full max-w-95 font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          sheet,
          "bg-[#e4d6bd] [translate:-3px_8px] [rotate:-1.2deg] group-hover:[translate:-8px_17px] group-hover:[rotate:-3deg] group-focus:[translate:-8px_17px] group-focus:[rotate:-3deg]",
        )}
      />
      <div
        aria-hidden
        className={cn(
          sheet,
          "bg-[#f2e8d4] [translate:3px_4px] [rotate:1deg] group-hover:[translate:9px_10px] group-hover:[rotate:2.4deg] group-focus:[translate:9px_10px] group-focus:[rotate:2.4deg]",
        )}
      />
      <article
        className={cn(
          "relative isolate rounded-lg bg-(--ovio-surface) px-7 pt-6.5 pb-6 shadow-[0_2px_4px_rgba(70,45,20,.12),0_14px_24px_-10px_rgba(70,45,20,.4)] @max-[320px]:px-5",
          LIFT,
        )}
        style={{ backgroundImage: PAPER }}
      >
        <span
          aria-hidden
          className="absolute -top-[13px] left-1/2 -ml-12 h-6.5 w-24 -rotate-[2.5deg] bg-(--ovio-tape) shadow-[0_1px_2px_rgba(0,0,0,.1)]"
        />
        <div
          className={cn(
            label,
            "flex justify-between gap-3 text-[10.5px] tracking-[0.14em] whitespace-nowrap text-(--ovio-muted) @max-[320px]:tracking-[0.06em]",
          )}
        >
          <span>Developer{serial && ` / ${serial}`}</span>
          {since && <span>Est. {since}</span>}
        </div>
        <div className="mt-2.5 mb-4.5 h-px bg-(--ovio-line) opacity-80" />

        <div className="flex items-end gap-4.5 @max-[320px]:gap-3.5">
          <Avatar
            src={avatarUrl}
            className="h-31 w-26 -rotate-[1.5deg] rounded bg-(--ovio-accent) bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.16)_0_7px,transparent_7px_14px)] shadow-[0_2px_4px_rgba(70,45,20,.25)] @max-[320px]:h-24 @max-[320px]:w-20"
          >
            <span className="absolute -top-2 -right-2 flex size-8.5 rotate-12 items-center justify-center rounded-full bg-[#ffe27a] font-(family-name:--ovio-font) text-xs font-extrabold text-(--ovio-ink) shadow-[0_3px_6px_-2px_rgba(90,60,0,.5)]">
              {initials}
            </span>
          </Avatar>
          <div className="min-w-0">
            <h3 className="m-0 text-[38px] leading-[0.92] font-extrabold tracking-[-0.045em] break-words @max-[320px]:text-[30px]">
              {first}
              {rest.length > 0 && <br />}
              {rest.join(" ")}
            </h3>
            {title && (
              <div
                className={cn(
                  label,
                  "mt-2.5 text-[10.5px] leading-normal tracking-[0.1em] text-(--ovio-ink-2)",
                )}
              >
                {title}
              </div>
            )}
          </div>
        </div>

        {stack.length > 0 && (
          <ul aria-label="Stack" className="m-0 mt-5 mb-1 flex list-none flex-wrap gap-1.5 p-0">
            {stack.map((tech, i) => {
              const [bg, fg] = STICKERS[i % STICKERS.length];
              return (
                <li
                  key={`${i}:${tech}`}
                  className="rounded-full px-2.5 py-[5px] text-[12.5px] font-bold"
                  style={{ background: bg, color: fg }}
                >
                  {tech}
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 flex items-end justify-between gap-3.5">
          <div
            className={cn(
              label,
              "flex min-w-0 flex-col gap-2.5 text-[12.5px] tracking-[0.06em] normal-case",
            )}
          >
            {location && (
              <div>
                <div className="text-[9.5px] text-(--ovio-muted) uppercase">Based in</div>
                <div className="uppercase">{location}</div>
              </div>
            )}
            {available !== undefined && (
              <div className="flex items-center gap-[7px] uppercase">
                <span
                  className={cn(
                    "size-[9px] rounded-full transition-[background-color,box-shadow] duration-300",
                    available
                      ? "bg-[#2f9a45] shadow-[0_0_0_3px_rgba(47,154,69,.22)]"
                      : "bg-[#c9b9a0] shadow-[0_0_0_3px_rgba(42,31,20,.08)]",
                  )}
                />
                {available ? "Available" : "Booked"}
              </div>
            )}
            {(profile || website) && (
              <div className="text-[11.5px] leading-normal break-words text-[#2b4a9b]">
                {profile}
                {profile && website && <br />}
                {website}
              </div>
            )}
          </div>
          {qrUrl && (
            <div className="shrink-0 rotate-[1.5deg] rounded bg-white p-1.5 shadow-[0_2px_4px_rgba(70,45,20,.2)]">
              <div
                className={cn(
                  "size-18.5 opacity-[.18] motion-reduce:opacity-100 group-hover:opacity-100 group-focus:opacity-100 @max-[320px]:size-16",
                  MOVE,
                )}
              >
                <QrCode value={qrUrl} border={0} className="size-full" />
              </div>
            </div>
          )}
        </div>

        {available && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute opacity-0 motion-reduce:opacity-100 group-hover:translate-x-7 group-hover:opacity-100 group-focus:translate-x-7 group-focus:opacity-100",
              MOVE,
              " -bottom-6.5 left-[clamp(16px,28%,110px)] -rotate-4 font-(family-name:--ovio-hand) text-[26px] whitespace-nowrap text-(--ovio-accent-deep)",
            )}
          >
            open to work ✦
          </span>
        )}
      </article>
    </div>
  );
}
