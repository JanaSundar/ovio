"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { GooeyTabs } from "@/components/ovio/gooey-tabs/gooey-tabs";
import { AUTHOR_URL, DOCS_HREF, GITHUB_URL } from "@/content/components";
import { LogoLink } from "./logo";

/** The wrap every page sits in: the 1280px column with dotted rules down each side. */
export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="page">
      <div className="wrap">
        <i aria-hidden className="dot-v left" />
        <i aria-hidden className="dot-v right" />
        {children}
      </div>
    </div>
  );
}

const PAGES = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "Docs", href: DOCS_HREF },
];

/** Home, the gallery (and its recipes), or a docs page. */
function navIndex(pathname: string) {
  if (pathname.startsWith("/docs")) return 2;
  if (pathname.startsWith("/gallery") || pathname.startsWith("/recipes")) return 1;
  return 0;
}

/**
 * The top bar. It lives in the root layout so it stays mounted across pages, which lets the
 * Home / Docs goo indicator travel between tabs as the page changes.
 */
export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const current = navIndex(pathname);
  // Moves the indicator at once; the route catches up, and back/forward bring it along too.
  const [tab, setTab] = useState(current);
  const [shown, setShown] = useState(current);
  if (current !== shown) {
    setShown(current);
    setTab(current);
  }

  useEffect(() => {
    router.prefetch(DOCS_HREF);
    router.prefetch("/gallery");
    router.prefetch("/recipes");
  }, [router]);

  return (
    <header className="nav row-12">
      <div className="brand">
        <LogoLink />
      </div>
      <div className="nav-note">An open component system for developer sites</div>
      <div className="nav-links">
        <GooeyTabs
          variant="minimal"
          className="nav-tabs"
          label="Main"
          tabs={PAGES.map((p) => p.label)}
          value={tab}
          onValueChange={(i) => {
            setTab(i);
            router.push(PAGES[i].href);
          }}
        />
      </div>
      <div className="nav-action">
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Ovio on GitHub">
          GitHub ↗
        </a>
      </div>
    </header>
  );
}

export function SiteFooter({ note, className }: { note: string; className?: string }) {
  return (
    <footer className={`footer ${className ?? ""}`}>
      <span>
        <b>Ovio</b>
        {note}
      </span>
      <span className="footer-links">
        <a className="made-by" href={AUTHOR_URL} target="_blank" rel="noreferrer">
          Made by Jana ↗
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <span>MIT</span>
      </span>
    </footer>
  );
}
