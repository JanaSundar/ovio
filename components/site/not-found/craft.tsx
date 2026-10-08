"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DOCS_HREF, GITHUB_URL } from "@/content/components";
import { useReducedMotionSafe } from "@/lib/motion";
import { RequestedPath } from "./requested-path";

/** The tear-off tabs; the null is one someone already took. */
const TABS = [
  { label: "home", href: "/" },
  { label: "docs", href: DOCS_HREF },
  null,
  { label: "all comps", href: "/#components" },
  { label: "github", href: GITHUB_URL, external: true },
];

/** Craft: a taped "lost page" flyer. Tear a tab off to go somewhere. */
export function CraftNotFound() {
  const router = useRouter();
  const reduced = useReducedMotionSafe();
  const [torn, setTorn] = useState<number | null>(null);

  const tear = (i: number) => {
    const tab = TABS[i];
    if (!tab || torn !== null) return;
    if (tab.external) {
      window.open(tab.href, "_blank", "noopener,noreferrer");
      setTorn(i);
      return;
    }
    if (reduced) return router.push(tab.href);
    setTorn(i);
    // Let the tab fall away before the page changes.
    setTimeout(() => router.push(tab.href), 420);
  };

  return (
    <div className="nf-craft">
      <motion.div
        className="nf-cf"
        initial={reduced ? false : { opacity: 0, y: -36, rotate: -6 }}
        animate={{ opacity: 1, y: 0, rotate: -1.4 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
      >
        <i aria-hidden className="nf-tape left" />
        <i aria-hidden className="nf-tape right" />
        <div className="nf-sticker" aria-hidden>
          <b>404</b>
          <span>NOT FOUND</span>
        </div>
        <h2>Lost page.</h2>
        <span className="nf-hand">have you seen it?</span>
        <div className="nf-facts">
          ANSWERS TO ·{" "}
          <b>
            <RequestedPath />
          </b>
          <br />
          LAST SEEN · <b>never, as far as we know</b>
          <br />
          IF FOUND · <b>tear a tab, take it home</b>
        </div>
        <div className="nf-tabs">
          {TABS.map((tab, i) =>
            tab ? (
              <motion.button
                key={tab.label}
                type="button"
                className="nf-tab"
                onClick={() => tear(i)}
                aria-label={`Go to ${tab.label}`}
                animate={
                  torn === i ? { y: 90, rotate: 14, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }
                }
                // Tabs lift on hover and fall away when torn.
                whileHover={torn === null ? { y: 5, rotate: 2 } : undefined}
                whileFocus={torn === null ? { y: 5, rotate: 2 } : undefined}
                transition={{ duration: 0.4, ease: [0.5, 0, 0.75, 0] }}
              >
                <span>→ {tab.label}</span>
              </motion.button>
            ) : (
              <span key={i} className="nf-tab gone" aria-hidden />
            ),
          )}
        </div>
      </motion.div>
    </div>
  );
}
