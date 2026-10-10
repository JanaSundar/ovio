"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATALOG_GROUPS,
  groupedCatalog,
  type CatalogGroupId,
  type CatalogItem,
} from "@/content/catalog";
import { installCommand } from "@/content/components";
import { track } from "@/lib/analytics";
import { useCopy } from "./copy-command";
import { Demo, DEMOS } from "./demos";
import { PreviewFrame } from "./preview-frame";
import { WorldSwitcher } from "./world-switcher";

/** Mounts a demo only once it is near the viewport, so the gallery does not fetch every API at once. */
function LazySpecimen({ item }: { item: CatalogItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShow(true);
        observer.disconnect();
      },
      { rootMargin: "240px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [show]);

  const minHeight = Math.min(DEMOS[item.slug]?.minHeight ?? 360, 420);

  return (
    <div ref={ref}>
      {show ? (
        <PreviewFrame minHeight={minHeight}>
          <Demo slug={item.slug} />
        </PreviewFrame>
      ) : (
        <div
          className="gallery-hold"
          style={{ minHeight }}
          role="status"
          aria-label={`Loading ${item.name}`}
        />
      )}
    </div>
  );
}

function InstallCopy({ slug }: { slug: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      className="text-btn"
      onClick={() => {
        copy(installCommand(slug));
        track("install_command_copied", { command_variant: "gallery" });
      }}
    >
      {copied ? "Copied" : "Copy install"}
    </button>
  );
}

/** Every component, live, filtered by group or name, in the site's current world. */
export function GalleryBoard() {
  const groups = useMemo(() => groupedCatalog(), []);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<CatalogGroupId | "all">("all");
  const q = query.trim().toLowerCase();

  const shown = groups
    .filter((g) => group === "all" || g.id === group)
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (item) =>
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.pitch.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      ),
    }))
    .filter((g) => g.items.length > 0);

  const count = shown.reduce((n, g) => n + g.items.length, 0);

  return (
    <main id="gallery">
      <section className="page-intro row-12">
        <aside className="intro-index">
          <span className="status">
            <i /> Live
          </span>
          <span className="world-count">
            <b>Gallery</b>
            {groups.reduce((n, g) => n + g.items.length, 0)} components
            <br />
            Press 1–4
            <br />
            to switch worlds
          </span>
        </aside>
        <div className="intro-main">
          <div>
            <p className="eyebrow">All 15 components</p>
            <h1>
              See the work
              <br />
              <em>before you install it.</em>
            </h1>
          </div>
          <div className="intro-bottom">
            <p className="intro-copy">
              <strong>Every preview follows the world you pick.</strong> Filter by what you need to
              show, then copy the install command.
            </p>
            <Link className="inline-link" href="/recipes">
              Or start from a recipe ↘
            </Link>
          </div>
        </div>
        <aside className="intro-side gallery-switch">
          <span className="side-caption">
            <b>The world</b>
            Shared by every card
          </span>
          <WorldSwitcher />
        </aside>
      </section>

      <section className="gallery-bar row-12">
        <label className="side-search gallery-search">
          <span aria-hidden>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components"
            aria-label="Search components"
          />
        </label>
        <div className="filter-row" role="tablist" aria-label="Component groups">
          <button
            type="button"
            role="tab"
            aria-selected={group === "all"}
            onClick={() => setGroup("all")}
          >
            All
          </button>
          {CATALOG_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={group === g.id}
              onClick={() => setGroup(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </section>

      {count === 0 ? (
        <p className="gallery-empty">Nothing matches. Try another word, or show every group.</p>
      ) : (
        shown.map((g) => (
          <section key={g.id} className="gallery-group" aria-label={g.label}>
            <header className="gallery-group-head row-12">
              <h2>{g.label}</h2>
              <p>{g.blurb}</p>
            </header>
            <div className="gallery-grid">
              {g.items.map((item) => (
                <article key={item.slug} className="gallery-card">
                  <header>
                    <span aria-hidden className="glyph">
                      {item.glyph}
                    </span>
                    <span>
                      <b>{item.name}</b>
                      <small>{item.pitch}</small>
                    </span>
                  </header>
                  <LazySpecimen item={item} />
                  <footer>
                    <Link href={`/docs/${item.slug}`}>Docs ↗</Link>
                    <InstallCopy slug={item.slug} />
                  </footer>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
