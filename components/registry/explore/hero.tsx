"use client";

import Link from "next/link";
import { useState } from "react";
import { FluidRangeSlider } from "@/components/interactions/fluid-range-slider/fluid-range-slider";
import { PeelToReveal } from "@/components/interactions/peel-to-reveal/peel-to-reveal";
import { LaunchCode } from "../playables/renders/new";
import { BROWSE } from "../shell/links";

/**
 * A short hero: the promise on the left, two real interactions on the right. The slider's value
 * sets how far the sticker's corner curls, so the two talk to each other.
 */
export function ExploreHero({ count }: { count: number }) {
  const [curl, setCurl] = useState(24);
  const [peeled, setPeeled] = useState(false);
  return (
    <section
      aria-labelledby="explore-title"
      className="grid items-center gap-8 border-b border-seam px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:py-12"
    >
      <div className="flex max-w-xl flex-col gap-5">
        <p className="font-mono text-[11px] tracking-[0.16em] text-haze uppercase">
          {count} interactions · React and Next.js
        </p>
        <h1
          id="explore-title"
          className="text-[34px] leading-[1.08] font-medium tracking-[-0.025em] text-balance sm:text-[44px]"
        >
          Interactions that make interfaces{" "}
          <em className="font-editorial font-normal tracking-[-0.01em] text-violet">feel alive.</em>
        </h1>
        <p className="max-w-lg text-[15px] leading-relaxed text-mist">
          Discover, customize and install production-ready interactions for React and Next.js. React
          Native (Expo) versions are listed as each one ships.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={BROWSE}
            className="rounded-lg bg-snow px-4 py-2 text-sm font-medium text-void transition-opacity hover:opacity-90"
          >
            Browse all components
          </Link>
          <a
            href="#how-it-works"
            className="rounded-lg border border-seam-2 px-4 py-2 text-sm text-snow transition-colors hover:bg-white/[0.04]"
          >
            See how it works
          </a>
        </div>
      </div>
      <div className="reg-glow flex flex-col gap-6 rounded-2xl border border-seam p-6 sm:p-7">
        <FluidRangeSlider
          label="Corner curl"
          min={0}
          max={60}
          value={curl}
          onValueChange={(v) => setCurl(v as number)}
          formatValue={(v) => `${v}px`}
        />
        <div className="mx-auto flex w-full max-w-[300px] flex-col items-center gap-2">
          <PeelToReveal
            label="Launch code"
            curl={curl}
            aspectRatio="16 / 9"
            peeled={peeled}
            onPeeledChange={setPeeled}
          >
            <LaunchCode />
          </PeelToReveal>
          <button
            type="button"
            onClick={() => setPeeled(false)}
            disabled={!peeled}
            className="font-mono text-[11px] tracking-widest text-haze uppercase transition-opacity hover:text-snow disabled:pointer-events-none disabled:opacity-0"
          >
            Stick it back
          </button>
        </div>
      </div>
    </section>
  );
}
