"use client";

import { CompareSlider } from "@/components/ovio/compare-slider/compare-slider";
import { ReleaseCard } from "@/components/ovio/compare-slider/demo";
import { DialMenu } from "@/components/ovio/dial-menu/dial-menu";
import { ITEMS as DIAL_ITEMS } from "@/components/ovio/dial-menu/demo";
import { LiquidMagnifier } from "@/components/ovio/liquid-magnifier/liquid-magnifier";
import { Specimen } from "@/components/ovio/liquid-magnifier/demo";
import { LiquidTabs } from "@/components/ovio/liquid-tabs/liquid-tabs";
import { PANELS, TABS } from "@/components/ovio/liquid-tabs/demo";
import { PhysicalKnob } from "@/components/ovio/physical-knob/physical-knob";
import { ScratchToReveal } from "@/components/ovio/scratch-to-reveal/scratch-to-reveal";
import { Invite } from "@/components/ovio/scratch-to-reveal/demo";
import { OvioToaster } from "@/components/ovio/toast/toast";
import { TRIGGERS } from "@/components/ovio/toast/demo";
import { SAMPLE_INVITE, SAMPLE_RELEASE } from "@/content/samples";
import { renderer, type Renders } from "./types";

const CAPTION = "font-(family-name:--ovio-mono) text-[11px] tracking-widest uppercase";

const RENDERS: Renders = {
  "physical-knob": (p) => <PhysicalKnob {...p} />,
  "compare-slider": (p) => (
    <div className="w-full max-w-md">
      <CompareSlider
        before={<ReleaseCard />}
        after={<ReleaseCard finished />}
        label={SAMPLE_RELEASE.label}
        {...p}
      />
    </div>
  ),
  "liquid-magnifier": (p) => (
    <div className="w-full max-w-md">
      <LiquidMagnifier {...p}>
        <Specimen />
      </LiquidMagnifier>
    </div>
  ),
  "scratch-to-reveal": (p) => (
    <ScratchToReveal label={SAMPLE_INVITE.label} {...p}>
      <Invite />
    </ScratchToReveal>
  ),
  "liquid-tabs": (p) => (
    <LiquidTabs tabs={TABS} panels={PANELS} label="Repository sections" {...p} />
  ),
  "dial-menu": ({ trigger, ...p }) => (
    <div className="grid h-80 w-full max-w-md place-items-center">
      <DialMenu items={DIAL_ITEMS} trigger={trigger} {...p}>
        {trigger === "click" ? (
          <button
            type="button"
            aria-label="Quick actions"
            className="grid size-14 place-items-center rounded-full bg-(--ovio-ink) text-2xl text-(--ovio-surface) shadow-[0_10px_24px_-10px_rgba(0,0,0,.5)] active:scale-95"
          >
            +
          </button>
        ) : trigger === "contextmenu" ? (
          <div className="flex size-full flex-col gap-3 rounded-2xl border border-dashed border-(--ovio-line) p-6 select-none">
            {[92, 78, 85, 60].map((w) => (
              <span
                key={w}
                aria-hidden
                className="h-2 rounded-full bg-(--ovio-line)"
                style={{ width: `${w}%` }}
              />
            ))}
            <span className={`${CAPTION} mt-auto text-center text-(--ovio-faint)`}>
              Right-click or long-press here
            </span>
          </div>
        ) : undefined}
      </DialMenu>
    </div>
  ),
  toast: (p) => (
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
      <OvioToaster {...p} />
    </div>
  ),
};

export default renderer(RENDERS);
