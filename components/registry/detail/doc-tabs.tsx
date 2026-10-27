import Link from "next/link";
import type { ReactNode } from "react";
import { highlight } from "@/components/site/highlight";
import {
  importPathOf,
  INTERACTIONS,
  interactionHref,
  type Interaction,
} from "@/content/interactions";
import { A11Y_NOTES, DESIGN_NOTES } from "@/content/interactions/notes";
import { COLLECTIONS } from "@/content/interactions/types";
import { recipesUsing } from "@/content/recipes";
import { queryString } from "@/lib/registry/query";
import { BROWSE } from "../shell/links";
import { categoryLabel, Tag } from "../ui/badges";
import { CodeView } from "../ui/code-view";
import { Tabs, type TabItem } from "../ui/tabs";

/** Overview, Usage, API, Examples, Accessibility and Design notes: each only when it has something true to say. */
export function DocTabs({ item }: { item: Interaction }) {
  const recipes = recipesUsing(item.slug);
  const related = INTERACTIONS.filter(
    (i) => i.slug !== item.slug && i.categories[0] === item.categories[0],
  ).slice(0, 4);
  const usage = `import { ${item.exportName} } from "${importPathOf(item)}"\n\n<${item.exportName}\n${item.doc.usage}\n/>`;

  const tabs: (TabItem | false)[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[140px_1fr]">
          <Row term="What it does">{item.description}</Row>
          <Row term="Purpose">
            {item.categories.map((c, i) => (
              <span key={c}>
                {i > 0 && ", "}
                <Link
                  href={`${BROWSE}${queryString({ category: c })}`}
                  className="text-snow underline decoration-seam-2 underline-offset-4 hover:decoration-snow"
                >
                  {categoryLabel(c)}
                </Link>
              </span>
            ))}
          </Row>
          <Row term="Tags">
            <span className="flex flex-wrap gap-3">
              {item.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </span>
          </Row>
          <Row term="Collections">
            {[
              ...item.collections.map((c) => COLLECTIONS.find((x) => x.id === c)!.label),
              ...(item.isNew ? ["New this month"] : []),
            ].join(", ")}
          </Row>
          {item.styles && (
            <Row term="Styles">
              Minimal by default, with Craft, Retro and Toy behind the variant prop.
            </Row>
          )}
          <Row term="Added">
            {new Date(`${item.added}T00:00:00Z`).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </Row>
        </dl>
      ),
    },
    {
      id: "usage",
      label: "Usage",
      content: <CodeView code={usage} html={highlight(usage)} title="The minimal example" />,
    },
    {
      id: "api",
      label: "API",
      content: <PropsTable props={item.doc.props} />,
    },
    (recipes.length > 0 || related.length > 0) && {
      id: "examples",
      label: "Examples",
      content: (
        <div className="flex flex-col gap-6">
          {recipes.length > 0 && (
            <LinkList
              title="Recipes that use it"
              links={recipes.map((r) => ({
                href: `/registry/recipes/${r.slug}`,
                label: r.name,
                note: r.summary,
              }))}
            />
          )}
          {related.length > 0 && (
            <LinkList
              title={`More ${categoryLabel(item.categories[0]).toLowerCase()}`}
              links={related.map((r) => ({
                href: interactionHref(r.slug),
                label: r.name,
                note: r.description,
              }))}
            />
          )}
        </div>
      ),
    },
    !!A11Y_NOTES[item.slug] && {
      id: "a11y",
      label: "Accessibility",
      content: <Notes items={A11Y_NOTES[item.slug]} />,
    },
    {
      id: "design",
      label: "Design notes",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-mist">
            <span className="text-snow">Built with</span> {item.tech}.
          </p>
          {DESIGN_NOTES[item.slug] && <Notes items={DESIGN_NOTES[item.slug]} />}
        </div>
      ),
    },
  ];

  return <Tabs label="Documentation" tabs={tabs.filter(Boolean) as TabItem[]} />;
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-[13px] text-haze">{term}</dt>
      <dd className="m-0 text-sm text-mist">{children}</dd>
    </>
  );
}

function Notes({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((n) => (
        <li key={n} className="flex gap-3 text-sm leading-relaxed text-mist">
          <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-violet" />
          {n}
        </li>
      ))}
    </ul>
  );
}

function LinkList({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; note: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[13px] text-haze">{title}</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex h-full flex-col gap-1 rounded-xl border border-seam p-3 transition-colors hover:border-seam-2"
            >
              <span className="text-sm text-snow">{l.label}</span>
              <span className="line-clamp-2 text-xs text-haze">{l.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PropsTable({ props }: { props: Interaction["doc"]["props"] }) {
  return (
    <div className="reg-scroll overflow-x-auto rounded-xl border border-seam">
      <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-seam text-xs text-haze">
            <th className="px-3 py-2 font-normal">Prop</th>
            <th className="px-3 py-2 font-normal">Type</th>
            <th className="px-3 py-2 font-normal">Default</th>
            <th className="px-3 py-2 font-normal">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name} className="border-b border-seam last:border-0 align-top">
              <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap text-snow">
                {p.name}
              </td>
              <td className="max-w-[260px] px-3 py-2.5 font-mono text-[11.5px] break-words text-cyan">
                {p.type}
              </td>
              <td className="px-3 py-2.5 font-mono text-xs text-mist">{p.default ?? "–"}</td>
              <td className="px-3 py-2.5 text-mist">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
