import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { RecipeStage } from "@/components/registry/recipes/stage";
import { PlatformBadges } from "@/components/registry/ui/badges";
import { CodeView } from "@/components/registry/ui/code-view";
import { CommandLine } from "@/components/registry/ui/copy-button";
import { REPO } from "@/content/components";
import { getInteraction, interactionHref, type Interaction } from "@/content/interactions";
import type { Platform } from "@/content/interactions/types";
import { getRecipe, recipeFile, RECIPES } from "@/content/recipes";
import { readSources } from "@/lib/registry/install";

export const dynamicParams = false;

export function generateStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/registry/recipes/[slug]">): Promise<Metadata> {
  const recipe = getRecipe((await params).slug);
  return recipe ? { title: recipe.name, description: recipe.summary } : {};
}

export default async function RecipePage({ params }: PageProps<"/registry/recipes/[slug]">) {
  const recipe = getRecipe((await params).slug);
  if (!recipe) notFound();
  const uses = recipe.uses.map((u) => getInteraction(u)!) as Interaction[];
  // A recipe runs where every interaction in it runs.
  const platforms = (["web", "native"] as Platform[]).filter((p) =>
    uses.every((u) => u.platforms.includes(p)),
  );
  const registry = uses.filter((u) => u.distribution.kind === "registry");
  const source = uses.filter((u) => u.distribution.kind === "source");
  const [file] = await readSources([recipeFile(recipe.slug)]);

  return (
    <article className="flex flex-col gap-8 px-5 py-6 sm:px-8">
      <header className="flex max-w-3xl flex-col gap-3">
        <nav aria-label="Breadcrumb" className="text-xs text-haze">
          <Link href="/registry/recipes" className="hover:text-snow">
            Recipes
          </Link>{" "}
          / <span className="text-mist">{recipe.name}</span>
        </nav>
        <h1 className="text-[28px] leading-tight font-medium tracking-[-0.02em]">{recipe.name}</h1>
        <p className="text-[15px] leading-relaxed text-mist">{recipe.summary}</p>
        <PlatformBadges platforms={platforms} />
      </header>

      <RecipeStage slug={recipe.slug} />

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Part title="When to use it">
            <p className="text-sm leading-relaxed text-mist">{recipe.when}</p>
          </Part>
          <Part title="What it combines">
            <ul className="grid gap-2 sm:grid-cols-2">
              {uses.map((u) => (
                <li key={u.slug}>
                  <Link
                    href={interactionHref(u.slug)}
                    className="flex h-full flex-col gap-1 rounded-xl border border-seam p-3 transition-colors hover:border-seam-2"
                  >
                    <span className="text-sm text-snow">{u.name}</span>
                    <span className="line-clamp-2 text-xs text-haze">{u.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Part>
          <Part title="Make it yours">
            <ul className="flex flex-col gap-2">
              {recipe.customize.map((c) => (
                <li key={c} className="flex gap-3 text-sm leading-relaxed text-mist">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-violet" />
                  {c}
                </li>
              ))}
            </ul>
          </Part>
          <Part title="Source">
            <CodeView code={file.code} html={file.html} title={file.path} />
          </Part>
        </div>
        <aside className="flex min-w-0 flex-col gap-4 xl:border-l xl:border-seam xl:pl-8">
          <h2 className="text-base font-medium">Installation</h2>
          <ol className="flex flex-col gap-5 text-sm text-mist">
            {registry.length > 0 && (
              <Step n={1} title="Add the registry components">
                <CommandLine
                  command={`npx shadcn add ${registry.map((u) => `${REPO}/${u.slug}`).join(" ")}`}
                />
              </Step>
            )}
            {source.length > 0 && (
              <Step n={registry.length ? 2 : 1} title="Copy the source-only interactions">
                <p>
                  {source.map((u, i) => (
                    <span key={u.slug}>
                      {i > 0 && ", "}
                      <Link
                        href={interactionHref(u.slug)}
                        className="text-snow underline decoration-seam-2 underline-offset-4"
                      >
                        {u.name}
                      </Link>
                    </span>
                  ))}{" "}
                  {source.length === 1 ? "isn't" : "aren't"} in the shadcn registry yet; each page
                  lists its files.
                </p>
              </Step>
            )}
            <Step
              n={(registry.length ? 1 : 0) + (source.length ? 1 : 0) + 1}
              title="Add the section"
            >
              <p>
                Save the source as <code className="text-snow">{file.path.split("/").pop()}</code>{" "}
                and render its export where the section belongs.
              </p>
            </Step>
          </ol>
        </aside>
      </div>
    </article>
  );
}

function Part({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-medium">{title}</h2>
      {children}
    </section>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-2">
      <span className="flex items-center gap-2 text-snow">
        <span className="font-mono text-xs text-violet">0{n}</span>
        {title}
      </span>
      {children}
    </li>
  );
}
