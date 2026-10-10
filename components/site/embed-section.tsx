"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { useWorld } from "@/components/shared/world-provider";
import { SITE_URL } from "@/content/components";
import { track } from "@/lib/analytics";
import {
  EMBEDS,
  embedMarkdown,
  embedPath,
  parseEmbed,
  PROBLEM_HEADER,
  samplePath,
  type EmbedSlug,
} from "@/lib/embed/params";
import { CopyCommand } from "./copy-command";
import { DemoLabel } from "./live-demo";

/** Long enough that typing a name doesn't request an image per keystroke. */
const SETTLE_MS = 500;

type Shown = { src: string; live: boolean };

/**
 * The smallest an embed is drawn, as a share of its own size, before the stage scrolls sideways
 * instead: below this its text gets too small to read. A pinned card fits a 320px phone above it,
 * as GitHub's mobile view shows one.
 */
const READABLE = 0.6;

/**
 * A docs page's README embed: type a repo, package or user, see the image in the page's world,
 * copy the Markdown. Like the demos, the preview never shows a failure: when GitHub can't answer
 * it shows the embed drawn from sample data, labelled as such. The name field appears only once
 * the example has loaded live; with sample data alone there is nothing to try. A name that isn't
 * valid yet keeps the last preview.
 */
export function EmbedSection({ slug }: { slug: EmbedSlug }) {
  const world = useWorld();
  const { param, example, field } = EMBEDS[slug];
  const [input, setInput] = useState<string>(example);
  const [subject, setSubject] = useState<string>(example);
  const [shown, setShown] = useState<Shown | null>(null);
  const [canTry, setCanTry] = useState(false);

  const valid = !("problem" in parseEmbed(slug, new URLSearchParams({ [param]: input.trim() })));
  useEffect(() => {
    if (!valid) return;
    const id = setTimeout(() => setSubject(input.trim()), SETTLE_MS);
    return () => clearTimeout(id);
  }, [input, valid]);

  // One request per image: a live one becomes an object URL, a problem swaps in the sample.
  useEffect(() => {
    let objectUrl: string | undefined;
    let stale = false;
    const sample = { src: samplePath(slug, world), live: false };
    fetch(embedPath(slug, subject, world))
      .then(async (res) => {
        if (!res.ok || res.headers.has(PROBLEM_HEADER)) return sample;
        objectUrl = URL.createObjectURL(await res.blob());
        return { src: objectUrl, live: true };
      })
      .catch(() => sample)
      .then((next) => {
        if (stale) return;
        setShown(next);
        if (next.live) setCanTry(true);
      });
    return () => {
      stale = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [slug, subject, world]);

  // Never smaller than readable: past that, the stage scrolls.
  const onLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    img.style.minWidth = `${Math.round(img.naturalWidth * READABLE)}px`;
  };

  return (
    <>
      {canTry && (
        <label className="embed-field">
          <span>{field}</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={example}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
          />
        </label>
      )}
      <div className="embed-stage">
        {shown ? (
          <>
            <DemoLabel live={shown.live}>
              {shown.live ? `Live · ${subject}` : "Sample data"}
            </DemoLabel>
            <div className="embed-scroll">
              {/* The embed itself, an SVG from /embed exactly as a README shows it. */}
              {/* oxlint-disable-next-line next/no-img-element */}
              <img
                src={shown.src}
                alt={`${subject}, as the README embed shows it`}
                onLoad={onLoad}
              />
            </div>
          </>
        ) : (
          <div role="status" aria-label="Loading the embed" className="demo-skeleton" />
        )}
      </div>
      <CopyCommand
        command={embedMarkdown(SITE_URL, slug, subject, world)}
        variant="install-box"
        onCopy={() => track("embed_markdown_copied", { component_slug: slug, design_world: world })}
      />
    </>
  );
}
