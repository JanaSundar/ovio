import type { ReactNode } from "react";

/**
 * Draws one interaction from its props. Props arrive from the controls as plain values; each
 * render passes them to its component, which owns their types.
 */
// oxlint-disable-next-line typescript/no-explicit-any -- the specs' controls are what keep these props valid.
export type Renders = Record<string, (props: any) => ReactNode>;

/** A group's default export: draws the interaction named by `slug`, for next/dynamic to load. */
export const renderer = (renders: Renders) =>
  function Render({ slug, props }: { slug: string; props: Record<string, unknown> }) {
    return renders[slug]?.(props) ?? null;
  };
