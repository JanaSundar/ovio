"use client";

import Link from "next/link";
import { getComponent } from "@/content/components";
import { recipeInstall, type Recipe } from "@/content/recipes";
import { CodeBlock } from "./code-block";
import { CopyCommand } from "./copy-command";
import { Demo, DEMOS } from "./demos";
import { PreviewFrame } from "./preview-frame";
import { WorldSwitcher } from "./world-switcher";

/** A recipe with its usage snippet already highlighted on the server. */
export type RecipeView = Recipe & { html: string };

/** Three compositions of the existing components, live, in the site's current world. */
export function RecipeBoard({ recipes }: { recipes: RecipeView[] }) {
  return (
    <main id="recipes">
      <section className="page-intro row-12">
        <aside className="intro-index">
          <span className="status">
            <i /> Recipes
          </span>
          <span className="world-count">
            <b>Compose</b>
            {recipes.length} layouts
            <br />
            Same components
            <br />
            you already have
          </span>
        </aside>
        <div className="intro-main">
          <div>
            <p className="eyebrow">Copy, then make it yours</p>
            <h1>
              Pages, not
              <br />
              <em>just parts.</em>
            </h1>
          </div>
          <div className="intro-bottom">
            <p className="intro-copy">
              <strong>Drop a few components into a layout you already need.</strong> The world
              switcher restyles every piece together.
            </p>
            <Link className="inline-link" href="/gallery">
              Browse the gallery ↘
            </Link>
          </div>
        </div>
        <aside className="intro-side gallery-switch">
          <span className="side-caption">
            <b>The world</b>
            One switch for the page
          </span>
          <WorldSwitcher />
        </aside>
      </section>

      {recipes.map((recipe, index) => (
        <section key={recipe.slug} className="recipe" id={recipe.slug}>
          <header className="recipe-head row-12">
            <p className="eyebrow">Recipe 0{index + 1}</p>
            <div>
              <h2>{recipe.name}</h2>
              <p>{recipe.pitch}</p>
              <small>{recipe.fits}</small>
            </div>
            <ul>
              {recipe.slugs.map((slug) => (
                <li key={slug}>
                  <Link href={`/docs/${slug}`}>{getComponent(slug)?.name ?? slug}</Link>
                </li>
              ))}
            </ul>
          </header>
          <div className="recipe-grid">
            {recipe.slugs.map((slug) => (
              <PreviewFrame key={slug} minHeight={Math.min(DEMOS[slug]?.minHeight ?? 360, 440)}>
                <Demo slug={slug} />
              </PreviewFrame>
            ))}
          </div>
          <div className="recipe-install">
            <CopyCommand command={recipeInstall(recipe.slugs)} variant="install-box" />
          </div>
          <CodeBlock html={recipe.html} />
        </section>
      ))}
    </main>
  );
}
