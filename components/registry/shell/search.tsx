"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { INTERACTIONS, interactionHref } from "@/content/interactions";
import { CATEGORIES } from "@/content/interactions/types";
import { DEFAULT_QUERY, queryRegistry, queryString } from "@/lib/registry/query";
import { cn } from "@/lib/utils";
import { BROWSE } from "./links";

const SHOWN = 6;

/**
 * Global search: a combobox over the registry. Arrow keys pick a result, Enter opens it, and with
 * nothing picked Enter shows every match on the component list. "/" or ⌘K focuses it.
 */
export function RegistrySearch({ className }: { className?: string }) {
  const router = useRouter();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const matches = q.trim() ? queryRegistry(INTERACTIONS, { ...DEFAULT_QUERY, q }) : [];
  const shown = matches.slice(0, SHOWN);
  const expanded = open && q.trim().length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement && /^(input|textarea|select)$/i.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    setActive(-1);
    input.current?.blur();
    router.push(href);
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={input}
        type="search"
        role="combobox"
        aria-label="Search interactions"
        aria-expanded={expanded}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={expanded && active >= 0 ? `${id}-${active}` : undefined}
        placeholder="Search interactions"
        value={q}
        maxLength={80}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            // The results, then "See all" last.
            const total = shown.length + 1;
            const step = e.key === "ArrowDown" ? 1 : -1;
            setActive((a) => (a < 0 && step < 0 ? total - 1 : (a + step + total) % total));
          } else if (e.key === "Enter" && q.trim()) {
            e.preventDefault();
            go(
              active >= 0 && shown[active]
                ? interactionHref(shown[active].slug)
                : `${BROWSE}${queryString({ q })}`,
            );
          } else if (e.key === "Escape") {
            setQ("");
            setOpen(false);
          }
        }}
        className="h-9 w-full rounded-lg border border-seam bg-deck pr-12 pl-9 text-sm text-snow placeholder:text-haze focus:border-seam-2 focus:outline-none focus-visible:outline-2 [&::-webkit-search-cancel-button]:hidden"
      />
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-haze"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" />
      </svg>
      <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-seam-2 px-1.5 font-mono text-[10px] text-haze">
        ⌘K
      </kbd>
      <div
        id={`${id}-list`}
        role="listbox"
        aria-label="Matching interactions"
        hidden={!expanded}
        className="absolute top-11 right-0 left-0 z-40 overflow-hidden rounded-xl border border-seam bg-raised p-1 shadow-[0_20px_50px_-12px_rgba(0,0,0,.8)]"
      >
        {/* The input owns the keyboard and points at options with aria-activedescendant. */}
        {shown.map((m, i) => (
          // oxlint-disable-next-line jsx-a11y/click-events-have-key-events
          <div
            key={m.slug}
            id={`${id}-${i}`}
            role="option"
            aria-selected={active === i}
            onPointerDown={(e) => e.preventDefault()}
            onPointerMove={() => setActive(i)}
            onClick={() => go(interactionHref(m.slug))}
            className={cn(
              "flex cursor-pointer flex-col rounded-lg px-3 py-2",
              active === i && "bg-white/[0.06]",
            )}
          >
            <span className="text-sm text-snow">{m.name}</span>
            <span className="truncate text-xs text-haze">
              {CATEGORIES.find((c) => c.id === m.categories[0])?.label} · {m.tags.join(", ")}
            </span>
          </div>
        ))}
        {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div
          role="option"
          aria-selected={active === shown.length}
          id={`${id}-${shown.length}`}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => go(`${BROWSE}${queryString({ q })}`)}
          className={cn(
            "cursor-pointer rounded-lg px-3 py-2 text-xs text-mist",
            active === shown.length && "bg-white/[0.06]",
          )}
        >
          {matches.length
            ? `See all ${matches.length} results`
            : `No interactions match “${q.trim()}”`}
        </div>
      </div>
    </div>
  );
}
