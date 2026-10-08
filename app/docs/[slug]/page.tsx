import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { SourceFile } from "@/components/site/code-explorer";
import { ComponentPreview, MotionInfo, UsageSnippet } from "@/components/site/component-doc";
import { CopyCommand } from "@/components/site/copy-command";
import { DocsFab, DocsSidebar, DocsToc } from "@/components/site/docs-sidebar";
import { highlight } from "@/components/site/highlight";
import { COMPONENTS, getComponent, installCommand, type ComponentDoc } from "@/content/components";
import { registryItem } from "@/content/registry";
import { WORLDS, type World } from "@/lib/world";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const c = getComponent((await params).slug);
  return c ? { title: c.name, description: c.description } : {};
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

export default async function ComponentPage({ params }: PageProps<"/docs/[slug]">) {
  const { slug } = await params;
  const i = COMPONENTS.findIndex((c) => c.slug === slug);
  if (i < 0) notFound();
  const c = COMPONENTS[i];
  const prev = COMPONENTS[(i - 1 + COMPONENTS.length) % COMPONENTS.length];
  const next = COMPONENTS[(i + 1) % COMPONENTS.length];
  const item = registryItem(c.slug);
  const files = await readSources(item.files);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <section className="dochead row-12">
        <aside className="trail">
          <b>Docs / Components</b>
          {pad(i + 1)} / {pad(COMPONENTS.length)} <br />
          {c.name}
        </aside>
        <div className="head-main">
          <p className="eyebrow">Component reference</p>
          <h1>{c.name}</h1>
          <p>{c.description}</p>
        </div>
        <aside className="head-meta">
          <span className="meta-top">
            <b>Renderer</b>
            {c.tech}
          </span>
          <span className="doc-pill">4 WORLDS</span>
        </aside>
      </section>

      <div className="docs row-12">
        <DocsSidebar />
        <article className="article">
          <section className="doc-section" id="preview">
            <ComponentPreview slug={c.slug} exportName={c.exportName} files={files} />
          </section>

          <section className="doc-section" id="installation">
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
          </section>

          <section className="doc-section" id="usage">
            <h2>Usage</h2>
            <p>
              Set the visual world on the component, or wrap the page in an OvioProvider to set a
              default for everything inside it.
            </p>
            <UsageSnippet html={usageSnippets(c)} />
            <MotionInfo tech={c.tech} />
          </section>

          <section className="doc-section" id="props">
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
                      <td>{p.type}</td>
                      <td>{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <nav className="pager" aria-label="Components">
            <Link href={`/docs/${prev.slug}`}>
              ← Previous<b>{prev.name}</b>
            </Link>
            <Link href={`/docs/${next.slug}`}>
              Next →<b>{next.name}</b>
            </Link>
          </nav>
        </article>
        <DocsToc />
      </div>
      <DocsFab />
    </>
  );
}
