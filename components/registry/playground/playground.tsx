"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getInteraction, INTERACTIONS, interactionHref } from "@/content/interactions";
import { CATEGORIES } from "@/content/interactions/types";
import { Workbench } from "../detail/workbench";

const FIRST = INTERACTIONS[0].slug;

/** One interaction at a time, picked from the list and remembered in the URL. */
export function Playground({ initial = FIRST }: { initial?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requested = params.get("c") ?? initial;
  const slug = getInteraction(requested) ? requested : FIRST;
  const item = getInteraction(slug)!;

  const picker = (
    <label className="flex items-center gap-2">
      <span className="sr-only">Interaction</span>
      <select
        value={slug}
        onChange={(e) => router.replace(`${pathname}?c=${e.target.value}`, { scroll: false })}
        className="h-7 max-w-52 rounded-md border border-seam bg-void px-2 text-[13px] text-snow focus:outline-none"
      >
        {CATEGORIES.map((c) => {
          const members = INTERACTIONS.filter((i) => i.categories[0] === c.id);
          return members.length ? (
            <optgroup key={c.id} label={c.label}>
              {members.map((i) => (
                <option key={i.slug} value={i.slug}>
                  {i.name}
                </option>
              ))}
            </optgroup>
          ) : null;
        })}
      </select>
    </label>
  );

  return (
    <div className="flex flex-col gap-4">
      {requested !== slug && (
        <p role="alert" className="rounded-lg border border-seam px-3 py-2 text-sm text-mist">
          There is no interaction called “{requested.slice(0, 40)}”, so the playground opened{" "}
          {item.name}.
        </p>
      )}
      <Workbench key={slug} slug={slug} toolbarStart={picker} />
      <p className="text-xs text-haze">
        {item.description}{" "}
        <Link
          href={interactionHref(slug)}
          className="text-mist underline decoration-seam-2 underline-offset-4 hover:text-snow"
        >
          Docs and installation
        </Link>
      </p>
    </div>
  );
}
