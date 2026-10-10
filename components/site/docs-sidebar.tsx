"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { COMPONENTS, DOC_SECTIONS, docSections, pad2 } from "@/content/components";
import { ease, useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { shortcutKey } from "./shortcuts";

/** How the active markers glide to the next link or section. */
const GLIDE: Transition = { duration: 0.25, ease: ease.stage };

type Box = { y: number; height: number };

/**
 * A marker that slides to the active item of a list. It is measured inside the list (offsetTop),
 * not on the page: the lists are sticky, so page positions shift with every scroll, and a shared
 * layout animation read the jump to the top on a new page as a long flight.
 */
function useMarker(active: string | null, layout = "") {
  const items = useRef(new Map<string, HTMLElement>());
  const [box, setBox] = useState<Box | null>(null);
  // Measured when the active item changes, or when `layout` says the list itself changed.
  useLayoutEffect(() => {
    const el = active === null ? undefined : items.current.get(active);
    const next = el ? { y: el.offsetTop, height: el.offsetHeight } : null;
    setBox((b) => (b?.y === next?.y && b?.height === next?.height ? b : next));
    // oxlint-disable-next-line react/exhaustive-deps -- `layout` is the trigger, not a value read here
  }, [active, layout]);
  const item = (key: string) => (el: HTMLElement | null) => {
    if (el) items.current.set(key, el);
    else items.current.delete(key);
  };
  return { item, box };
}

/** The marker itself: placed at once the first time, then gliding. */
function Marker({
  box,
  className,
  inset = 0,
}: {
  box: Box | null;
  className: string;
  inset?: number;
}) {
  const glide = useOvioTransition(GLIDE);
  if (!box) return null;
  return (
    <motion.span
      aria-hidden
      className={className}
      initial={false}
      animate={{ y: box.y + inset, height: box.height - inset * 2 }}
      transition={glide}
    />
  );
}

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
  const marker = useMarker(shown.some((c) => `/docs/${c.slug}` === pathname) ? pathname : null, q);

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
        <Marker box={marker.box} className="side-active" />
        {shown.map((c) => {
          const href = `/docs/${c.slug}`;
          return (
            <Link
              key={c.slug}
              ref={marker.item(href)}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              onClick={onNavigate}
            >
              {c.name}
              <small>{pad2(c.n)}</small>
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
      if (shortcutKey(e) !== "/") return;
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

/** Keeps Tab and Shift+Tab cycling inside a modal, so focus never wanders to the page behind it. */
function trapFocus(e: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const items = [...root.querySelectorAll<HTMLElement>("a[href], button, input")].filter(
    (el) => !el.hasAttribute("disabled"),
  );
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const at = document.activeElement;
  if (e.shiftKey && (at === first || at === root)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (at === last || !root.contains(at))) {
    e.preventDefault();
    first.focus();
  }
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
  const lenis = useLenis();

  const close = () => {
    setOpen(false);
    fab.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    // Focus the sheet rather than the search, so a phone keyboard doesn't cover the list.
    sheet.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") return trapFocus(e, sheet.current);
      if (e.key !== "Escape") return;
      setOpen(false);
      fab.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    // Hold the page still behind the sheet.
    lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, lenis]);

  return (
    <div className="fab-root">
      <motion.button
        ref={fab}
        type="button"
        className="fab"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.97 }}
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
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Components"
              className="fab-sheet"
              style={{ transformOrigin: "100% 100%" }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
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

/** "On this page", marking the section nearest the top of the viewport. */
export function DocsToc() {
  const pathname = usePathname();
  const [active, setActive] = useState<string>(DOC_SECTIONS[0].id);
  const [page, setPage] = useState(pathname);
  const marker = useMarker(active);
  const sections = docSections(pathname.split("/").pop() ?? "");
  // It lives in the docs layout, so it outlasts a page: a new component starts at the top and
  // the mark glides back to the first section.
  if (page !== pathname) {
    setPage(pathname);
    setActive(DOC_SECTIONS[0].id);
  }

  useEffect(() => {
    const els = DOC_SECTIONS.map((s) => document.getElementById(s.id)).filter(
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
      if (end) setActive(DOC_SECTIONS[DOC_SECTIONS.length - 1].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    // Each page has its own section elements to watch, so a new page sets up the observer again.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [pathname]);

  return (
    <aside className="toc">
      <p className="toc-title">On this page</p>
      <Marker box={marker.box} className="toc-active" inset={6} />
      {sections.map((s) => (
        <a
          key={s.id}
          ref={marker.item(s.id)}
          href={`#${s.id}`}
          aria-current={active === s.id ? "location" : undefined}
        >
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
