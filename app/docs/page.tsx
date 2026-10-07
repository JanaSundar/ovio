import type { Metadata } from "next";
import Link from "next/link";
import { WORLD_INFO } from "@/content/worlds";

export const metadata: Metadata = {
  title: "Introduction",
  description:
    "Ovio is a set of motion components for developer websites, each in four design worlds.",
};

const h2 = "m-0 text-2xl font-medium tracking-[-0.025em]";
const p = "m-0 text-[15px] leading-relaxed text-ink-2 text-pretty";

export default function IntroductionPage() {
  return (
    <div className="flex max-w-[760px] flex-col gap-12">
      <header className="flex flex-col gap-4">
        <div className="text-[13px] text-muted">Docs / Getting started</div>
        <h1 className="m-0 text-[52px] leading-none font-medium tracking-[-0.045em]">
          Introduction
        </h1>
        <p className="m-0 text-[17px] leading-relaxed text-ink-2 text-pretty">
          Ovio is a set of components for developer websites. Each one ships with four renderers,
          four design worlds, over the same data, logic and accessibility. A world is not a colour
          theme: it changes material, type, shape, interaction and motion. You install the source
          and own it.
        </p>
      </header>

      <section className="flex flex-col gap-3.5">
        <h2 className={h2}>Installation</h2>
        <p className={p}>
          Ovio is a shadcn registry. Add it to{" "}
          <code className="font-mono text-[13px]">components.json</code> once, then add components
          by name:
        </p>
        <pre className="m-0 overflow-x-auto rounded-[10px] bg-ink px-[18px] py-4 font-mono text-[13px] leading-[1.8] text-paper">
          <span className="text-code-muted">{"// components.json"}</span>
          {'\n{ "registries": { "@ovio": "https://ovio.dev/r/{name}.json" } }\n\n'}
          <span className="text-code-muted"># any component, by name</span>
          {"\n$ npx shadcn add @ovio/contribution-graph"}
        </pre>
        <p className={p}>
          Components take their data as props. GitHub and npm fetching lives in small server-side
          helpers, so a page makes one cached request instead of every visitor hitting the API.
        </p>
      </section>

      <section className="flex flex-col gap-3.5">
        <h2 className={h2}>The four worlds</h2>
        <div className="border-t border-line-2">
          {WORLD_INFO.map((w) => (
            <div
              key={w.id}
              className="grid gap-x-5 gap-y-2 border-b border-line py-[18px] text-sm leading-normal sm:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)]"
            >
              <span
                style={{
                  fontFamily: w.font,
                  fontSize: w.size,
                  letterSpacing: w.tracking,
                  fontWeight: w.weight,
                }}
              >
                {w.label}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-medium">“{w.want}”</span>
                <span className="text-ink-2">{w.description}</span>
              </span>
              <span className="text-muted">{w.motion}</span>
            </div>
          ))}
        </div>
        <p className={p}>
          Set a default world for the whole site with{" "}
          <code className="font-mono text-[13px]">
            &lt;OvioProvider world=&quot;craft&quot;&gt;
          </code>
          ; a component&apos;s own <code className="font-mono text-[13px]">variant</code> prop
          always wins.
        </p>
      </section>

      <section className="flex flex-col gap-3.5">
        <h2 className={h2}>Motion</h2>
        <p className={p}>
          Every component animates with Motion for React, but each world moves for a different
          reason. Minimal moves to show state. Craft moves like paper and card settling. Retro moves
          in steps, like old hardware. Toy is driven by physics: springs, drag, inertia, snap and
          resistance. Every press, drag and flick has a physical cause.
        </p>
        <p className={p}>
          Numbers roll with NumberFlow: digits spin in the direction of the change on a 900ms
          spring, characters fade over 450ms, and neighbours slide to make room. Under
          prefers-reduced-motion, springs resolve instantly and nothing loops. Every control still
          works by keyboard: knobs and tabs take the arrow keys, keys take Space and Enter.
        </p>
        <Link href="/docs/gooey-tabs" className="text-sm hover:text-muted">
          See the tabs in Toy →
        </Link>
      </section>

      <section className="flex flex-col gap-3.5">
        <h2 className={h2}>Fonts</h2>
        <p className={p}>
          Each world has its own type: Geist and Geist Mono (Minimal), Bricolage Grotesque, IBM Plex
          Mono and Caveat (Craft), VT323 (Retro), Archivo and IBM Plex Mono (Toy). The theme reads
          them from CSS variables such as{" "}
          <code className="font-mono text-[13px]">--font-geist</code>, so load them with{" "}
          <code className="font-mono text-[13px]">next/font</code> using those variable names, or
          from Google Fonts.
        </p>
      </section>

      <section className="flex flex-col gap-3.5">
        <h2 className={h2}>3D</h2>
        <p className={p}>
          Nothing in Ovio needs WebGL. The Toy contribution blocks are CSS 3D transforms animated
          with Motion, so no component pulls in three.js.
        </p>
      </section>
    </div>
  );
}
