import {
  CATEGORIES,
  COLLECTIONS,
  PLATFORM_LABEL,
  type CategoryId,
  type CollectionId,
  type InteractionDefinition,
  type PlatformFilter,
} from "@/content/interactions/types";

/** Search, filtering, sorting and counts over the registry: pure, so pages and tests share them. */

export type Sort = "recommended" | "newest" | "name";
export type Highlight = "all" | "featured" | "new";

export type RegistryQuery = {
  q: string;
  platform: PlatformFilter;
  category: CategoryId | null;
  collection: CollectionId | null;
  highlight: Highlight;
  sort: Sort;
};

export const DEFAULT_QUERY: RegistryQuery = {
  q: "",
  platform: "all",
  category: null,
  collection: null,
  highlight: "all",
  sort: "recommended",
};

const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

/** Every word in the query appears somewhere in the name, description, categories, tags or platforms. */
export function matchesSearch(item: InteractionDefinition, q: string): boolean {
  const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = [
    item.name,
    item.description,
    ...item.categories.map(categoryLabel),
    ...item.tags,
    ...item.platforms.flatMap((p) => [p, PLATFORM_LABEL[p]]),
  ]
    .join(" ")
    .toLowerCase();
  return words.every((w) => haystack.includes(w));
}

export function matchesPlatform(item: InteractionDefinition, platform: PlatformFilter): boolean {
  if (platform === "all") return true;
  if (platform === "both")
    return item.platforms.includes("web") && item.platforms.includes("native");
  return item.platforms.includes(platform);
}

export function inCollection(item: InteractionDefinition, collection: CollectionId): boolean {
  return collection === "new" ? item.isNew : item.collections.includes(collection);
}

const byName = (a: InteractionDefinition, b: InteractionDefinition) => a.name.localeCompare(b.name);

const SORTS: Record<Sort, (a: InteractionDefinition, b: InteractionDefinition) => number> = {
  recommended: (a, b) => a.rank - b.rank,
  newest: (a, b) => b.added.localeCompare(a.added) || a.rank - b.rank,
  name: byName,
};

export function queryRegistry<T extends InteractionDefinition>(
  items: T[],
  query: RegistryQuery,
): T[] {
  return items
    .filter(
      (i) =>
        matchesSearch(i, query.q) &&
        matchesPlatform(i, query.platform) &&
        (!query.category || i.categories.includes(query.category)) &&
        (!query.collection || inCollection(i, query.collection)) &&
        (query.highlight !== "featured" || i.featured) &&
        (query.highlight !== "new" || i.isNew),
    )
    .sort(SORTS[query.sort]);
}

/** How many items each category, platform and collection holds, for the sidebar. */
export function registryCounts(items: InteractionDefinition[]) {
  const count = (test: (i: InteractionDefinition) => boolean) => items.filter(test).length;
  return {
    all: items.length,
    categories: Object.fromEntries(
      CATEGORIES.map((c) => [c.id, count((i) => i.categories.includes(c.id))]),
    ) as Record<CategoryId, number>,
    platforms: {
      web: count((i) => matchesPlatform(i, "web")),
      native: count((i) => matchesPlatform(i, "native")),
      both: count((i) => matchesPlatform(i, "both")),
    },
    collections: Object.fromEntries(
      COLLECTIONS.map((c) => [c.id, count((i) => inCollection(i, c.id))]),
    ) as Record<CollectionId, number>,
  };
}

const PLATFORMS: PlatformFilter[] = ["all", "web", "native", "both"];
const SORT_IDS: Sort[] = ["recommended", "newest", "name"];
const HIGHLIGHTS: Highlight[] = ["all", "featured", "new"];

const pick = <T extends string>(options: readonly T[], value: string | null, fallback: T): T =>
  value && (options as readonly string[]).includes(value) ? (value as T) : fallback;

/** A query from URL search params, ignoring anything it doesn't recognise. */
export function parseQuery(params: { get(name: string): string | null }): RegistryQuery {
  return {
    q: (params.get("q") ?? "").slice(0, 80),
    platform: pick(PLATFORMS, params.get("platform"), "all"),
    category:
      pick<CategoryId | "">(
        CATEGORIES.map((c) => c.id),
        params.get("category"),
        "",
      ) || null,
    collection:
      pick<CollectionId | "">(
        COLLECTIONS.map((c) => c.id),
        params.get("collection"),
        "",
      ) || null,
    highlight: pick(HIGHLIGHTS, params.get("show"), "all"),
    sort: pick(SORT_IDS, params.get("sort"), "recommended"),
  };
}

/** The query as search params, leaving defaults out so URLs stay short. */
export function queryString(query: Partial<RegistryQuery>): string {
  const full = { ...DEFAULT_QUERY, ...query };
  const params = new URLSearchParams();
  if (full.q.trim()) params.set("q", full.q.trim());
  if (full.platform !== "all") params.set("platform", full.platform);
  if (full.category) params.set("category", full.category);
  if (full.collection) params.set("collection", full.collection);
  if (full.highlight !== "all") params.set("show", full.highlight);
  if (full.sort !== "recommended") params.set("sort", full.sort);
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Whether anything narrows the list, for the reset control. */
export const isFiltered = (q: RegistryQuery) => queryString({ ...q, sort: "recommended" }) !== "";
