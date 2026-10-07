"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useVelocity,
  type HTMLMotionProps,
} from "motion/react";
import { motionTokens, useOvioTransition } from "@/lib/motion";

type ToyKeyProps = Omit<HTMLMotionProps<"button">, "style"> & {
  /** How far the key travels when pressed, in px. Also the height of its side. */
  depth?: number;
  /** Colour of the key's side (the shadow under the cap). */
  side?: string;
  style?: Omit<NonNullable<HTMLMotionProps<"button">["style"]>, "y" | "boxShadow">;
};

/**
 * A raised plastic key. Hover lifts it, press compresses it into its surface,
 * release springs back (Toy key spring, k900 c22). Space and Enter press it too.
 */
export function ToyKey({ depth = 6, side = "rgba(0,0,0,.25)", style, ...props }: ToyKeyProps) {
  const transition = useOvioTransition(motionTokens.toy.key);
  const y = useMotionValue(0);
  const boxShadow = useTransform(y, (v) => {
    const lift = Math.max(0, depth - v);
    return `0 ${lift.toFixed(2)}px 0 ${side}, 0 ${(lift * 1.4 + 3).toFixed(1)}px ${(lift * 1.6 + 6).toFixed(1)}px -5px rgba(40,28,10,.32)`;
  });

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ y: depth - 1 }}
      transition={transition}
      {...props}
      style={{ ...style, y, boxShadow }}
    />
  );
}

type ToyPieceProps = Omit<HTMLMotionProps<"div">, "style"> & {
  style?: Omit<NonNullable<HTMLMotionProps<"div">["style"]>, "x" | "y" | "rotate">;
};

/**
 * A loose piece in a socket: it follows the pointer with weight, resists the further it goes,
 * tilts with its speed, then wobbles back to its seat (Toy piece spring, k240 c14).
 */
export function ToyPiece({ style, ...props }: ToyPieceProps) {
  const back = useOvioTransition(motionTokens.toy.piece);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const vx = useVelocity(x);
  const rotate = useTransform(vx, (v) => Math.max(-14, Math.min(14, v * 0.014)));
  const spring = "stiffness" in back ? back : { stiffness: 10000, damping: 1000 };

  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.45}
      dragTransition={{ bounceStiffness: spring.stiffness, bounceDamping: spring.damping }}
      whileDrag={{ scale: 1.06, zIndex: 20, cursor: "grabbing" }}
      {...props}
      style={{ ...style, x, y, rotate, touchAction: "none", cursor: "grab" }}
    />
  );
}
