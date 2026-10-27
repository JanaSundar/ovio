import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { Suspense } from "react";
import { Sidebar, SidebarView } from "@/components/registry/shell/sidebar";
import { TopNav } from "@/components/registry/shell/top-nav";

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "Ovio · The interaction registry", template: "%s · Ovio registry" },
  description:
    "Discover, customize and install production-ready interactions for React and Next.js.",
};

/** The registry's shell: the top bar, the discovery sidebar on large screens, and the page. */
export default function RegistryLayout({ children }: LayoutProps<"/registry">) {
  return (
    <div className={`reg-app min-h-dvh bg-void ${serif.variable}`}>
      <a
        href="#registry-main"
        className="sr-only z-50 rounded-md bg-raised px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <TopNav />
      <div className="flex">
        <aside
          data-lenis-prevent
          className="reg-scroll sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-seam lg:block"
        >
          <Suspense fallback={<SidebarView />}>
            <Sidebar />
          </Suspense>
        </aside>
        <main id="registry-main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
