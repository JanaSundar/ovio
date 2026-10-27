import type { ReactNode } from "react";
import {
  CATEGORIES,
  PLATFORM_LABEL,
  type CategoryId,
  type Platform,
} from "@/content/interactions/types";
import { cn } from "@/lib/utils";

const ALL_PLATFORMS: Platform[] = ["web", "native"];

/**
 * Both platforms, always: the ones that exist lit, the others struck through, so "web only" reads
 * at a glance and nothing missing passes for available.
 */
export function PlatformBadges({
  platforms,
  className,
}: {
  platforms: Platform[];
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-1", className)}>
      {ALL_PLATFORMS.map((p) => {
        const has = platforms.includes(p);
        return (
          <span
            key={p}
            title={
              has
                ? `${PLATFORM_LABEL[p]} implementation`
                : `No ${PLATFORM_LABEL[p]} implementation yet`
            }
            className={cn(
              "inline-flex h-5 items-center rounded px-1.5 font-mono text-[10px] tracking-wide",
              has ? "bg-azure/12 text-azure" : "text-haze/70 line-through decoration-haze/50",
            )}
          >
            <span className="sr-only">{has ? "Available for" : "Not available for"} </span>
            {PLATFORM_LABEL[p]}
          </span>
        );
      })}
    </span>
  );
}

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export function Tag({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[11px] text-haze">#{children}</span>;
}

/** A small marker for featured and new items: text, not a pill, so cards stay quiet. */
export function Marker({ tone, children }: { tone: "violet" | "signal"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] tracking-[0.14em] uppercase",
        tone === "violet" ? "text-violet" : "text-signal",
      )}
    >
      {children}
    </span>
  );
}
