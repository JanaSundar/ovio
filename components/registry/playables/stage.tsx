"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { remountKey, type Values } from "@/lib/registry/controls";
import { cn } from "@/lib/utils";
import { propsOf, SPECS, type RenderGroup } from "./specs";

type GroupProps = { slug: string; props: Record<string, unknown> };

const Loading = () => (
  <div
    role="status"
    aria-label="Loading preview"
    className="h-24 w-48 animate-pulse rounded-xl bg-black/10"
  />
);

/** Each group's components load the first time one of them is shown. */
const GROUPS: Record<RenderGroup, ComponentType<GroupProps>> = {
  new: dynamic(() => import("./renders/new"), { loading: Loading }),
  manipulation: dynamic(() => import("./renders/manipulation"), { loading: Loading }),
  data: dynamic(() => import("./renders/data"), { loading: Loading }),
  surfaces: dynamic(() => import("./renders/surfaces"), { loading: Loading }),
};

/** The interaction itself, drawn from control values. Mount-only props remount it when they change. */
export function PlayableView({
  slug,
  values,
  nonce = 0,
}: {
  slug: string;
  values: Values;
  nonce?: number;
}) {
  const spec = SPECS[slug];
  if (!spec) return <Unavailable>No preview is defined for this interaction.</Unavailable>;
  const Group = GROUPS[spec.group];
  return (
    <Group
      key={`${nonce}:${remountKey(spec.controls, values)}`}
      slug={slug}
      props={propsOf(spec, values)}
    />
  );
}

export type CanvasTone = "light" | "dark";

/**
 * The surface a preview sits on. Ovio components get their style's own stage colour on "light";
 * "dark" is the registry's deck, for checking a component against a dark page.
 */
export function Canvas({
  tone,
  variant,
  className,
  children,
}: {
  tone: CanvasTone;
  variant?: string;
  className?: string;
  children: ReactNode;
}) {
  const world = variant ?? "minimal";
  return (
    <div
      data-ovio-world={world}
      className={cn(
        "relative flex items-center justify-center",
        tone === "dark"
          ? "reg-canvas-dark"
          : variant
            ? "ovio-stage bg-(--ovio-stage)"
            : "reg-canvas-light",
        className,
      )}
    >
      {children}
      {tone === "light" && world === "retro" && variant && (
        <div aria-hidden className="ovio-scanlines" />
      )}
    </div>
  );
}

export function Unavailable({ children }: { children: ReactNode }) {
  return (
    <div role="note" className="max-w-xs text-center text-sm text-haze">
      {children}
    </div>
  );
}

/**
 * A preview drawn at the component's own width and scaled down to fit its box, mounted once it
 * scrolls near the viewport. It is inert: the card around it is the link.
 */
export function ScaledPreview({ slug, values }: { slug: string; values: Values }) {
  const spec = SPECS[slug];
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = box.current!;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), {
      rootMargin: "300px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !spec) return;
    const fit = () => {
      const b = box.current;
      const c = inner.current;
      if (!b || !c) return;
      const pad = 24;
      const s = Math.min(
        1,
        (b.clientWidth - pad) / c.offsetWidth,
        (b.clientHeight - pad) / c.offsetHeight,
      );
      setScale(Math.max(0.2, s));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box.current!);
    ro.observe(inner.current!);
    return () => ro.disconnect();
  }, [visible, spec]);

  return (
    <div ref={box} className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {visible && spec && (
        <div
          ref={inner}
          inert
          aria-hidden
          className="flex shrink-0 justify-center transition-opacity duration-300"
          style={{ width: spec.width, transform: `scale(${scale})`, opacity: scale ? 1 : 0 }}
        >
          <PlayableView slug={slug} values={values} />
        </div>
      )}
    </div>
  );
}
