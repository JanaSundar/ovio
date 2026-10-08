import { SiteFooter } from "@/components/site/site-nav";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <>
      <main id="docs">{children}</main>
      <SiteFooter note="Component reference · MIT licensed." className="docs-footer" />
    </>
  );
}
