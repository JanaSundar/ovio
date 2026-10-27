"use client";

import { isAccentBar, SAMPLE_RELEASE } from "@/content/samples";
import { CompareSlider } from "./compare-slider";

/** The sample release card, as a wireframe (v1) or finished (v2), in the world's own colours. */
export function ReleaseCard({ finished }: { finished?: boolean }) {
  const outline = "border border-dashed border-(--ovio-faint)";
  const ink = finished ? "bg-(--ovio-ink)" : outline;
  const accent = finished ? "bg-(--ovio-accent)" : outline;
  const soft = finished ? "bg-(--ovio-line)" : outline;
  return (
    <div className="flex size-full flex-col gap-3 p-[8%] pt-[14%]">
      <div className="flex items-center gap-2.5">
        <span className={`size-7 shrink-0 rounded-lg ${accent}`} />
        <div className="flex flex-1 flex-col gap-1.5">
          <span className={`h-2 w-3/5 rounded-full ${ink}`} />
          <span className={`h-2 w-2/5 rounded-full ${soft}`} />
        </div>
      </div>
      <div className="flex flex-1 items-end gap-1.5">
        {SAMPLE_RELEASE.bars.map((h, i) => (
          <span
            key={i}
            className={`flex-1 rounded-t-[4px] ${isAccentBar(i) ? accent : ink}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`h-2 w-1/4 rounded-full ${soft}`} />
        <span className={`h-6 w-1/3 rounded-lg ${accent}`} />
      </div>
    </div>
  );
}

export function CompareSliderDemo() {
  const { label, beforeLabel, afterLabel } = SAMPLE_RELEASE;
  return (
    <CompareSlider
      before={<ReleaseCard />}
      after={<ReleaseCard finished />}
      beforeLabel={beforeLabel}
      afterLabel={afterLabel}
      label={label}
    />
  );
}
