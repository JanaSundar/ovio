"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { INTERACTIONS } from "@/content/interactions";
import { CATEGORIES, COLLECTIONS, type PlatformFilter } from "@/content/interactions/types";
import {
  DEFAULT_QUERY,
  queryString,
  registryCounts,
  type RegistryQuery,
} from "@/lib/registry/query";
import { cn } from "@/lib/utils";
import { BROWSE } from "./links";
import { useRegistryQuery } from "./use-registry-query";

const COUNTS = registryCounts(INTERACTIONS);

const PLATFORM_LINKS: { id: Exclude<PlatformFilter, "all">; label: string }[] = [
  { id: "web", label: "Web (React)" },
  { id: "native", label: "React Native (Expo)" },
  { id: "both", label: "Both platforms" },
];

/** The discovery index, marking the filter the list is showing. */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { query, pathname } = useRegistryQuery();
  return <SidebarView query={query} pathname={pathname} onNavigate={onNavigate} />;
}

/**
 * The discovery index: purposes, platforms and collections, each with its live count. Rendered on
 * the server with no filter marked, then marked once the URL's query is known.
 */
export function SidebarView({
  query = DEFAULT_QUERY,
  pathname = "",
  onNavigate,
}: {
  query?: RegistryQuery;
  pathname?: string;
  onNavigate?: () => void;
}) {
  const onList = pathname === BROWSE;
  /** Current when the list is showing exactly this filter. */
  const current = (patch: Partial<RegistryQuery>) =>
    onList &&
    queryString({ ...query, q: "", sort: "recommended" }) ===
      queryString({ platform: query.platform, ...patch });
  const href = (patch: Partial<RegistryQuery>) =>
    `${BROWSE}${queryString({ platform: query.platform, ...patch })}`;

  const item = (key: string, label: string, count: number, patch: Partial<RegistryQuery>) => (
    <SidebarLink
      key={key}
      href={href(patch)}
      active={current(patch)}
      count={count}
      onNavigate={onNavigate}
    >
      {label}
    </SidebarLink>
  );

  return (
    <nav aria-label="Registry" className="flex flex-col gap-6 px-3 py-5 text-sm">
      <Section title="Discover">
        {item("all", "All interactions", COUNTS.all, {})}
        {CATEGORIES.map((c) => item(c.id, c.label, COUNTS.categories[c.id], { category: c.id }))}
      </Section>
      <Section title="Platform">
        {PLATFORM_LINKS.map((p) => (
          <SidebarLink
            key={p.id}
            href={`${BROWSE}${queryString({ platform: p.id })}`}
            active={
              onList &&
              queryString({ ...query, q: "", sort: "recommended" }) ===
                queryString({ platform: p.id })
            }
            count={COUNTS.platforms[p.id]}
            onNavigate={onNavigate}
          >
            {p.label}
          </SidebarLink>
        ))}
      </Section>
      <Section title="Collections">
        {COLLECTIONS.map((c) =>
          item(c.id, c.label, COUNTS.collections[c.id], { collection: c.id }),
        )}
      </Section>
      <p className="px-2 text-xs leading-relaxed text-haze">
        Every interaction is web only today. Expo versions are listed here once they exist.
      </p>
    </nav>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="mb-1.5 px-2 font-mono text-[10.5px] tracking-[0.14em] text-haze uppercase">
        {title}
      </h2>
      {children}
    </div>
  );
}

function SidebarLink({
  href,
  active,
  count,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  count: number;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      prefetch={false}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 items-center justify-between gap-2 rounded-md px-2 transition-colors",
        active ? "bg-white/[0.06] text-snow" : "text-mist hover:bg-white/[0.03] hover:text-snow",
        count === 0 && !active && "text-haze",
      )}
    >
      <span className="truncate">{children}</span>
      <span className="font-mono text-[11px] text-haze tabular-nums">{count}</span>
    </Link>
  );
}
