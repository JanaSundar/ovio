"use client";

import type { PlatformFilter } from "@/content/interactions/types";
import { cn } from "@/lib/utils";
import { isBrowsePage } from "./links";
import { useRegistryQuery } from "./use-registry-query";

const OPTIONS: { id: PlatformFilter; label: string }[] = [
  { id: "web", label: "Web" },
  { id: "native", label: "Expo" },
  { id: "all", label: "All" },
];

/** Narrows the registry to a platform. Off a browse page, choosing one opens the component list. */
export function PlatformSelect({ className }: { className?: string }) {
  const { query, update, pathname } = useRegistryQuery();
  return (
    <PlatformButtons
      className={className}
      value={isBrowsePage(pathname) ? query.platform : null}
      onChange={(platform) => update({ platform })}
    />
  );
}

/** The buttons alone: the server renders them unpressed until the URL's query is known. */
export function PlatformButtons({
  className,
  value = null,
  onChange,
}: {
  className?: string;
  value?: PlatformFilter | null;
  onChange?: (platform: PlatformFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Platform"
      className={cn("flex rounded-lg border border-seam bg-deck p-0.5", className)}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange?.(o.id)}
          className={cn(
            "h-7 rounded-md px-2.5 text-xs transition-colors",
            value === o.id ? "bg-lift text-snow" : "text-haze hover:text-snow",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
