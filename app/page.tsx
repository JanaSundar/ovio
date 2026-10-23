import Image from "next/image";
import Link from "next/link";
import { HomeShowcase } from "@/components/site/home-showcase";
import { SiteFooter } from "@/components/site/site-nav";
import { WorldCompass } from "@/components/site/world-compass";
import {
  AUTHOR_URL,
  COMPONENTS,
  DOCS_HREF,
  installCommand,
  pad2,
  SITE_URL,
  worldItemName,
} from "@/content/components";
import { WorldCommand } from "@/components/site/install-command";
import { JsonLd, SITE_DESCRIPTION, sourceCode } from "@/lib/seo";
import { WORLDS, type World } from "@/lib/world";

/** Each catalogued component's glyph and one-line pitch, for the hero and the catalog. */
const PITCHES: Record<string, { glyph: string; pitch: string }> = {
  "contribution-graph": { glyph: "▦", pitch: "A year of activity, one cell per day." },
  "repository-card": { glyph: "◈", pitch: "The story behind a project at a glance." },
  "star-history": { glyph: "↗", pitch: "Stargazers over time, with a scrubber." },
  "liquid-tabs": { glyph: "▤", pitch: "Tabs with a liquid indicator and a deploy status." },
  "top-contributors": { glyph: "◎", pitch: "Put project people in the foreground." },
  "physical-knob": { glyph: "◉", pitch: "A tactile control with genuine inertia." },
  letter: { glyph: "✉", pitch: "A newsletter issue, sent four different ways." },
  "compare-slider": { glyph: "◧", pitch: "Two versions of anything, one divider." },
  "liquid-magnifier": { glyph: "◍", pitch: "A liquid lens that magnifies what it covers." },
  "scratch-to-reveal": { glyph: "▒", pitch: "A coating you scratch away to find what's under it." },
};

/** The components the catalog shows when nothing new leads it. */
const FEATURED = [
  "contribution-graph",
  "repository-card",
  "star-history",
  "liquid-tabs",
  "top-contributors",
  "physical-knob",
];

/** How many components the catalog lists under the lead, two columns of three. */
const LISTED = 6;

const withPitch = (slug: string) => ({
  ...COMPONENTS.find((c) => c.slug === slug)!,
  ...PITCHES[slug],
});

export default function HomePage() {
  const count = COMPONENTS.length;
  // Newest first: the latest leads the hero and the catalog, the rest join the list with a dot.
  const fresh = COMPONENTS.filter((c) => c.isNew && c.slug in PITCHES)
    .reverse()
    .map((c) => withPitch(c.slug));
  const [latest] = fresh;
  const listed = [
    ...fresh.slice(1),
    ...FEATURED.filter((slug) => !fresh.some((c) => c.slug === slug)).map(withPitch),
  ].slice(0, LISTED);

  return (
    <>
      <main id="top">
        <JsonLd
          data={{
            "@graph": [
              { "@type": "WebSite", name: "Ovio", url: SITE_URL },
              sourceCode("Ovio", SITE_DESCRIPTION, SITE_URL),
            ],
          }}
        />
        <section className="intro row-12">
          <aside className="intro-index">
            <span className="status">
              <i /> Open source
            </span>
            <span className="world-count">
              <b>The kit</b>
              {count} components
              <br />
              04 worlds
              <br />
              MIT licensed
              <br />
              <a href={AUTHOR_URL} target="_blank" rel="noreferrer">
                Made by Jana ↗
              </a>
            </span>
          </aside>
          <div className="intro-main">
            <div>
              {latest ? (
                <Link className="news-pill" href={`/docs/${latest.slug}`}>
                  <span className="news-tag">
                    <span className="new-dot" /> New
                  </span>
                  <span className="news-text">
                    <b>{latest.name}</b>
                    <span className="news-pitch"> · {latest.pitch}</span>
                  </span>
                  <span aria-hidden className="news-go">
                    →
                  </span>
                </Link>
              ) : (
                <p className="eyebrow">For portfolios, projects, docs and profiles</p>
              )}
              <h1>
                One component.
                <br />
                <em>Four worlds.</em>
              </h1>
            </div>
            <div className="intro-bottom">
              <p className="intro-copy">
                <strong>Ovio is a component library for the parts developers put in public.</strong>{" "}
                It gives activity, projects, releases, people, and personality a place to move.
              </p>
              <a className="inline-link" href="#components">
                See what’s inside ↘
              </a>
            </div>
          </div>
          <aside className="intro-side">
            <span className="side-caption">
              <b>Pick a world</b>
              Drag, click or press 1–4
            </span>
            <WorldCompass />
          </aside>
        </section>

        <section className="specimen row-12" aria-label="Interactive component specimen">
          <aside className="specimen-label">
            <p className="eyebrow">Live specimen</p>
            <h2>
              One data set. <br />
              Four personalities.
            </h2>
            <p>
              Each visual world changes the material, type, shape, and motion, not only the color.
              Press 1–4 to switch.
            </p>
          </aside>
          <HomeShowcase />
        </section>

        <section className="catalog row-12" id="components">
          <div className="catalog-title">
            <p className="eyebrow">The catalog</p>
            <h2>
              Build your site’s
              <br />
              own language.
            </h2>
            <p>Start with a useful component. Give it an unmistakable point of view.</p>
            <Link href={DOCS_HREF}>Browse all {count} components ↗</Link>
          </div>
          <div className="catalog-list">
            {latest && (
              <Link className="catalog-lead" href={`/docs/${latest.slug}`}>
                <span aria-hidden className="lead-art">
                  {/* Already a sized PNG from its own route, so there is nothing to optimise. */}
                  <Image src={`/og/${latest.slug}`} alt="" width={1200} height={630} unoptimized />
                </span>
                <span className="lead-text">
                  <span className="status new-mark">
                    <i /> Just added
                  </span>
                  <b>{latest.name}</b>
                  <small>{latest.description}</small>
                  <span className="lead-link">Open the docs ↗</span>
                </span>
              </Link>
            )}
            {listed.map((c) => (
              <Link key={c.slug} className="catalog-item" href={`/docs/${c.slug}`}>
                <span aria-hidden className="glyph">
                  {c.glyph}
                </span>
                <span>
                  <b>{c.name}</b>
                  {c.isNew && (
                    <span className="new-dot">
                      <span className="sr-only">New</span>
                    </span>
                  )}
                  <small>{c.pitch}</small>
                </span>
                <span aria-hidden className="arrow">
                  ↗
                </span>
              </Link>
            ))}
          </div>
          <div className="catalog-footer">
            <span>{count} components built for the things developers show</span>
            <Link className="btn-outline" href={DOCS_HREF}>
              Open the component docs →
            </Link>
          </div>
        </section>

        <section className="manifesto row-12" id="manifesto">
          <aside className="manifesto-side">
            OVIO IS
            <br />
            NOT A THEME.
            <br />
            <br />
            It’s a starting point
            <br />
            for a site that has
            <br />
            something to say.
          </aside>
          <div className="manifesto-main">
            <h2>
              Every component gives your work <span>a reason to be remembered.</span>
            </h2>
          </div>
          <aside className="manifesto-stats">
            <div className="stat-row">
              <b>{pad2(count)}</b>
              <span>
                components
                <br />
                at launch
              </span>
            </div>
            <div className="stat-row">
              <b>04</b>
              <span>
                renderers
                <br />
                per component
              </span>
            </div>
            <div className="stat-row">
              <b>∞</b>
              <span>
                ways to
                <br />
                make it yours
              </span>
            </div>
          </aside>
          <div className="install-row">
            <div className="install-info">
              <b>Own the source.</b> Add a component, open the files, and change whatever you need.
            </div>
            <WorldCommand
              commands={
                Object.fromEntries(
                  WORLDS.map((w) => [w, installCommand(worldItemName("contribution-graph", w))]),
                ) as Record<World, string>
              }
            />
          </div>
        </section>
      </main>

      <SiteFooter note="The motion layer for developer sites." />
    </>
  );
}
