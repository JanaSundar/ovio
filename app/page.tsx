import Link from "next/link";
import { InstallButton } from "@/components/site/copy-command";
import { HomeShowcase } from "@/components/site/home-showcase";
import { SiteFooter, SiteNav } from "@/components/site/site-nav";
import { WorldSwitcher } from "@/components/site/world-switcher";
import { COMPONENTS, installCommand } from "@/content/components";

const STEPS = [
  {
    title: "Pick a component",
    body: "Contribution graphs, repo cards, star history, tickets: built for the things developers actually show.",
  },
  {
    title: "Choose a world",
    body: "Minimal to keep it clean, Craft to make it feel made, Retro for nostalgia, Toy to play with it. Each is its own renderer over shared logic and accessibility.",
  },
  {
    title: "Own the source",
    body: "The shadcn CLI copies TypeScript into your repo. No lock-in: edit anything.",
    code: "npx shadcn add @ovio/…",
  },
];

const STATS = [
  { value: COMPONENTS.length, label: "Components at launch" },
  { value: 4, label: "Design worlds each" },
  { value: COMPONENTS.length * 4, label: "Distinct experiences" },
  { value: 2, label: "Runtime dependencies: Motion and NumberFlow" },
];

const BUILT_WITH = [
  "React",
  "TypeScript",
  "Motion for React",
  "Tailwind CSS",
  "shadcn registry",
  "NumberFlow",
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
      <SiteNav />

      <header className="grid items-end gap-12 pt-16 pb-14 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:pt-[88px]">
        <h1 className="m-0 text-[clamp(44px,6.4vw,84px)] leading-[0.98] font-medium tracking-[-0.045em] text-balance">
          The motion layer for developer websites.
        </h1>
        <div className="flex flex-col gap-6">
          <p className="m-0 text-[17px] leading-[1.55] text-ink-2 text-pretty">
            Expressive components for portfolios, open-source projects and technical sites, with
            four distinct design worlds built into every one: Minimal, Craft, Retro and Toy. Install
            it, own the source.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <InstallButton command={installCommand("gooey-tabs")} />
            <Link
              href="/docs"
              className="flex items-center rounded-lg border border-line-2 px-4 py-3 text-sm hover:text-muted"
            >
              Read the docs →
            </Link>
          </div>
        </div>
      </header>

      <div id="styles" className="flex flex-wrap items-center justify-between gap-4 pb-3.5">
        <WorldSwitcher showKeys className="w-full max-w-[520px]" />
      </div>

      <HomeShowcase />

      <section id="about" className="flex flex-col gap-14 pt-28 pb-24">
        <div className="grid items-end gap-x-12 gap-y-8 md:grid-cols-2">
          <div>
            <div className="mb-3.5 text-[11px] tracking-[0.12em] text-muted uppercase">
              About Ovio
            </div>
            <h2 className="m-0 text-[clamp(32px,4vw,48px)] leading-[1.02] font-medium tracking-[-0.04em] text-balance">
              Components that feel like your site, not ours.
            </h2>
          </div>
          <p className="m-0 max-w-[56ch] text-base leading-relaxed text-ink-2 text-pretty">
            Ovio is an open-source kit for developer websites: portfolios, project pages, docs and
            profiles. Every component ships with four renderers that change material, type, shape,
            interaction and motion, not just colour.
          </p>
        </div>

        <div className="grid border-t border-[rgba(22,22,20,.14)] sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-col gap-3 py-7 pr-8">
              <span className="font-mono text-[11px] text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-xl font-medium tracking-[-0.02em]">{s.title}</span>
              <span className="text-sm leading-[1.55] text-muted">{s.body}</span>
              {s.code && (
                <code className="self-start rounded-md bg-paper-2 px-2.5 py-1.5 font-mono text-xs">
                  {s.code}
                </code>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-px overflow-hidden rounded-[14px] border border-[rgba(22,22,20,.12)] bg-[rgba(22,22,20,.12)]">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white px-[26px] py-6">
              <div className="text-[40px] leading-none font-normal tracking-[-0.04em]">
                {s.value}
              </div>
              <div className="mt-2 text-[13px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-[13px]">
          <span className="mr-1.5 text-muted">Built with</span>
          {BUILT_WITH.map((b) => (
            <span key={b} className="rounded-full border border-line-2 px-3 py-1.5">
              {b}
            </span>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
