"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DOCS_HREF } from "@/content/components";
import { useReducedMotionSafe } from "@/lib/motion";

const SECTORS = 32;

/** Retro: a DOS error that types itself out. Abort, Retry, Home… or Docs. */
export function RetroNotFound() {
  const router = useRouter();
  const path = usePathname();
  const reduced = useReducedMotionSafe();
  // 0–3 lines shown before the scan, then the scan fills, then the rest.
  const [step, setStep] = useState(reduced ? 99 : 0);

  useEffect(() => {
    if (reduced || step >= 99) return;
    const scanning = step >= 2 && step < 2 + SECTORS;
    const id = setTimeout(
      () => setStep((s) => (s === 2 + SECTORS + 4 ? 99 : s + 1)),
      scanning ? 28 : 320,
    );
    return () => clearTimeout(id);
  }, [step, reduced]);

  const filled = Math.max(0, Math.min(SECTORS, step - 2));
  const after = step - (2 + SECTORS);

  const actions = {
    a: () => (window.history.length > 1 ? router.back() : router.push("/")),
    r: () => window.location.reload(),
    h: () => router.push("/"),
    d: () => router.push(DOCS_HREF),
  } as const;

  // The keys work as the screen says, once the prompt is up.
  useEffect(() => {
    if (after < 3) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return;
      const k = e.key.toLowerCase() as keyof typeof actions;
      if (k in actions) actions[k]();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="nf-crt" role="alert">
      {step >= 1 && (
        <div>
          <span className="dim">C:\OVIO&gt;</span> GOTO {path.toUpperCase()}
        </div>
      )}
      {step >= 2 && <div className="dim">SCANNING SECTORS...</div>}
      {step >= 2 && (
        <div className="nf-bar" aria-hidden>
          {Array.from({ length: SECTORS }, (_, i) => (
            <i key={i} className={i < filled ? "on" : undefined} />
          ))}
        </div>
      )}
      {after >= 0 && <div className="dim">404 / 404 SECTORS READ</div>}
      {after >= 1 && <div className="nf-err">ERROR 404 · FILE NOT FOUND</div>}
      {after >= 2 && <div>THE PAGE YOU ASKED FOR ISN&apos;T ON THIS DISK.</div>}
      {after >= 3 && (
        <>
          <div className="hi nf-prompt">
            ABORT, RETRY, HOME?
            <span className="nf-cursor" aria-hidden />
          </div>
          <div className="nf-keys">
            <button type="button" onClick={actions.a}>
              [A] ABORT
            </button>
            <button type="button" onClick={actions.r}>
              [R] RETRY
            </button>
            <button type="button" className="sel" onClick={actions.h}>
              [H] HOME
            </button>
            <button type="button" onClick={actions.d}>
              [D] DOCS
            </button>
          </div>
        </>
      )}
      {step < 1 && <span className="nf-cursor" aria-hidden />}
    </div>
  );
}
