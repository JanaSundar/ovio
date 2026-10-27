/** The interaction registry's vocabulary: platforms, purposes and collections. */

export type Platform = "web" | "native";

/** What the platform filter asks for. "both" means a component with both implementations. */
export type PlatformFilter = "all" | "web" | "native" | "both";

export const PLATFORM_LABEL: Record<Platform, string> = { web: "Web", native: "Expo" };

export const CATEGORIES = [
  { id: "direct-manipulation", label: "Direct manipulation", blurb: "Drag, turn and scrub." },
  { id: "contextual-actions", label: "Contextual actions", blurb: "Menus where the pointer is." },
  { id: "reveal-explore", label: "Reveal and explore", blurb: "Uncover what sits underneath." },
  { id: "navigation", label: "Navigation", blurb: "Move between views." },
  { id: "selection", label: "Selection", blurb: "Pick a value or a range." },
  { id: "feedback", label: "Feedback", blurb: "Confirm what just happened." },
  { id: "data-visualization", label: "Data visualization", blurb: "Activity, growth and size." },
  { id: "surfaces-layout", label: "Surfaces and layout", blurb: "Cards, walls and documents." },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const COLLECTIONS = [
  { id: "essential", label: "Essential kit" },
  { id: "developer-tools", label: "Developer tools" },
  { id: "showcase", label: "Showcase" },
  { id: "new", label: "New this month" },
] as const;

export type CollectionId = (typeof COLLECTIONS)[number]["id"];

/** How a component reaches a project. */
export type Distribution =
  /** Published to the shadcn registry: `npx shadcn add` installs it. */
  | { kind: "registry" }
  /** In this repository only, not yet a registry item: copy its files. */
  | { kind: "source"; files: string[]; dependencies: string[] };

export interface InteractionDefinition {
  slug: string;
  name: string;
  description: string;
  /** Exported component name, for usage snippets. */
  exportName: string;
  /** First category is the primary one, printed on cards. */
  categories: CategoryId[];
  tags: string[];
  /** Implementations that exist and render. Never a planned one. */
  platforms: Platform[];
  /** Hand-picked collections; "new this month" is derived from `added`. */
  collections: Exclude<CollectionId, "new">[];
  featured?: boolean;
  /** Recently added; also makes up the "New this month" collection. */
  isNew: boolean;
  /** When it joined the registry, YYYY-MM-DD, from the commit that added it. */
  added: string;
  /** Editorial order for the Recommended sort: lower comes first. */
  rank: number;
  /** Has the four Ovio styles (Minimal, Craft, Retro, Toy) behind its `variant` prop. */
  styles: boolean;
  distribution: Distribution;
  /** What the component is drawn with. */
  tech: string;
}
