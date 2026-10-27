import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocTabs } from "@/components/registry/detail/doc-tabs";
import { InstallPanel } from "@/components/registry/detail/install-panel";
import { Workbench } from "@/components/registry/detail/workbench";
import { BROWSE } from "@/components/registry/shell/links";
import { categoryLabel, Marker, PlatformBadges, Tag } from "@/components/registry/ui/badges";
import { CopyLink } from "@/components/registry/ui/copy-link";
import { getInteraction, INTERACTIONS } from "@/content/interactions";
import { installInfo } from "@/lib/registry/install";
import { queryString } from "@/lib/registry/query";

export const dynamicParams = false;

export function generateStaticParams() {
  return INTERACTIONS.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/registry/components/[slug]">): Promise<Metadata> {
  const item = getInteraction((await params).slug);
  if (!item) return {};
  return {
    title: item.name,
    description: item.description,
    alternates: { canonical: `/registry/components/${item.slug}` },
  };
}

export default async function InteractionPage({
  params,
}: PageProps<"/registry/components/[slug]">) {
  const item = getInteraction((await params).slug);
  if (!item) notFound();
  const install = await installInfo(item);
  const primary = item.categories[0];

  return (
    <article className="flex flex-col gap-8 px-5 py-6 sm:px-8">
      <header className="flex flex-col gap-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-haze">
            <li>
              <Link href={BROWSE} className="hover:text-snow">
                Components
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`${BROWSE}${queryString({ category: primary })}`}
                className="hover:text-snow"
              >
                {categoryLabel(primary)}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-mist">
              {item.name}
            </li>
          </ol>
        </nav>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] leading-tight font-medium tracking-[-0.02em] break-words sm:text-[32px]">
                {item.name}
              </h1>
              {item.isNew ? (
                <Marker tone="signal">New</Marker>
              ) : (
                item.featured && <Marker tone="violet">Featured</Marker>
              )}
            </div>
            <p className="text-[15px] leading-relaxed text-mist">{item.description}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <PlatformBadges platforms={item.platforms} />
              <span className="text-xs text-mist">
                {item.categories.map(categoryLabel).join(" · ")}
              </span>
              <span className="flex gap-3">
                {item.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </span>
            </div>
          </div>
          <CopyLink />
        </div>
      </header>

      <section aria-label="Interactive preview">
        <Workbench key={item.slug} slug={item.slug} />
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-label="Documentation" className="min-w-0">
          <DocTabs item={item} />
        </section>
        <section
          aria-labelledby="install-title"
          className="min-w-0 xl:border-l xl:border-seam xl:pl-8"
        >
          <h2 id="install-title" className="mb-4 text-base font-medium">
            Installation
          </h2>
          <InstallPanel info={install} />
        </section>
      </div>
    </article>
  );
}
