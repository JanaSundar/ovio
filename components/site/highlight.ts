import { createHighlighter, renderNodesToHtml, renderTokens } from "@tanstack/highlight/core";
import { json } from "@tanstack/highlight/languages/json";
import { shell } from "@tanstack/highlight/languages/shell";
import { tsx } from "@tanstack/highlight/languages/tsx";

const highlighter = createHighlighter({ languages: [json, shell, tsx] });

/** Escaped token markup for the inside of a <code>; the th-* token colours live in globals.css. */
export const highlight = (code: string, lang: "json" | "shell" | "tsx" = "tsx") =>
  renderNodesToHtml(renderTokens(highlighter.tokenize(code, { lang }).tokens));
