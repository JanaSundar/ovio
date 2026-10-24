import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
  type TargetAndTransition,
  type Transition,
} from "motion/react";
import { type ReactNode, useEffect } from "react";
import { useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { World } from "@/lib/world";
import {
  angleOf,
  childAngle,
  MENU_SIZE,
  nearestAngle,
  polar,
  RADIAL,
  sectorPath,
  stepOf,
} from "./dial";
import type { DialWorldProps } from "./dial-menu";
import type { DialMenuItem } from "./types";

const C = MENU_SIZE / 2;
const BOX = `0 0 ${MENU_SIZE} ${MENU_SIZE}`;
const LAYER = "pointer-events-none absolute inset-0 size-full overflow-visible";

/** Classes and motion a world gives the disc. */
export type DiscLook = {
  /** The ring's face: a circle the size of the ring. */
  face: string;
  /** The slice under the aimed item, an SVG path. */
  slice: string;
  /** The thin lines between items, SVG paths; leave out for none. */
  divider?: string;
  /** The branch's band past the ring, and the slice under its aimed child. SVG paths. */
  band: string;
  bandSlice: string;
  icon: (on: boolean) => string;
  hub: string;
  /** The hub's dot that points where the pointer is. */
  needle: string;
  /** The hub's text: the aimed item's label, or the menu's. */
  title: string;
  shortcut: string;
  /** How the slices follow the aim: a spring, or "step" to jump. */
  follow: SpringOptions | "step";
  /** How the menu opens and closes, from the centre. */
  pop: { initial: TargetAndTransition; transition: Transition };
  /** Drawn inside the face, over the slice: textures, scanlines. */
  children?: ReactNode;
};

/** The label's first letter, for an item without an icon. */
const glyph = (item: DialMenuItem) =>
  item.icon ?? <span className="text-[15px] leading-none font-semibold">{item.label[0]}</span>;

/** An angle that turns the short way to each new target, on a spring or straight there. */
function useTurn(to: number, follow: SpringOptions | "step") {
  const reduced = useReducedMotionSafe();
  const target = useMotionValue(to);
  const sprung = useSpring(target, follow === "step" ? {} : follow);
  useEffect(() => {
    target.set(nearestAngle(target.get(), to));
  }, [to, target]);
  return follow === "step" || reduced ? target : sprung;
}

/** A full-size SVG layer turned about the centre: a slice drawn at 0° and turned to its aim. */
function Turning({
  angle,
  visible = true,
  children,
}: {
  angle: MotionValue<number>;
  visible?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.svg
      aria-hidden
      viewBox={BOX}
      className={LAYER}
      style={{ rotate: angle }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.12 }}
    >
      {children}
    </motion.svg>
  );
}

/**
 * The menu every world draws: the ring of items round a hub, a slice that follows the aim, and the
 * aimed item's children on a band past the ring. The hub names what's aimed at.
 */
export function Disc({
  name,
  world,
  look,
}: {
  name: World;
  world: DialWorldProps;
  look: DiscLook;
}) {
  return (
    <div
      data-ovio-world={name}
      className={cn("font-(family-name:--ovio-font) text-(--ovio-ink)", world.className)}
    >
      <Face world={world} look={look} />
    </div>
  );
}

function Face({ world, look }: { world: DialWorldProps; look: DiscLook }) {
  const { items, dial, label } = world;
  const { aim } = dial;
  const n = items.length;
  const step = stepOf(n);
  const pop = useOvioTransition(look.pop.transition);

  const branch = items[aim.branch];
  const kids = branch?.items ?? [];
  const parentAngle = angleOf(Math.max(0, aim.branch), n);
  const sliceAngle = useTurn(angleOf(Math.max(0, aim.main), n), look.follow);
  const bandAngle = useTurn(
    childAngle(parentAngle, Math.max(0, aim.sub), Math.max(1, kids.length)),
    look.follow,
  );
  const needle = useTransform(() => `rotate(${dial.needle.get()}deg)`);
  const aimed = aim.sub >= 0 ? kids[aim.sub] : items[aim.main];

  return (
    <motion.div
      {...dial.menu}
      aria-label={label}
      className={cn("relative outline-none", world.disabled && "opacity-60")}
      style={{ width: MENU_SIZE, height: MENU_SIZE }}
      initial={dial.inline ? false : look.pop.initial}
      animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
      exit={{ ...look.pop.initial, transition: { duration: 0.12 } }}
      transition={pop}
    >
      <AnimatePresence>
        {branch && (
          <motion.svg
            key={branch.id}
            aria-hidden
            viewBox={BOX}
            className={LAYER}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.1 } }}
            transition={pop}
          >
            <path
              d={sectorPath(
                C,
                RADIAL.band.inner,
                RADIAL.band.outer,
                parentAngle,
                kids.length * RADIAL.childStep,
              )}
              className={look.band}
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </AnimatePresence>
      {branch && (
        <Turning angle={bandAngle} visible={aim.sub >= 0}>
          <path
            d={sectorPath(C, RADIAL.band.inner + 3, RADIAL.band.outer - 3, 0, RADIAL.childStep - 4)}
            className={look.bandSlice}
            strokeLinejoin="round"
          />
        </Turning>
      )}
      <div
        aria-hidden
        className={cn("absolute rounded-full", look.face)}
        style={{ inset: C - RADIAL.outer }}
      />
      {look.divider && n > 1 && (
        <svg aria-hidden viewBox={BOX} className={LAYER}>
          {items.map((it, i) => {
            const a = angleOf(i, n) + step / 2;
            const p = polar(C, RADIAL.hub + 8, a);
            const q = polar(C, RADIAL.outer - 8, a);
            return <path key={it.id} d={`M${p.x} ${p.y}L${q.x} ${q.y}`} className={look.divider} />;
          })}
        </svg>
      )}
      <Turning angle={sliceAngle} visible={aim.main >= 0}>
        <path
          d={sectorPath(C, RADIAL.hub + 4, RADIAL.outer - 4, 0, step - 3)}
          className={look.slice}
          strokeLinejoin="round"
        />
      </Turning>
      {look.children && (
        <div
          aria-hidden
          className="pointer-events-none absolute overflow-hidden rounded-full"
          style={{ inset: C - RADIAL.outer }}
        >
          {look.children}
        </div>
      )}
      {items.map((it, i) => {
        const at = polar(C, RADIAL.icon, angleOf(i, n));
        const on = aim.main === i;
        return (
          <div
            key={it.id}
            id={dial.itemId(i)}
            role="menuitem"
            aria-label={it.label}
            aria-disabled={it.disabled || undefined}
            aria-haspopup={it.items?.length ? "menu" : undefined}
            aria-expanded={it.items?.length ? aim.branch === i : undefined}
            className={cn(
              "absolute -mt-4.5 -ml-4.5 grid size-9 place-items-center transition-[color,opacity,scale] duration-150 [&_svg]:size-5",
              it.disabled && "opacity-35",
              on && aim.sub < 0 && "scale-110",
              look.icon(on),
            )}
            style={{ left: at.x, top: at.y }}
          >
            {glyph(it)}
          </div>
        );
      })}
      {branch && (
        <div role="menu" aria-label={branch.label}>
          {kids.map((kid, k) => {
            const at = polar(C, RADIAL.band.icon, childAngle(parentAngle, k, kids.length));
            const on = aim.sub === k;
            return (
              <motion.div
                key={kid.id}
                id={dial.itemId(aim.branch, k)}
                role="menuitem"
                aria-label={kid.label}
                aria-disabled={kid.disabled || undefined}
                className={cn(
                  "absolute -mt-4 -ml-4 grid size-8 place-items-center transition-colors duration-150 [&_svg]:size-4.5",
                  look.icon(on),
                )}
                style={{ left: at.x, top: at.y }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: kid.disabled ? 0.35 : 1, scale: on ? 1.1 : 1 }}
                transition={{ ...pop, delay: k * 0.02 }}
              >
                {glyph(kid)}
              </motion.div>
            );
          })}
        </div>
      )}
      <div
        className={cn(
          "absolute flex flex-col items-center justify-center gap-0.5 rounded-full px-2.5 text-center",
          look.hub,
        )}
        style={{ inset: C - RADIAL.hub }}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ transform: needle, opacity: dial.pointing }}
        >
          <span
            className={cn("absolute top-1/2 right-1 -mt-0.75 size-1.5 rounded-full", look.needle)}
          />
        </motion.span>
        <span className={cn("line-clamp-2 leading-tight", look.title)}>
          {aimed?.label ?? label}
        </span>
        {aimed?.shortcut && <span className={look.shortcut}>{aimed.shortcut}</span>}
      </div>
    </motion.div>
  );
}
