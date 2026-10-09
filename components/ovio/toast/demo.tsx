"use client";

import { OvioToaster, ovioToast } from "./toast";

const TRIGGERS: [label: string, fire: () => void][] = [
  [
    "Rate limited",
    () =>
      ovioToast.error("github.com rate limit reached, resets in 12 min", {
        description: "Showing the last good data.",
        action: { label: "Retry", onClick: () => ovioToast.success("Live data is back") },
      }),
  ],
  ["Copied", () => ovioToast.success("Install command copied")],
  [
    "Cached",
    () =>
      ovioToast.info("Refreshed 12 min ago", { description: "Live data is cached for an hour." }),
  ],
];

export function ToastDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {TRIGGERS.map(([label, fire]) => (
        <button
          key={label}
          type="button"
          onClick={fire}
          className="cursor-pointer rounded-(--ovio-radius) border border-(--ovio-line) bg-(--ovio-surface) px-4 py-2.5 font-(family-name:--ovio-font) text-sm text-(--ovio-ink)"
        >
          {label}
        </button>
      ))}
      <OvioToaster />
    </div>
  );
}
