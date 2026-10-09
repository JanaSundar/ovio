import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { SourceFile } from "@/components/site/code-explorer";
import { ComponentPreview, MotionInfo, UsageSnippet } from "@/components/site/component-doc";
import { CopyCommand } from "@/components/site/copy-command";
import { formatType } from "@/components/site/format-type";
import { highlight } from "@/components/site/highlight";
import {
  COMPONENTS,
  getComponent,
  installCommand,
  type ComponentDoc,
  type DocSectionId,
} from "@/content/components";
import { DEMO_TARGETS, isLiveSlug, SAMPLE_ONLY } from "@/content/demo-sources";
import { registryItem } from "@/content/registry";
import { DEFAULT_REVALIDATE } from "@/lib/ovio-fetch";
import { WORLDS, type World } from "@/lib/world";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const c = getComponent((await params).slug);
  if (!c) return {};
  // Shares carry the component's own title and its own image, from app/og/[slug].
  const social = { title: `${c.name} · Ovio`, description: c.description };
  const image = `/og/${c.slug}`;
  return {
    title: c.name,
    description: c.description,
    openGraph: {
      type: "website",
      siteName: "Ovio",
      ...social,
      images: [{ url: image, width: 1200, height: 630, alt: `${c.name} — Ovio` }],
    },
    twitter: { card: "summary_large_image", ...social, images: [image] },
  };
}

/**
 * Reads and highlights a component's source for the Code tab, here on the server so no highlighter
 * ships for it. Scoped to components/ so tracing stays small.
 */
async function readSources(files: string[]): Promise<SourceFile[]> {
  return Promise.all(
    files.map(async (f) => ({
      path: f,
      html: highlight(
        await readFile(
          path.join(process.cwd(), "components", f.replace(/^components\//, "")),
          "utf8",
        ),
      ),
    })),
  );
}

/** The usage snippet for each world, highlighted here so no highlighter ships to the client. */
const usageSnippets = (c: ComponentDoc) =>
  Object.fromEntries(
    WORLDS.map((w) => [
      w,
      highlight(
        `import { ${c.exportName} } from "@/components/ovio/${c.slug}/${c.slug}"\n\n<${c.exportName}\n  variant="${w}"\n${c.usage}\n/>`,
      ),
    ]),
  ) as Record<World, string>;

const CACHING = `Cached for an hour by default (revalidate: ${DEFAULT_REVALIDATE}), so traffic adds no API calls. A failed refresh keeps serving the last good data, and a spent limit throws RateLimitError with the time it resets.`;

/** The Data table: the component's facts, how caching works, and what this page's demo shows. */
function dataRows(slug: string, data: NonNullable<ComponentDoc["data"]>): [string, string][] {
  const demo = isLiveSlug(slug)
    ? `Live data from ${DEMO_TARGETS[slug]}, through the same helper. If the API fails, the sample shows instead.`
    : slug in SAMPLE_ONLY
      ? `Sample data: ${SAMPLE_ONLY[slug as keyof typeof SAMPLE_ONLY]}.`
      : undefined;
  return [
    ["Source", data.source],
    ["Auth", data.auth],
    ["Limits", data.limits],
    ["Caching", data.caching ?? CACHING],
    ...(demo ? [["This demo", demo] as [string, string]] : []),
  ];
}

/** A section of the page; its id is one of DOC_SECTIONS, so the contents list always matches. */
function DocSection({ id, children }: { id: DocSectionId; children: ReactNode }) {
  return (
    <section className="doc-section" id={id}>
      {children}
    </section>
  );
}

export default async function ComponentPage({ params }: PageProps<"/docs/[slug]">) {
  const { slug } = await params;
  const i = COMPONENTS.findIndex((c) => c.slug === slug);
  if (i < 0) notFound();
  const c = COMPONENTS[i];
  const prev = COMPONENTS[(i - 1 + COMPONENTS.length) % COMPONENTS.length];
  const next = COMPONENTS[(i + 1) % COMPONENTS.length];
  const item = registryItem(c.slug);
  const files = await readSources(item.files);

  return (
    <>
      <article className="article">
        <DocSection id="preview">
          <ComponentPreview slug={c.slug} exportName={c.exportName} files={files} />
        </DocSection>

        <DocSection id="installation">
          <h2>Installation</h2>
          <p>
            Use the shadcn CLI to copy the component source and its dependencies into your own
            project. Installs{" "}
            {item.dependencies.map((d, k) => (
              <span key={d}>
                {k > 0 && (k === item.dependencies.length - 1 ? " and " : ", ")}
                <code>{d}</code>
              </span>
            ))}
            , plus the Ovio {item.registryDependencies.join(", ")} items.
          </p>
          <CopyCommand command={installCommand(c.slug)} variant="install-box" />
          <div className="callout">
            <i>↳</i>
            <span>
              <strong>You own the source.</strong> Ovio components arrive in your codebase so you
              can edit any part of their style, behavior, or data flow.
            </span>
          </div>
        </DocSection>

        <DocSection id="usage">
          <h2>Usage</h2>
          <p>
            Set the visual world on the component, or wrap the page in an OvioProvider to set a
            default for everything inside it.
          </p>
          <UsageSnippet html={usageSnippets(c)} />
          <MotionInfo tech={c.tech} />
        </DocSection>

        {c.data && (
          <DocSection id="data">
            <h2>Data</h2>
            <p>
              Fetch it on the server with <code>{c.data.helper}</code> and pass the result as props.
              The helper is <code>lib/{c.data.lib}.ts</code>, added with the CLI.
            </p>
            <CopyCommand command={installCommand(c.data.lib)} variant="install-box" />
            <div className="prop-scroll">
              <table className="prop-table data-table">
                <tbody>
                  {dataRows(c.slug, c.data).map(([label, text]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DocSection>
        )}

        <DocSection id="props">
          <h2>Props</h2>
          <p>Control the data, selected world, animation behavior, and callbacks.</p>
          <div className="prop-scroll">
            <table className="prop-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {c.props.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>{formatType(p.type)}</td>
                    <td>{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>

        <nav className="pager" aria-label="Components">
          <Link href={`/docs/${prev.slug}`}>
            ← Previous<b>{prev.name}</b>
          </Link>
          <Link href={`/docs/${next.slug}`}>
            Next →<b>{next.name}</b>
          </Link>
        </nav>
      </article>
    </>
  );
}
