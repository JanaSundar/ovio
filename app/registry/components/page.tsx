import { Suspense } from "react";
import { BrowserView, RegistryBrowser } from "@/components/registry/explore/browser";

export const metadata = { title: "Components" };

export default function ComponentsPage() {
  return (
    <section aria-labelledby="components-title" className="px-5 py-8 sm:px-8">
      <h1 id="components-title" className="mb-1 text-2xl font-medium tracking-[-0.02em]">
        Components
      </h1>
      <p className="mb-6 text-sm text-mist">
        Every interaction in the registry, filtered by purpose, platform or collection.
      </p>
      <Suspense fallback={<BrowserView statusId="components-count" />}>
        <RegistryBrowser statusId="components-count" />
      </Suspense>
    </section>
  );
}
