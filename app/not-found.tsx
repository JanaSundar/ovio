import type { Metadata } from "next";
import Link from "next/link";
import { RequestedPath } from "@/components/site/not-found/requested-path";
import { NotFoundStage } from "@/components/site/not-found/stage";
import { SiteFooter } from "@/components/site/site-nav";
import { COMPONENTS, DOCS_HREF } from "@/content/components";

export const metadata: Metadata = { title: "Page not found" };

/** Popular places to go instead, on the left rail. */
const INSTEAD = [
  { label: "Home", href: "/" },
  { label: "All components", href: "/#components" },
  ...COMPONENTS.slice(0, 4).map((c) => ({ label: c.name, href: `/docs/${c.slug}` })),
];

/** The 404 page: the docs header, then the missing page drawn in whichever world is selected. */
export default function NotFound() {
  return (
    <>
      <main id="not-found">
        <section className="dochead row-12">
          <aside className="trail">
            <b>Error / 404</b>
            Not found <br />
            <RequestedPath />
          </aside>
          <div className="head-main">
            <p className="eyebrow">Page not found</p>
            <h1>This page wandered off.</h1>
            <p>
              Nothing lives at{" "}
              <code className="nf-path">
                <RequestedPath />
              </code>
              . It may have moved, or never existed. Here it is in all four worlds while you decide
              where to go next.
            </p>
          </div>
          <aside className="head-meta">
            <span className="meta-top">
              <b>Status</b>
              404 · Not found
            </span>
            <span className="doc-pill">PRESS 1–4</span>
          </aside>
        </section>

        <div className="docs row-12">
          <aside className="side">
            <div className="side-inner">
              <p className="side-title">
                <span>Try instead</span>
              </p>
              <nav className="side-links" aria-label="Try instead">
                {INSTEAD.map((l) => (
                  <Link key={l.href} href={l.href}>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <article className="article nf-article">
            <NotFoundStage />
            <div className="nf-actions">
              <Link href="/" className="nf-btn dark">
                Back to home
              </Link>
              <Link href={DOCS_HREF} className="nf-btn">
                Browse the docs
              </Link>
            </div>
          </article>
        </div>
      </main>
      <SiteFooter note="Page not found · MIT licensed." className="docs-footer" />
    </>
  );
}
