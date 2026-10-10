import { describe, expect, it } from "vitest";
import { CATALOG, groupedCatalog } from "@/content/catalog";
import { COMPONENTS } from "@/content/components";
import { RECIPES } from "@/content/recipes";

describe("catalog", () => {
  it("covers every component exactly once", () => {
    const slugs = COMPONENTS.map((c) => c.slug).sort();
    expect(Object.keys(CATALOG).sort()).toEqual(slugs);
    expect(
      groupedCatalog()
        .flatMap((g) => g.items.map((i) => i.slug))
        .sort(),
    ).toEqual(slugs);
  });
});

describe("recipes", () => {
  it("only compose components that exist", () => {
    const slugs = new Set(COMPONENTS.map((c) => c.slug));
    for (const recipe of RECIPES) {
      expect(recipe.slugs.length).toBeGreaterThan(1);
      for (const slug of recipe.slugs) expect(slugs.has(slug)).toBe(true);
    }
  });
});
