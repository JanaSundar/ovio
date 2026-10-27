"use client";

import { useMemo } from "react";
import { highlight } from "@/components/site/highlight";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

/** Highlighted code with a header and a button that copies exactly what is shown. */
export function CodeView({
  code,
  title,
  lang = "tsx",
  html,
  className,
}: {
  code: string;
  title: string;
  lang?: "tsx" | "shell" | "json";
  /** Already highlighted on the server, when the code is static. */
  html?: string;
  className?: string;
}) {
  const markup = useMemo(() => html ?? highlight(code, lang), [code, lang, html]);
  return (
    <div className={cn("overflow-hidden rounded-xl border border-seam", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-seam bg-deck px-3 py-1.5">
        <span className="truncate font-mono text-[11px] text-haze">{title}</span>
        <CopyButton text={code} label="Copy code" />
      </div>
      <pre className="reg-code reg-scroll m-0 max-h-[420px] overflow-auto px-4 py-3.5 font-mono text-[12.5px] leading-[1.7]">
        <code dangerouslySetInnerHTML={{ __html: markup }} />
      </pre>
    </div>
  );
}
