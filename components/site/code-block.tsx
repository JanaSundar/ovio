import { cn } from "@/lib/utils";

/** A dark code block over highlighted token markup (see highlight.ts). */
export function CodeBlock({ html, className }: { html: string; className?: string }) {
  return (
    <pre
      className={cn(
        "m-0 overflow-auto bg-ink px-5 py-[18px] font-mono text-[13px] leading-[1.7] text-[#e6e4dd]",
        className,
      )}
    >
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}
