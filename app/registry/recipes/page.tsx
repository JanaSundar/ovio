import Link from "next/link";
import { getInteraction } from "@/content/interactions";
import { RECIPES } from "@/content/recipes";

export const metadata = { title: "Recipes" };

export default function RecipesPage() {
  return (
    <section aria-labelledby="recipes-title" className="flex flex-col gap-6 px-5 py-8 sm:px-8">
      <div className="flex max-w-2xl flex-col gap-1.5">
        <h1 id="recipes-title" className="text-2xl font-medium tracking-[-0.02em]">
          Recipes
        </h1>
        <p className="text-sm text-mist">
          Interactions combined into a working section of a page, with the source to copy and the
          steps to install what it uses.
        </p>
      </div>
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {RECIPES.map((r) => (
          <li key={r.slug} className="flex">
            <Link
              href={`/registry/recipes/${r.slug}`}
              className="flex flex-1 flex-col gap-3 rounded-2xl border border-seam bg-deck p-5 transition-colors hover:border-seam-2"
            >
              <span className="font-mono text-[11px] tracking-[0.12em] text-haze uppercase">
                {r.uses.length} interactions · Web
              </span>
              <span className="text-[17px] font-medium tracking-[-0.01em]">{r.name}</span>
              <span className="text-sm leading-relaxed text-mist">{r.summary}</span>
              <span className="mt-auto flex flex-wrap gap-1.5 pt-2">
                {r.uses.map((u) => (
                  <span
                    key={u}
                    className="rounded-md border border-seam px-1.5 py-0.5 text-[11px] text-mist"
                  >
                    {getInteraction(u)?.name}
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
