"use client";

import { useAnimate } from "motion/react";
import { useEffect, useEffectEvent, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/motion";
import { PLAY, SETTLE, type Timing } from "./send";

export type Animate = ReturnType<typeof useAnimate>[1];

/**
 * Runs a world's send sequence once the letter is sent. A letter that was already sent when the
 * world mounted (switching worlds afterwards) settles at once, and so does every send under reduced
 * motion: the sequence is the same, only its timing changes. Animations stop with the component.
 */
export function useSend(
  sent: boolean,
  sequence: (animate: Animate, root: HTMLDivElement, t: Timing) => unknown,
) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduced = useReducedMotionSafe();
  const sentOnMount = useRef(sent);
  const run = useEffectEvent((root: HTMLDivElement) =>
    sequence(animate, root, sentOnMount.current || reduced ? SETTLE : PLAY),
  );

  useEffect(() => {
    if (sent && scope.current) run(scope.current);
  }, [sent, scope]);

  return scope;
}
