import { DocHead } from "@/components/site/doc-head";
import { DocsFab, DocsSidebar } from "@/components/site/docs-sidebar";
import { SiteFooter } from "@/components/site/site-nav";

/**
 * The docs frame. The header, the component list and the small-screen menu live here rather than
 * in the page, so they stay mounted from one component to the next and can animate the change.
 */
export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <>
      <main id="docs">
        <DocHead />
        <div className="docs row-12">
          <DocsSidebar />
          {children}
        </div>
        <DocsFab />
      </main>
      <SiteFooter note="Component reference · MIT licensed." className="docs-footer" />
    </>
  );
}
