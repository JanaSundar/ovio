"use client";

import Link from "next/link";
import { interactionHref, type Interaction } from "@/content/interactions";
import { defaultsOf } from "@/lib/registry/controls";
import { cn } from "@/lib/utils";
import { SPECS } from "../playables/specs";
import { Canvas, ScaledPreview } from "../playables/stage";
import { categoryLabel, Marker, PlatformBadges, Tag } from "../ui/badges";

/**
 * One interaction: a live, inert preview drawn at its own size and scaled to fit, then its name,
 * what it does, where it runs and how to find it. The name's link stretches over the whole card.
 */
export function InteractionCard({ item, wide }: { item: Interaction; wide?: boolean }) {
  const spec = SPECS[item.slug];
  const values = spec ? defaultsOf(spec.controls) : {};

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-seam bg-deck transition-colors hover:border-seam-2 has-[a:focus-visible]:border-violet/60">
      <Canvas
        tone={spec?.canvas ?? "dark"}
        variant={item.styles ? (values.variant as string) : undefined}
        className={cn("m-1.5 overflow-hidden rounded-xl", wide ? "h-64" : "h-52")}
      >
        <ScaledPreview slug={item.slug} values={values} />
      </Canvas>
      <div className="flex flex-1 flex-col gap-2.5 px-4 pt-2.5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate text-[15px] font-medium tracking-[-0.01em] text-snow">
            <Link
              href={interactionHref(item.slug)}
              className="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {item.name}
            </Link>
          </h3>
          {item.isNew ? (
            <Marker tone="signal">New</Marker>
          ) : item.featured ? (
            <Marker tone="violet">Featured</Marker>
          ) : null}
        </div>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-mist">{item.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-1">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="truncate text-xs text-mist">{categoryLabel(item.categories[0])}</span>
            <span className="hidden gap-2 sm:flex">
              {item.tags.slice(0, 2).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </span>
          </span>
          <PlatformBadges platforms={item.platforms} />
        </div>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute top-4 right-4 grid size-7 place-items-center rounded-full bg-void/70 text-sm text-snow opacity-0 transition-opacity group-hover:opacity-100"
      >
        ↗
      </span>
    </article>
  );
}
