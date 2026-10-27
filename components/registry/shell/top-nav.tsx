"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useRef } from "react";
import { OvioMark } from "@/components/site/logo";
import { GITHUB_URL } from "@/content/components";
import { cn } from "@/lib/utils";
import { NAV, REGISTRY_HOME } from "./links";
import { PlatformButtons, PlatformSelect } from "./platform-select";
import { RegistrySearch } from "./search";
import { Sidebar, SidebarView } from "./sidebar";

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-seam bg-void/85 px-4 backdrop-blur-md sm:px-5">
      <MobileMenu pathname={pathname} />
      <Link href={REGISTRY_HOME} className="flex shrink-0 items-center gap-2.5">
        <OvioMark size={24} />
        <span className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold tracking-[-0.01em]">Ovio</span>
          <span className="hidden text-xs text-haze xl:inline">The interaction registry</span>
        </span>
      </Link>
      <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
        {NAV.map((n) => (
          <Link
            key={n.label}
            href={n.href}
            aria-current={n.match(pathname) ? "page" : undefined}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
              n.match(pathname) ? "text-snow" : "text-haze hover:text-snow",
            )}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <RegistrySearch className="hidden w-56 md:block xl:w-64" />
        <Suspense fallback={<PlatformButtons className="hidden sm:flex" />}>
          <PlatformSelect className="hidden sm:flex" />
        </Suspense>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Ovio on GitHub"
          className="grid size-9 place-items-center rounded-lg text-haze transition-colors hover:text-snow"
        >
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
}

/** Below the large breakpoint the sidebar and the page links move into a modal drawer. */
function MobileMenu({ pathname }: { pathname: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className="-ml-1 grid size-9 place-items-center rounded-lg text-mist hover:text-snow lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {/* A click on the backdrop closes it; Escape already does, natively. */}
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialog}
        aria-label="Menu"
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-0 h-dvh max-h-none w-[min(20rem,88vw)] border-r border-seam bg-deck p-0 text-snow backdrop:bg-black/60"
      >
        <div className="flex h-full flex-col overflow-y-auto" data-lenis-prevent>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-seam px-4">
            <span className="text-sm font-semibold">Ovio</span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="grid size-9 place-items-center rounded-lg text-mist hover:text-snow"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-3 border-b border-seam p-4">
            <RegistrySearch />
            <Suspense fallback={<PlatformButtons className="self-start" />}>
              <PlatformSelect className="self-start" />
            </Suspense>
          </div>
          <nav aria-label="Main" className="flex flex-col gap-0.5 border-b border-seam p-3">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={close}
                aria-current={n.match(pathname) ? "page" : undefined}
                className={cn(
                  "rounded-md px-2 py-2 text-sm",
                  n.match(pathname) ? "bg-white/[0.06] text-snow" : "text-mist",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Suspense fallback={<SidebarView onNavigate={close} />}>
            <Sidebar onNavigate={close} />
          </Suspense>
        </div>
      </dialog>
    </>
  );
}
