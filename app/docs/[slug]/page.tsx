import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CodeBlock,
  ComponentPreview,
  MotionInfo,
  UsageSnippet,
  type SourceFile,
} from "@/components/site/component-doc";
import { CopyCommand } from "@/components/site/copy-command";
import { highlight } from "@/components/site/highlight";
import { PlaygroundProvider } from "@/components/site/playground";
import { WorldSwitcher } from "@/components/site/world-switcher";
import { COMPONENTS, getComponent, installCommand } from "@/content/components";

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

const REGISTRY = highlight(
  '{\n  "registries": {\n    "@ovio": "https://ovio.dev/r/{name}.json"\n  }\n}',
  "json",
);

const h2 = "m-0 text-[22px] font-medium tracking-[-0.025em]";

export default async function ComponentPage({ params }: PageProps<"/docs/[slug]">) {
  const { slug } = await params;
  const i = COMPONENTS.findIndex((c) => c.slug === slug);
  if (i < 0) notFound();
  const c = COMPONENTS[i];
  const prev = COMPONENTS[(i - 1 + COMPONENTS.length) % COMPONENTS.length];
  const next = COMPONENTS[(i + 1) % COMPONENTS.length];
  const files = c.ready ? await readSources(c.files) : [];
  const install = installCommand(c.slug);

  return (
    <PlaygroundProvider slug={c.slug}>
      <div className="flex flex-col gap-11">
        <header className="flex flex-col gap-3.5">
          <div className="text-[13px] text-muted">Docs / Components</div>
          <h1 className="m-0 text-5xl leading-none font-medium tracking-[-0.045em]">{c.name}</h1>
          <p className="m-0 max-w-[62ch] text-[17px] leading-[1.55] text-ink-2 text-pretty">
            {c.description}
          </p>
        </header>

        <section className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <WorldSwitcher className="w-full max-w-[460px] rounded-[13px]" />
            <span className="font-mono text-xs text-muted">Press 1–4</span>
          </div>
          <ComponentPreview slug={c.slug} name={c.name} phase={c.phase} files={files} />
        </section>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-10">
          <section className="flex min-w-0 flex-col gap-3.5">
            <h2 className={h2}>Installation</h2>
            <p className="m-0 text-[13px] leading-normal text-muted">
              Ovio is a shadcn registry. Add it to{" "}
              <code className="font-mono">components.json</code> once:
            </p>
            <CodeBlock html={REGISTRY} className="rounded-[10px] py-3.5 text-[12.5px]" />
            <CopyCommand command={install} html={highlight(install, "shell")} />
            <p className="m-0 text-[13px] leading-normal text-muted">
              Installs{" "}
              {c.dependencies.map((d, k) => (
                <span key={d}>
                  {k > 0 && (k === c.dependencies.length - 1 ? " and " : ", ")}
                  <code className="font-mono">{d}</code>
                </span>
              ))}
              , plus the Ovio {c.registryDependencies.join(", ")} items.
            </p>
            <h2 className={`${h2} mt-4`}>Usage</h2>
            <UsageSnippet exportName={c.exportName} slug={c.slug} usage={c.usage} />
            <MotionInfo tech={c.tech} />
          </section>
          <section className="flex min-w-0 flex-col gap-3.5">
            <h2 className={h2}>Props</h2>
            <div className="border-t border-line-2 text-[13px]">
              {c.props.map((p) => (
                <div
                  key={p.name}
                  className="grid grid-cols-[minmax(0,.9fr)_minmax(0,1.3fr)_minmax(0,1.4fr)] gap-3.5 border-b border-line py-[13px]"
                >
                  <span className="font-mono font-medium">{p.name}</span>
                  <span className="font-mono text-xs break-words text-muted">{p.type}</span>
                  <span className="text-ink-2">{p.description}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex justify-between gap-4 border-t border-line pt-6 text-sm">
          <Link href={`/docs/${prev.slug}`} className="flex flex-col gap-1 hover:text-muted">
            <span className="text-xs text-muted">Previous</span>
            {prev.name}
          </Link>
          <Link
            href={`/docs/${next.slug}`}
            className="flex flex-col gap-1 text-right hover:text-muted"
          >
            <span className="text-xs text-muted">Next</span>
            {next.name}
          </Link>
        </div>
      </div>
    </PlaygroundProvider>
  );
}
