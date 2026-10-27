"use client";

import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useEffect, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type Testimonial = {
  quote: string;
  name: string;
  /** Role and company, e.g. "Staff engineer, Northwind". */
  role?: string;
  avatarUrl?: string;
};

export interface TestimonialsProps {
  items: Testimonial[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Milliseconds between automatic advances; 0 turns autoplay off. Off under reduced motion. */
  interval?: number;
  /** Cards visible in the stack behind the current one, 0–3. */
  depth?: number;
  /** The carousel's accessible name. */
  label?: string;
  className?: string;
}

const wrap = (i: number, n: number) => ((i % n) + n) % n;
const SWIPE = { distance: 90, velocity: 450 };

export function Testimonials({
  items,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  interval = 6000,
  depth = 2,
  label = "Testimonials",
  className,
}: TestimonialsProps) {
  const n = items.length;
  const [inner, setInner] = useState(defaultIndex);
  const index = n ? wrap(indexProp ?? inner, n) : 0;
  const [direction, setDirection] = useState<1 | -1>(1);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const autoplay = interval > 0 && !reduced && n > 1;
  const playing = autoplay && !paused && !held;

  const go = (step: 1 | -1) => {
    if (n < 2) return;
    setDirection(step);
    const next = wrap(index + step, n);
    if (indexProp === undefined) setInner(next);
    onIndexChange?.(next);
  };

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => go(1), interval);
    return () => clearTimeout(id);
  });

  if (!n) return null;

  const stack = Array.from({ length: Math.min(n, Math.max(0, Math.min(3, depth)) + 1) }, (_, d) =>
    wrap(index + d, n),
  );
  const spring = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 30 };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else return;
    e.preventDefault();
  };

  return (
    // Arrow keys work wherever focus is inside the carousel: its buttons are the focusable parts.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("flex w-full max-w-md flex-col gap-5", className)}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
      onKeyDown={onKeyDown}
    >
      <div className="relative h-64" aria-live={playing ? "off" : "polite"}>
        <AnimatePresence initial={false} custom={direction}>
          {stack
            .map((item, d) => ({ item, d }))
            .reverse()
            .map(({ item, d }) => (
              <motion.figure
                key={item}
                role="group"
                aria-roledescription="slide"
                aria-label={`${item + 1} of ${n}`}
                aria-hidden={d > 0 || undefined}
                custom={direction}
                className={cn(
                  "absolute inset-0 m-0 flex flex-col justify-between rounded-2xl border border-white/8 bg-[#16161b] p-6 shadow-[0_20px_40px_-20px_rgba(0,0,0,.8)]",
                  d === 0 && n > 1 && "cursor-grab touch-pan-y active:cursor-grabbing",
                )}
                style={{ zIndex: 10 - d }}
                variants={{
                  enter: (dir: number) =>
                    d === 0
                      ? { x: dir * 260, y: 0, scale: 1, opacity: 0, rotate: dir * 6 }
                      : { x: 0, y: 36, scale: 0.86, opacity: 0, rotate: 0 },
                  rest: { x: 0, y: d * 14, scale: 1 - d * 0.05, opacity: 1 - d * 0.3, rotate: 0 },
                  // Next sends the top card off to the left, the way a swipe throws it.
                  exit: (dir: number) => ({
                    x: -dir * 300,
                    opacity: 0,
                    rotate: -dir * 8,
                    transition: { duration: reduced ? 0 : 0.28 },
                  }),
                }}
                initial="enter"
                animate="rest"
                exit="exit"
                transition={spring}
                drag={d === 0 && n > 1 ? "x" : false}
                dragSnapToOrigin
                dragElastic={0.6}
                onDragEnd={(_: unknown, info: PanInfo) => {
                  const { offset, velocity } = info;
                  if (Math.abs(offset.x) > SWIPE.distance || Math.abs(velocity.x) > SWIPE.velocity)
                    go(offset.x < 0 ? 1 : -1);
                }}
              >
                <blockquote className="m-0 font-(family-name:--font-editorial) text-[21px] leading-snug text-[#ededf0]">
                  “{items[item].quote}”
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <Avatar person={items[item]} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-[#ededf0]">
                      {items[item].name}
                    </span>
                    {items[item].role && (
                      <span className="truncate text-xs text-[#75757f]">{items[item].role}</span>
                    )}
                  </span>
                </figcaption>
              </motion.figure>
            ))}
        </AnimatePresence>
      </div>
      {n > 1 && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {items.map((t, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show testimonial ${i + 1}: ${t.name}`}
                aria-current={i === index || undefined}
                onClick={() => {
                  if (i === index) return;
                  setDirection(i > index ? 1 : -1);
                  if (indexProp === undefined) setInner(i);
                  onIndexChange?.(i);
                }}
                className="grid size-6 place-items-center"
              >
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-5 bg-[#ededf0]" : "w-1.5 bg-white/20",
                  )}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {autoplay && (
              <NavButton label={paused ? "Play" : "Pause"} onClick={() => setPaused((p) => !p)}>
                {paused ? "▶" : "❚❚"}
              </NavButton>
            )}
            <NavButton label="Previous testimonial" onClick={() => go(-1)}>
              ←
            </NavButton>
            <NavButton label="Next testimonial" onClick={() => go(1)}>
              →
            </NavButton>
          </div>
        </div>
      )}
    </section>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full border border-white/10 text-xs text-[#a9a9b3] transition-colors hover:border-white/20 hover:text-[#ededf0]"
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}

function Avatar({ person }: { person: Testimonial }) {
  const initials = person.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return person.avatarUrl ? (
    // oxlint-disable-next-line nextjs/no-img-element -- a plain img installs anywhere, not only in Next.
    <img src={person.avatarUrl} alt="" className="size-9 shrink-0 rounded-full object-cover" />
  ) : (
    <span
      aria-hidden
      className="grid size-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#9b8cff,#5fd4e6)] text-xs font-semibold text-[#0b0b10]"
    >
      {initials}
    </span>
  );
}
