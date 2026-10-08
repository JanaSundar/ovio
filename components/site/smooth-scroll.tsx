"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Lenis smooths the page's scroll. In-page anchors (#components, the docs contents) glide to
 * their target, nested scrollers (code, the contribution grid, the components sheet) keep their
 * own scroll, and reduced motion turns the smoothing off.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        // Higher lerp = shorter glide tail; wheelMultiplier = more distance per wheel tick.
        lerp: 0.2,
        wheelMultiplier: 1.4,
        anchors: { offset: -24 },
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
      }}
    >
      <ScrollToTopOnNavigate />
      {children}
    </ReactLenis>
  );
}

/** A new page starts at the top, without gliding there from wherever the last one was. */
function ScrollToTopOnNavigate() {
  const lenis = useLenis();
  const pathname = usePathname();
  const last = useRef(pathname);

  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    if (!window.location.hash) lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);

  return null;
}
