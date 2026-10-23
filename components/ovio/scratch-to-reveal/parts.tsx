import { motion, type TargetAndTransition, type Transition } from "motion/react";
import type { ReactNode } from "react";
import { useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ScratchWorldProps } from "./scratch-to-reveal";
import type { useScratchWorld } from "./use-scratch";

const FILL =
  "absolute inset-0 overflow-hidden [&_img]:pointer-events-none [&_img]:size-full [&_img]:object-cover [&>*]:size-full";

type PadProps = {
  world: ScratchWorldProps;
  scratch: ReturnType<typeof useScratchWorld>;
  className?: string;
  /** The coating's colour until the canvas paints it, so the content never flashes. */
  coatClassName: string;
  /** How the rest of the coating leaves once enough is scratched. */
  clear: { to: TargetAndTransition; transition: Transition };
  /** How the content settles as it shows: it waits under the coating a touch smaller. */
  land: Transition;
  /** Printed on the coating until the first scratch. */
  hint: ReactNode;
  /** Drawn over everything, like Retro's scanlines or Toy's confetti. */
  children?: ReactNode;
};

/**
 * The pad every world draws: the content, the coating canvas over it, and the hint. The content
 * stays inert until revealed. Worlds style it and paint the coating.
 */
export function ScratchPad({
  world,
  scratch,
  className,
  coatClassName,
  clear,
  land,
  hint,
  children,
}: PadProps) {
  const { revealed } = world;
  const clearing = useOvioTransition(clear.transition);
  const landing = useOvioTransition(land);

  return (
    <div
      {...scratch.pad}
      className={cn(
        "relative w-full overflow-hidden select-none",
        !revealed && "cursor-grab touch-none active:cursor-grabbing",
        className,
      )}
      style={{ aspectRatio: world.aspectRatio }}
    >
      <motion.div
        inert={!revealed}
        aria-hidden={!revealed || undefined}
        className={FILL}
        initial={false}
        animate={{ scale: revealed ? 1 : 0.94 }}
        transition={landing}
      >
        {world.children}
      </motion.div>
      <motion.canvas
        {...scratch.coat}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 size-full",
          !scratch.painted && coatClassName,
        )}
        initial={false}
        animate={revealed ? clear.to : { opacity: 1, scale: 1, y: 0 }}
        transition={revealed ? clearing : { duration: 0 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid place-items-center"
        initial={false}
        animate={{ opacity: scratch.hinting ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {hint}
      </motion.div>
      {children}
    </div>
  );
}
