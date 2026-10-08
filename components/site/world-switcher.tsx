"use client";

import { useRef, type KeyboardEvent } from "react";
import { WORLD_INFO } from "@/content/worlds";
import { keyToIndex } from "@/lib/keys";
import { useSiteWorld } from "./site-world";

/** The site's world picker: a segmented control, numbered for the 1–4 shortcuts. */
export function WorldSwitcher() {
  const { world, setWorld } = useSiteWorld();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = WORLD_INFO.findIndex((w) => w.id === world);

  const onKeyDown = (e: KeyboardEvent) => {
    const next = keyToIndex(e.key, index, WORLD_INFO.length, { wrap: true });
    if (next === null) return;
    e.preventDefault();
    setWorld(WORLD_INFO[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label="Design world" onKeyDown={onKeyDown} className="world-tabs">
      {WORLD_INFO.map((w, i) => {
        const active = w.id === world;
        return (
          <button
            key={w.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => setWorld(w.id)}
          >
            <b>{String(i + 1).padStart(2, "0")}</b>
            {w.id[0].toUpperCase() + w.id.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
