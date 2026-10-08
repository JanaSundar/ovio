"use client";

import {
  type ComponentType,
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { keyToIndex } from "@/lib/keys";
import { MinimalGooeyTabs } from "./worlds/minimal";
import { CraftGooeyTabs } from "./worlds/craft";
import { RetroGooeyTabs } from "./worlds/retro";
import { ToyGooeyTabs } from "./worlds/toy";

export type GooeyStatus = "offline" | "building" | "online";

export type GooeyTabsProps = {
  tabs: string[];
  variant?: World;
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  /** Deploy indicator state. Leave out to hide the indicator. */
  status?: GooeyStatus;
  /** Blur strength of the goo filter. */
  goo?: number;
  /** Content for each tab's panel, by index. */
  panels?: ReactNode[];
  /** Accessible name for the tab list. */
  label?: string;
  className?: string;
};

export type GooeyTabsWorldProps = {
  tabs: string[];
  index: number;
  select: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  tabRef: (index: number) => (el: HTMLButtonElement | null) => void;
  tabId: (index: number) => string;
  panelId: string;
  /** A filter id unique to this instance, so several tab bars can share a page. */
  filterId: string;
  goo: number;
  status?: GooeyStatus;
  statusLabel?: string;
  panel?: ReactNode;
  label: string;
  className?: string;
};

const STATUS_LABEL: Record<GooeyStatus, string> = {
  offline: "Offline",
  building: "Building…",
  online: "Online",
};

export const STATUS_INDEX: Record<GooeyStatus, number> = { offline: 0, building: 1, online: 2 };

const VIEWS = {
  minimal: MinimalGooeyTabs,
  craft: CraftGooeyTabs,
  retro: RetroGooeyTabs,
  toy: ToyGooeyTabs,
} satisfies Record<World, ComponentType<GooeyTabsWorldProps>>;

export function GooeyTabs({
  tabs,
  variant,
  value,
  defaultValue = 0,
  onValueChange,
  status,
  goo = 9,
  panels,
  label = "Sections",
  className,
}: GooeyTabsProps) {
  const world = useWorld(variant);
  const [inner, setInner] = useState(defaultValue);
  const index = Math.max(0, Math.min(tabs.length - 1, value ?? inner));
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const select = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(tabs.length - 1, next));
      if (value === undefined) setInner(clamped);
      if (clamped !== index) onValueChange?.(clamped);
    },
    [index, onValueChange, tabs.length, value],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const next = keyToIndex(event.key, index, tabs.length);
    if (next === null) return;
    event.preventDefault();
    select(next);
    refs.current[next]?.focus();
  };

  const props: GooeyTabsWorldProps = {
    tabs,
    index,
    select,
    onKeyDown,
    tabRef: (i) => (el) => {
      refs.current[i] = el;
    },
    tabId: (i) => `${id}-tab-${i}`,
    panelId: `${id}-panel`,
    filterId: `ovio-goo-${id}`,
    goo,
    status,
    statusLabel: status ? STATUS_LABEL[status] : undefined,
    panel: panels?.[index],
    label,
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
