"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPONENTS } from "@/content/components";
import { cn } from "@/lib/utils";

function Item({
  href,
  active,
  children,
  tag,
}: {
  href: string;
  active: boolean;
  children: string;
  tag?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "-mx-2.5 flex items-baseline justify-between rounded-md px-2.5 py-1.5 hover:text-ink",
        active ? "bg-paper-2 text-ink" : "text-ink-2",
      )}
    >
      {children}
      {tag && <span className="font-mono text-[10px] text-faint">{tag}</span>}
    </Link>
  );
}

function Groups({ pathname }: { pathname: string }) {
  return (
    <>
      <div className="flex flex-col gap-0.5">
        <div className="mb-2 text-[11px] tracking-[0.12em] text-muted uppercase">
          Getting started
        </div>
        <Item href="/docs" active={pathname === "/docs"}>
          Introduction
        </Item>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="mb-2 text-[11px] tracking-[0.12em] text-muted uppercase">Components</div>
        {COMPONENTS.map((c) => (
          <Item
            key={c.slug}
            href={`/docs/${c.slug}`}
            active={pathname === `/docs/${c.slug}`}
            tag={c.tag}
          >
            {c.name}
          </Item>
        ))}
      </div>
    </>
  );
}

export function DocsSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-6 hidden flex-col gap-7 text-sm docs:flex">
      <Groups pathname={pathname} />
    </aside>
  );
}

/** Below 820px the sidebar folds into a menu at the top of the page. */
export function DocsMobileNav() {
  const pathname = usePathname();
  const current = COMPONENTS.find((c) => pathname === `/docs/${c.slug}`)?.name ?? "Introduction";
  return (
    <details
      key={pathname}
      className="group rounded-[10px] border border-line bg-white/50 text-sm docs:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
        <span>
          <span className="text-muted">Docs / </span>
          {current}
        </span>
        <span aria-hidden className="text-muted transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="flex flex-col gap-6 border-t border-line px-4 py-4">
        <Groups pathname={pathname} />
      </div>
    </details>
  );
}
