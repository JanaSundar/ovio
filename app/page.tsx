import Link from "next/link";
import { CopyCommand } from "@/components/site/copy-command";
import { HomeShowcase } from "@/components/site/home-showcase";
import { SiteFooter } from "@/components/site/site-nav";
import { WorldCompass } from "@/components/site/world-compass";
import { groupedCatalog } from "@/content/catalog";
import { AUTHOR_URL, COMPONENTS, installCommand, pad2 } from "@/content/components";

export default function HomePage() {
  const count = COMPONENTS.length;
  const groups = groupedCatalog();

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
            <p>Fifteen components, grouped by what a developer site actually shows.</p>
            <Link href="/gallery">Open the live gallery ↗</Link>
          </div>
          <div className="catalog-list">
            {groups.map((group) => (
              <div key={group.id} className="catalog-group">
                <p className="catalog-group-label">
                  {group.label}
                  <span>{group.blurb}</span>
                </p>
                {group.items.map((c) => (
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
            ))}
          </div>
          <div className="catalog-footer">
            <span>{count} components built for the things developers show</span>
            <span className="catalog-actions">
              <Link className="btn-outline" href="/gallery">
                Gallery →
              </Link>
              <Link className="btn-outline" href="/recipes">
                Recipes →
              </Link>
            </span>
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
