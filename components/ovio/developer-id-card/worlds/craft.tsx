"use client";

import { MotionConfig, motion, type Variants } from "motion/react";
import { Avatar } from "@/components/shared/avatar";
import { QrCode } from "@/components/shared/qr-code";
import { motionTokens, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
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

const sheet = "absolute inset-0 rounded-lg shadow-[0_2px_3px_rgba(70,45,20,.15)]";
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
  const reduced = useReducedMotionSafe();
  const settle = useOvioTransition(motionTokens.craft.slow);
  const [first, ...rest] = name.split(/\s+/);

  // Hover, focus or a drag lifts the card off its stack: the sheets fan out and the QR and note show.
  const v = {
    under: {
      rest: { x: -3, y: 8, rotate: -1.2 },
      lift: { x: -8, y: 17, rotate: -3 },
    },
    middle: {
      rest: { x: 3, y: 4, rotate: 1 },
      lift: { x: 9, y: 10, rotate: 2.4 },
    },
    card: {
      rest: {
        y: 0,
        boxShadow: "0 2px 4px rgba(70,45,20,.12),0 14px 24px -10px rgba(70,45,20,.4)",
      },
      lift: {
        y: -6,
        boxShadow: "0 4px 6px rgba(70,45,20,.14),0 34px 46px -14px rgba(70,45,20,.5)",
      },
    },
    qr: { rest: { opacity: reduced ? 1 : 0.18 }, lift: { opacity: 1 } },
    note: { rest: { opacity: reduced ? 1 : 0, x: 0 }, lift: { opacity: 1, x: 28 } },
  } satisfies Record<string, Variants>;

  return (
    <MotionConfig transition={settle}>
      <motion.div
        data-ovio-world="craft"
        role="group"
        aria-label={`Developer ID card for ${name}`}
        tabIndex={0}
        initial={false}
        animate="rest"
        whileHover="lift"
        whileFocus="lift"
        className={cn(
          "@container relative w-full max-w-[380px] font-(family-name:--ovio-font) text-(--ovio-ink)",
          className,
        )}
      >
        <motion.div aria-hidden variants={v.under} className={cn(sheet, "bg-[#e4d6bd]")} />
        <motion.div aria-hidden variants={v.middle} className={cn(sheet, "bg-[#f2e8d4]")} />
        <motion.article
          variants={v.card}
          className="relative rounded-lg bg-(--ovio-surface) px-7 pt-[26px] pb-6 @max-[320px]:px-5"
          style={{ backgroundImage: PAPER }}
        >
          <span
            aria-hidden
            className="absolute -top-[13px] left-1/2 -ml-12 h-[26px] w-24 -rotate-[2.5deg] bg-(--ovio-tape) shadow-[0_1px_2px_rgba(0,0,0,.1)]"
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
          <div className="mt-2.5 mb-[18px] h-px bg-(--ovio-line) opacity-80" />

          <div className="flex items-end gap-[18px] @max-[320px]:gap-3.5">
            <Avatar
              src={avatarUrl}
              className="h-[124px] w-[104px] -rotate-[1.5deg] rounded bg-(--ovio-accent) bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.16)_0_7px,transparent_7px_14px)] shadow-[0_2px_4px_rgba(70,45,20,.25)] @max-[320px]:h-[96px] @max-[320px]:w-20"
            >
              <span className="absolute -top-2 -right-2 flex size-[34px] rotate-12 items-center justify-center rounded-full bg-[#ffe27a] font-(family-name:--ovio-font) text-xs font-extrabold text-(--ovio-ink) shadow-[0_3px_6px_-2px_rgba(90,60,0,.5)]">
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
                    key={tech}
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
                  <motion.span
                    className="size-[9px] rounded-full"
                    initial={false}
                    animate={{
                      backgroundColor: available ? "#2f9a45" : "#c9b9a0",
                      boxShadow: `0 0 0 3px ${available ? "rgba(47,154,69,.22)" : "rgba(42,31,20,.08)"}`,
                    }}
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
                <motion.div variants={v.qr} className="size-[74px] @max-[320px]:size-16">
                  <QrCode value={qrUrl} border={0} className="size-full" />
                </motion.div>
              </div>
            )}
          </div>

          {available && (
            <motion.span
              aria-hidden
              variants={v.note}
              className="pointer-events-none absolute -bottom-[26px] left-[clamp(16px,28%,110px)] -rotate-4 font-(family-name:--ovio-hand) text-[26px] whitespace-nowrap text-(--ovio-accent-deep)"
            >
              open to work ✦
            </motion.span>
          )}
        </motion.article>
      </motion.div>
    </MotionConfig>
  );
}
