import Link from "next/link";
import { CopyCommand } from "@/components/site/copy-command";
import { HomeShowcase } from "@/components/site/home-showcase";
import { SiteFooter } from "@/components/site/site-nav";
import { WorldCompass } from "@/components/site/world-compass";
import { AUTHOR_URL, COMPONENTS, DOCS_HREF, installCommand, pad2 } from "@/content/components";

/** The six components the catalog leads with, each with a glyph and a one-line pitch. */
const FEATURED = [
  { slug: "contribution-graph", glyph: "▦", pitch: "A year of activity, one cell per day." },
  { slug: "repository-card", glyph: "◈", pitch: "The story behind a project at a glance." },
  { slug: "star-history", glyph: "↗", pitch: "Stargazers over time, with a scrubber." },
  { slug: "gooey-tabs", glyph: "▤", pitch: "Tabs with a liquid indicator and a deploy status." },
  { slug: "top-contributors", glyph: "◎", pitch: "Put project people in the foreground." },
  { slug: "physical-knob", glyph: "◉", pitch: "A tactile control with genuine inertia." },
];

export default function HomePage() {
  const count = COMPONENTS.length;
  const featured = FEATURED.map((f) => ({ ...f, ...COMPONENTS.find((c) => c.slug === f.slug)! }));

  return (
    <>
      <main id="top">
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
              <p className="eyebrow">For portfolios, projects, docs and profiles</p>
              <h1>
                Small interfaces.
                <br />
                <em>Big presence.</em>
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
            {featured.map((c) => (
              <Link key={c.slug} className="catalog-item" href={`/docs/${c.slug}`}>
                <span aria-hidden className="glyph">
                  {c.glyph}
                </span>
                <span>
                  <b>{c.name}</b>
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
            <CopyCommand command={installCommand("contribution-graph")} />
          </div>
        </section>
      </main>

      <SiteFooter note="The motion layer for developer sites." />
    </>
  );
}
