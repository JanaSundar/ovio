"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LiquidTabs } from "@/components/ovio/liquid-tabs/liquid-tabs";
import { AUTHOR_URL, DOCS_HREF, GITHUB_URL } from "@/content/components";
import { LogoLink } from "./logo";

/** The interaction registry draws its own full-width shell, without the site's column and bar. */
const isRegistry = (pathname: string) => pathname.startsWith("/registry");

/** The wrap every page sits in: the 1280px column with dotted rules down each side. */
export function Page({ children }: { children: ReactNode }) {
  if (isRegistry(usePathname())) return children;
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
  { label: "Docs", href: DOCS_HREF },
];

/**
 * The top bar. It lives in the root layout so it stays mounted across pages, which lets the
 * Home / Docs liquid indicator travel between tabs as the page changes.
 */
export function SiteNav() {
  const pathname = usePathname();
  if (isRegistry(pathname)) return null;
  return <SiteNavBar pathname={pathname} />;
}

function SiteNavBar({ pathname }: { pathname: string }) {
  const router = useRouter();
  const current = pathname.startsWith("/docs") ? 1 : 0;
  // Moves the indicator at once; the route catches up, and back/forward bring it along too.
  const [tab, setTab] = useState(current);
  const [shown, setShown] = useState(current);
  if (current !== shown) {
    setShown(current);
    setTab(current);
  }

  useEffect(() => router.prefetch(DOCS_HREF), [router]);

  return (
    <header className="nav row-12">
      <div className="brand">
        <LogoLink />
      </div>
      <div className="nav-note">An open component system for developer sites</div>
      <div className="nav-links">
        <LiquidTabs
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
