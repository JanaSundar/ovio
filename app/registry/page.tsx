import { Suspense } from "react";
import { BrowserView, RegistryBrowser } from "@/components/registry/explore/browser";
import { ExploreHero } from "@/components/registry/explore/hero";
import { HowItWorks } from "@/components/registry/explore/how-it-works";
import { INTERACTIONS } from "@/content/interactions";

export const metadata = { title: { absolute: "Ovio · The interaction registry" } };

export default function ExplorePage() {
  return (
    <>
      <ExploreHero count={INTERACTIONS.length} />
      <section aria-labelledby="browse-title" className="px-5 py-8 sm:px-8">
        <h2 id="browse-title" className="mb-5 text-lg font-medium tracking-[-0.01em]">
          Browse the registry
        </h2>
        <Suspense fallback={<BrowserView statusId="browse-count" />}>
          <RegistryBrowser statusId="browse-count" />
        </Suspense>
      </section>
      <HowItWorks />
    </>
  );
}
