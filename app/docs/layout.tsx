import { DocsMobileNav, DocsSidebar } from "@/components/site/docs-sidebar";
import { SiteFooter, SiteNav } from "@/components/site/site-nav";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
      <SiteNav />
      <div className="grid items-start gap-6 pt-6 pb-24 docs:grid-cols-[200px_minmax(0,1fr)] docs:gap-12 docs:pt-10">
        <DocsSidebar />
        <DocsMobileNav />
        <main className="min-w-0">{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
