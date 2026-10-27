import { Suspense } from "react";
import { Playground } from "@/components/registry/playground/playground";

export const metadata = { title: "Playground" };

export default function PlaygroundPage() {
  return (
    <section aria-labelledby="playground-title" className="flex flex-col gap-5 px-5 py-8 sm:px-8">
      <div className="flex max-w-2xl flex-col gap-1.5">
        <h1 id="playground-title" className="text-2xl font-medium tracking-[-0.02em]">
          Playground
        </h1>
        <p className="text-sm text-mist">
          Pick an interaction, change its props and copy the example. The snippet prints only what
          differs from the component&apos;s own defaults; props that take data or functions keep the
          sample&apos;s.
        </p>
      </div>
      <Suspense
        fallback={
          <div
            role="status"
            aria-label="Loading playground"
            className="h-[560px] animate-pulse rounded-2xl border border-seam bg-deck"
          />
        }
      >
        <Playground />
      </Suspense>
    </section>
  );
}
