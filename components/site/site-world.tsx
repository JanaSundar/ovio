"use client";

import { MotionConfig } from "motion/react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { OvioProvider } from "@/components/shared/world-provider";
import { WORLDS, type World } from "@/lib/world";

type SiteWorld = { world: World; setWorld: (world: World) => void };

const Ctx = createContext<SiteWorld | null>(null);

/** The site's current world: shared by the homepage and docs, switched by tabs or keys 1–4. */
export function SiteWorldProvider({ children }: { children: ReactNode }) {
  const [world, setWorld] = useState<World>("minimal");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return;
      const k = Number.parseInt(e.key, 10);
      if (k >= 1 && k <= 4) setWorld(WORLDS[k - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Each world's typeface only loads the first time that world shows, so the first switch used
  // to swap fonts mid-animation and stutter. Load the Latin faces while the page is idle instead.
  useEffect(() => {
    const warm = () =>
      document.fonts.forEach((f) => {
        if (f.status === "unloaded" && /U\+0+-0*FF/i.test(f.unicodeRange)) f.load().catch(() => {});
      });
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(warm, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 1200);
    return () => clearTimeout(id);
  }, []);

  return (
    <Ctx.Provider value={{ world, setWorld }}>
      <MotionConfig reducedMotion="user">
        <OvioProvider world={world}>{children}</OvioProvider>
      </MotionConfig>
    </Ctx.Provider>
  );
}

export function useSiteWorld(): SiteWorld {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSiteWorld must be used inside SiteWorldProvider");
  return ctx;
}
