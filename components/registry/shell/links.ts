import { DOCS_HREF } from "@/content/components";

export const REGISTRY_HOME = "/registry";
export const BROWSE = "/registry/components";

/** The top navigation. `match` decides which entry is current for a path. */
export const NAV = [
  { label: "Explore", href: REGISTRY_HOME, match: (p: string) => p === REGISTRY_HOME },
  { label: "Components", href: BROWSE, match: (p: string) => p.startsWith(BROWSE) },
  {
    label: "Recipes",
    href: "/registry/recipes",
    match: (p: string) => p.startsWith("/registry/recipes"),
  },
  {
    label: "Playground",
    href: "/registry/playground",
    match: (p: string) => p.startsWith("/registry/playground"),
  },
  { label: "Docs", href: DOCS_HREF, match: () => false },
] as const;

/** Pages whose list the platform and sidebar filters narrow in place. */
export const isBrowsePage = (pathname: string) => pathname === REGISTRY_HOME || pathname === BROWSE;
