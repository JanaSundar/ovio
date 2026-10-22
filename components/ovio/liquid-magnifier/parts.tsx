import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { MagnifierWorldProps } from "./liquid-magnifier";
import type { useMagnifierWorld } from "./use-magnifier";

const FILL =
  "absolute inset-0 [&_img]:pointer-events-none [&_img]:size-full [&_img]:object-cover [&>*]:size-full";

type ViewProps = {
  world: MagnifierWorldProps;
  lens: ReturnType<typeof useMagnifierWorld>;
  className?: string;
  /** The lens box: its shadow, and its shape when the world has no liquid edge. */
  lensClassName?: string;
  /** Behind the magnified copy, where it doesn't reach. */
  glassClassName?: string;
  /** Drawn over the glass: highlights, rings, crosshairs. */
  rimClassName?: string;
  /** Hangs off the lens under the glass, like Craft's handle. */
  behind?: ReactNode;
  /** Drawn over the view, like Retro's scanlines. */
  children?: ReactNode;
};

/**
 * The view every world draws: the content, and the lens carrying a magnified copy of it. The
 * lens never leaves the view; worlds style the glass and its rim.
 */
export function MagnifierView({
  world,
  lens,
  className,
  lensClassName,
  glassClassName,
  rimClassName,
  behind,
  children,
}: ViewProps) {
  return (
    <div
      {...lens.view}
      className={cn("relative w-full touch-pan-y overflow-hidden select-none", className)}
      style={{ aspectRatio: world.aspectRatio }}
    >
      <div className={FILL}>{world.children}</div>
      {children}
      <motion.div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 left-0 z-10 will-change-transform",
          lensClassName,
        )}
        style={{
          width: lens.size,
          height: lens.size,
          transform: lens.transform,
          borderRadius: lens.radius,
        }}
      >
        {behind}
        <div
          inert
          className={cn("absolute inset-0 overflow-hidden rounded-[inherit]", glassClassName)}
        >
          <motion.div
            className={cn(FILL, "right-auto bottom-auto origin-top-left")}
            style={{ width: lens.box.w, height: lens.box.h, transform: lens.content }}
          >
            {world.children}
          </motion.div>
        </div>
        <div className={cn("absolute inset-0 rounded-[inherit]", rimClassName)} />
      </motion.div>
    </div>
  );
}
