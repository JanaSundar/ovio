"use client";

import { type ComponentType, type ReactNode, useState } from "react";
import { useWorld } from "@/components/shared/world-provider";
import { everyWorld, type InstalledWorld } from "@/lib/world";
import { clampThreshold } from "./scratch";
import * as worlds from "./worlds";

export interface ScratchToRevealProps {
  variant?: InstalledWorld<typeof worlds>;
  /** What the coating hides. It stays inert, and hidden from assistive tech, until revealed. Images fill the pad. */
  children: ReactNode;
  /** Controlled. Set it back to false to put the coating back on. */
  revealed?: boolean;
  defaultRevealed?: boolean;
  /** Fires when scratching (or Enter / Space) reveals it. */
  onRevealedChange?: (revealed: boolean) => void;
  /** Fires while scratching with the share scratched away, 0–1. */
  onProgress?: (share: number) => void;
  /** The share to scratch, 0–1, before the rest of the coating clears by itself. */
  threshold?: number;
  /** Printed on the coating until the first scratch. */
  hint?: string;
  /** Accessible name for the pad, also printed by the worlds. */
  label?: string;
  /** CSS aspect ratio of the pad. */
  aspectRatio?: string;
  disabled?: boolean;
  className?: string;
}

export type ScratchWorldProps = Required<
  Pick<ScratchToRevealProps, "children" | "threshold" | "hint" | "label" | "aspectRatio">
> &
  Pick<ScratchToRevealProps, "onProgress" | "disabled" | "className"> & {
    revealed: boolean;
    setRevealed: (revealed: boolean) => void;
  };

/** The installed worlds; a single-world install draws its one world for any provider world. */
const VIEWS = everyWorld<ComponentType<ScratchWorldProps>>(worlds);

export function ScratchToReveal({
  variant,
  revealed: revealedProp,
  defaultRevealed = false,
  onRevealedChange,
  threshold = 0.5,
  hint = "Scratch to reveal",
  label = "Hidden content",
  aspectRatio = "3 / 2",
  ...rest
}: ScratchToRevealProps) {
  const world = useWorld(variant);
  const [inner, setInner] = useState(defaultRevealed);
  const revealed = revealedProp ?? inner;

  const setRevealed = (next: boolean) => {
    if (revealedProp === undefined) setInner(next);
    onRevealedChange?.(next);
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return (
    <View
      {...rest}
      revealed={revealed}
      setRevealed={setRevealed}
      threshold={clampThreshold(threshold)}
      hint={hint}
      label={label}
      aspectRatio={aspectRatio}
    />
  );
}
