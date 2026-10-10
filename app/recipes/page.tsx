import type { Metadata } from "next";
import { highlight } from "@/components/site/highlight";
import { RecipeBoard } from "@/components/site/recipe-board";
import { SiteFooter } from "@/components/site/site-nav";
import { RECIPES } from "@/content/recipes";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Ready-made layouts built from Ovio components: a project page, a portfolio header, and a release desk.",
};

export default function RecipesPage() {
  const recipes = RECIPES.map((recipe) => ({ ...recipe, html: highlight(recipe.code) }));
  return (
    <>
      <RecipeBoard recipes={recipes} />
      <SiteFooter note="Compose the components you already own." />
    </>
  );
}
