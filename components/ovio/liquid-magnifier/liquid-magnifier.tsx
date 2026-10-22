"use client";

import { type ComponentType, type ReactNode, useState } from "react";
import { useWorld } from "@/components/shared/world-provider";
import { everyWorld, type InstalledWorld } from "@/lib/world";
import { clampZoom, ZOOM_RANGE } from "./magnifier";
import * as worlds from "./worlds";

export interface LiquidMagnifierProps {
  variant?: InstalledWorld<typeof worlds>;
  /** What the lens magnifies. It is drawn twice (once under the lens, once inside it), so keep it free of ids. */
  children: ReactNode;
  /** Controlled zoom. */
  zoom?: number;
  defaultZoom?: number;
  /** Fires when a pinch, Ctrl or Cmd with the wheel, or the + and - keys change the zoom. */
  onZoomChange?: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  /** Lens diameter in px; it never takes more than 40% of the view's width. */
  size?: number;
  /** Where the lens rests while the pointer is elsewhere, as fractions of the view. */
  rest?: { x: number; y: number };
  /** Accessible name for the view, also printed by the worlds. */
  label?: string;
  /** CSS aspect ratio of the view. */
  aspectRatio?: string;
  disabled?: boolean;
  className?: string;
}

export type MagnifierWorldProps = Required<
  Pick<
    LiquidMagnifierProps,
    "children" | "minZoom" | "maxZoom" | "size" | "rest" | "label" | "aspectRatio"
  >
> &
  Pick<LiquidMagnifierProps, "disabled" | "className"> & {
    zoom: number;
    setZoom: (zoom: number) => void;
  };

/** The installed worlds; a single-world install draws its one world for any provider world. */
const VIEWS = everyWorld<ComponentType<MagnifierWorldProps>>(worlds);

export function LiquidMagnifier({
  variant,
  zoom: zoomProp,
  defaultZoom = 2.5,
  onZoomChange,
  minZoom = ZOOM_RANGE.min,
  maxZoom = ZOOM_RANGE.max,
  size = 128,
  rest = { x: 0.62, y: 0.4 },
  label = "Magnifier",
  aspectRatio = "4 / 3",
  ...props
}: LiquidMagnifierProps) {
  const world = useWorld(variant);
  const [inner, setInner] = useState(defaultZoom);
  const zoom = clampZoom(zoomProp ?? inner, minZoom, maxZoom);

  const setZoom = (next: number) => {
    if (zoomProp === undefined) setInner(next);
    onZoomChange?.(next);
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return (
    <View
      {...props}
      zoom={zoom}
      setZoom={setZoom}
      minZoom={minZoom}
      maxZoom={maxZoom}
      size={size}
      rest={rest}
      label={label}
      aspectRatio={aspectRatio}
    />
  );
}
