"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { COMPONENTS } from "@/content/components";
import { useReducedMotionSafe } from "@/lib/motion";

/** The component search and list, shared by the sidebar and the small-screen menu. */
function ComponentLinks({
  inputRef,
  onNavigate,
}: {
  inputRef?: RefObject<HTMLInputElement | null>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = COMPONENTS.map((c, i) => ({ ...c, n: i + 1 })).filter((c) =>
    c.name.toLowerCase().includes(q),
  );

  return (
    <>
      <label className="side-search">
        <span aria-hidden>⌕</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Escape" || !query) return;
            e.stopPropagation();
            setQuery("");
          }}
          placeholder="Find a component"
          aria-label="Find a component"
        />
        <kbd>/</kbd>
      </label>
      <p className="side-title">
        <span>Components</span>
        <span>{COMPONENTS.length}</span>
      </p>
      <nav className="side-links" aria-label="Components">
        {shown.map((c) => {
          const href = `/docs/${c.slug}`;
          return (
            <Link
              key={c.slug}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={c.ready ? undefined : "soon"}
              onClick={onNavigate}
            >
              {c.name}
              <small>{c.ready ? String(c.n).padStart(2, "0") : "soon"}</small>
            </Link>
          );
        })}
        {shown.length === 0 && <span className="side-empty">No match</span>}
      </nav>
    </>
  );
}

/** The docs index: every component, filterable, with "/" to jump to the search. */
export function DocsSidebar() {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return;
      // Below 880px the sidebar is hidden and the floating menu takes over.
      if (!input.current?.offsetParent) return;
      e.preventDefault();
      input.current.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <aside className="side">
      <div className="side-inner">
        <ComponentLinks inputRef={input} />
        <p className="side-note">
          <b>Every component has four worlds.</b>
          <br />
          Same props. A different point of view.
        </p>
      </div>
    </aside>
  );
}

/**
 * Below 880px: a floating button in the bottom right that opens every component in a sheet.
 * Picking one navigates there and closes it; Escape, the backdrop and the close button do too.
 */
export function DocsFab() {
  const [open, setOpen] = useState(false);
  const fab = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();

  const close = () => {
    setOpen(false);
    fab.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    // Focus the sheet rather than the search, so a phone keyboard doesn't cover the list.
    sheet.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      fab.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <div className="fab-root">
      <motion.button
        ref={fab}
        type="button"
        className="fab"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.92 }}
      >
        <svg viewBox="0 0 20 20" aria-hidden>
          <rect x="3" y="3" width="6" height="6" rx="1.5" />
          <rect x="11" y="3" width="6" height="6" rx="1.5" />
          <rect x="3" y="11" width="6" height="6" rx="1.5" />
          <rect x="11" y="11" width="6" height="6" rx="1.5" />
        </svg>
        Components
      </motion.button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fab-backdrop"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              ref={sheet}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Components"
              className="fab-sheet"
              style={{ transformOrigin: "100% 100%" }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 16 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <div className="fab-head">
                <b>Components</b>
                <button type="button" onClick={close} aria-label="Close">
                  ✕
                </button>
              </div>
              <ComponentLinks onNavigate={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const SECTIONS = [
  { id: "preview", label: "Preview" },
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Usage" },
  { id: "props", label: "Props" },
];

/** "On this page", marking the section nearest the top of the viewport. */
export function DocsToc() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "0px 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    // The last section is too short to reach the top band, so the page's end selects it.
    const onScroll = () => {
      const end = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
      if (end) setActive(SECTIONS[SECTIONS.length - 1].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <aside className="toc">
      <p className="toc-title">On this page</p>
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? "location" : undefined}>
          {s.label}
        </a>
      ))}
      <p className="legend">
        <b>Key commands</b>/ &nbsp;Find a component
        <br />
        1–4 &nbsp;Switch worlds
      </p>
    </aside>
  );
}
