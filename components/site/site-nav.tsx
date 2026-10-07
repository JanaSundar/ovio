"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoLink } from "./logo";

export const GITHUB_URL = "https://github.com/JanaSundar/ovio";

export function SiteNav() {
  const pathname = usePathname();
  const inDocs = pathname.startsWith("/docs");

  return (
    <nav className="flex flex-wrap items-center justify-between gap-6 border-b border-line py-[22px]">
      <LogoLink />
      <div className="flex flex-wrap gap-7 text-sm text-muted">
        <Link href="/#styles" className="hover:text-ink">
          Styles
        </Link>
        <Link href="/#about" className="hover:text-ink">
          About
        </Link>
        <Link
          href="/docs"
          className={cn("hover:text-ink", inDocs && "font-medium text-ink")}
          aria-current={inDocs ? "page" : undefined}
        >
          Docs
        </Link>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-ink">
          GitHub ↗
        </a>
      </div>
      <span className="font-mono text-xs text-muted">v0.1 · MIT</span>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap justify-between gap-4 border-t border-line pt-7 pb-10 text-[13px] text-muted">
      <span>One component. Four worlds.</span>
      <span>MIT · Built on the shadcn registry</span>
    </footer>
  );
}
