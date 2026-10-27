/** Recipes: interactions combined into a section of a real page, with their source in components/registry/recipes/. */

export type Recipe = {
  slug: string;
  name: string;
  summary: string;
  /** When it earns its place on a page. */
  when: string;
  /** The interactions it combines, in the order they appear. */
  uses: string[];
  /** Ways to make it your own, each naming the prop or file to change. */
  customize: string[];
};

export const RECIPES: Recipe[] = [
  {
    slug: "repository-activity",
    name: "Repository activity section",
    summary:
      "A project's pulse in one section: the repo card, its star curve, a year of commits and the people behind it.",
    when: "Open-source landing pages and READMEs-turned-websites, where proof of life matters more than a feature list.",
    uses: ["repository-card", "star-history", "contribution-graph", "top-contributors"],
    customize: [
      "Swap the samples for real data: lib/github.ts has getRepository, getContributions and getContributors.",
      "Set variant on all four (or wrap them in OvioProvider) to change the style together.",
      "Drop compactMonths to show the whole year on small screens.",
    ],
  },
  {
    slug: "contextual-actions",
    name: "Contextual actions system",
    summary:
      "One set of actions reachable three ways: a list menu on right-click, a radial dial on a button, and a toast confirming whatever ran.",
    when: "Dashboards and file browsers where power users right-click and everyone else needs a visible button.",
    uses: ["context-menu", "dial-menu", "toast"],
    customize: [
      "Define actions once (the ACTIONS array) and both menus read from it.",
      "Change what runs in the run() function; each action already reports back through ovioToast.",
      "Move the toaster with OvioToaster's position prop.",
    ],
  },
  {
    slug: "launch-announcement",
    name: "Event announcement",
    summary:
      "A launch page section: the ticket to book, a sticker hiding the early-access code, and quotes from the last event.",
    when: "Conference, meetup or product-launch pages that should feel like an invitation rather than a form.",
    uses: ["event-ticket", "peel-to-reveal", "testimonials"],
    customize: [
      "Point onBook at your booking endpoint; it awaits the promise before stamping the ticket.",
      "Reveal the code only after booking by passing peeled and disabled to PeelToReveal.",
      "Set interval={0} on Testimonials to stop autoplay.",
    ],
  },
];

export const getRecipe = (slug: string) => RECIPES.find((r) => r.slug === slug);

export const recipesUsing = (slug: string) => RECIPES.filter((r) => r.uses.includes(slug));

/** The recipe's source, which its page shows and you copy. */
export const recipeFile = (slug: string) => `components/registry/recipes/${slug}.tsx`;
