import type { ReactNode } from "react";
import { CodeView } from "../ui/code-view";
import { CommandLine } from "../ui/copy-button";

export type InstallInfo =
  | { kind: "registry"; command: string; dependencies: string[]; registryDependencies: string[] }
  | {
      kind: "source";
      dependencies: string[];
      files: { path: string; code: string; html: string }[];
    };

/** How to get the interaction into a project, per platform, saying only what has been checked. */
export function InstallPanel({ info }: { info: InstallInfo }) {
  return (
    <div className="flex flex-col gap-5">
      <Block title="Web · React">
        {info.kind === "registry" ? (
          <>
            <CommandLine command={info.command} />
            <p className="text-[13px] leading-relaxed text-mist">
              The shadcn CLI copies the component, all four styles and its helpers into{" "}
              <code className="text-snow">components/ovio/</code>.
            </p>
            <Deps label="npm packages" names={info.dependencies} />
            <Deps label="Ovio helpers it brings" names={info.registryDependencies} />
          </>
        ) : (
          <>
            <p className="rounded-lg border border-[#ffb86b]/25 bg-[#ffb86b]/[0.06] px-3 py-2 text-[13px] leading-relaxed text-[#ffd3a1]">
              Not published to the shadcn registry yet. Copy the files below into your project,
              keeping their paths.
            </p>
            <CommandLine command={`npm install ${info.dependencies.join(" ")}`} />
            {info.files.map((f) => (
              <CodeView key={f.path} code={f.code} html={f.html} title={f.path} />
            ))}
          </>
        )}
        <p className="text-xs leading-relaxed text-haze">
          Built and checked in Next.js 16 with React 19 and Tailwind CSS v4.
        </p>
      </Block>
      <Block title="Native · Expo">
        <p className="text-[13px] leading-relaxed text-mist">
          No React Native implementation exists. The web version uses the DOM and won&apos;t run in
          Expo.
        </p>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-mono text-[10.5px] tracking-[0.14em] text-haze uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Deps({ label, names }: { label: string; names: string[] }) {
  if (!names.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-haze">{label}</span>
      <ul className="flex flex-wrap gap-1.5">
        {names.map((n) => (
          <li
            key={n}
            className="rounded-md border border-seam px-1.5 py-0.5 font-mono text-[11px] text-mist"
          >
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}
