"use client";

import { useEffect, useState } from "react";
import { INTERACTIONS } from "@/content/interactions";
import { COLLECTIONS, type PlatformFilter } from "@/content/interactions/types";
import {
  DEFAULT_QUERY,
  isFiltered,
  queryRegistry,
  type Highlight,
  type RegistryQuery,
  type Sort,
} from "@/lib/registry/query";
import { cn } from "@/lib/utils";
import { useRegistryQuery } from "../shell/use-registry-query";
import { categoryLabel } from "../ui/badges";
import { InteractionCard } from "./card";

const CHIPS: { label: string; highlight?: Highlight; platform?: PlatformFilter }[] = [
  { label: "All", highlight: "all", platform: "all" },
  { label: "Featured", highlight: "featured" },
  { label: "New", highlight: "new" },
  { label: "Web", platform: "web" },
  { label: "Expo", platform: "native" },
  { label: "Both", platform: "both" },
];

const SORTS: { id: Sort; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "newest", label: "Newest" },
  { id: "name", label: "A–Z" },
];

/** Search, filter chips, sort and the grid, all reading and writing one query in the URL. */
export function RegistryBrowser({ statusId }: { statusId: string }) {
  const { query, update } = useRegistryQuery();
  return <BrowserView statusId={statusId} query={query} update={update} />;
}

/** The browser for a given query; the server renders it unfiltered until the URL is known. */
export function BrowserView({
  statusId,
  query = DEFAULT_QUERY,
  update = () => {},
}: {
  statusId: string;
  query?: RegistryQuery;
  update?: (patch: Partial<RegistryQuery>) => void;
}) {
  const results = queryRegistry(INTERACTIONS, query);
  // Typing updates the field at once and the URL a beat later, so history isn't one entry per key.
  const [text, setText] = useState(query.q);
  const [synced, setSynced] = useState(query.q);
  if (synced !== query.q) {
    setSynced(query.q);
    setText(query.q);
  }
  useEffect(() => {
    if (text === query.q) return;
    const id = setTimeout(() => update({ q: text }), 180);
    return () => clearTimeout(id);
  }, [text, query.q, update]);

  const pressed = (c: (typeof CHIPS)[number]) =>
    c.label === "All"
      ? query.highlight === "all" && query.platform === "all"
      : (c.highlight ?? query.highlight) === query.highlight &&
        (c.platform ?? query.platform) === query.platform;

  const scope = [
    query.category && { label: categoryLabel(query.category), clear: { category: null } },
    query.collection && {
      label: COLLECTIONS.find((c) => c.id === query.collection)?.label,
      clear: { collection: null },
    },
  ].filter(Boolean) as { label: string; clear: object }[];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1 lg:max-w-xs">
          <span className="sr-only">Search interactions</span>
          <input
            type="search"
            value={text}
            maxLength={80}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search by name, purpose or tag"
            className="h-9 w-full rounded-lg border border-seam bg-deck px-3 text-sm text-snow placeholder:text-haze focus:border-seam-2 focus:outline-none"
          />
        </label>
        <div role="group" aria-label="Show" className="flex flex-wrap items-center gap-1">
          {CHIPS.map((c, i) => (
            <button
              key={c.label}
              type="button"
              aria-pressed={pressed(c)}
              onClick={() =>
                update({
                  highlight: c.highlight ?? query.highlight,
                  platform: c.platform ?? query.platform,
                })
              }
              className={cn(
                "h-8 rounded-lg px-3 text-[13px] transition-colors",
                i === 3 && "ml-2",
                pressed(c)
                  ? "bg-lift text-snow"
                  : "text-haze hover:bg-white/[0.03] hover:text-snow",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-haze lg:ml-auto">
          Sort
          <select
            value={query.sort}
            onChange={(e) => update({ sort: e.target.value as Sort })}
            className="h-8 rounded-lg border border-seam bg-deck px-2 text-[13px] text-snow focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex min-h-6 flex-wrap items-center gap-2 text-xs text-haze">
        <span id={statusId} role="status" aria-live="polite">
          {results.length} {results.length === 1 ? "interaction" : "interactions"}
        </span>
        {scope.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => update(s.clear)}
            aria-label={`Remove filter: ${s.label}`}
            className="rounded-md border border-seam px-2 py-0.5 text-mist hover:text-snow"
          >
            {s.label} ✕
          </button>
        ))}
        {isFiltered(query) && (
          <button
            type="button"
            onClick={() => update(DEFAULT_QUERY)}
            className="text-violet underline-offset-4 hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {results.length ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => (
            <li key={item.slug} className="flex">
              <InteractionCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          native={query.platform === "native" || query.platform === "both"}
          onReset={() => update(DEFAULT_QUERY)}
        />
      )}
    </div>
  );
}

function EmptyState({ native, onReset }: { native: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-seam-2 px-6 py-16 text-center">
      <p className="text-[15px] text-snow">
        {native ? "No Expo implementations yet" : "Nothing matches that"}
      </p>
      <p className="max-w-md text-sm text-mist">
        {native
          ? "Every Ovio interaction runs on the web today. A component gets the Expo badge only once its React Native version exists and has been tested."
          : "Try a shorter search, or clear a filter. Search looks at names, descriptions, purposes, tags and platforms."}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 rounded-lg bg-lift px-3 py-1.5 text-sm text-snow hover:bg-seam-2"
      >
        Show all interactions
      </button>
    </div>
  );
}
