import { describe, expect, it } from "vitest";
import { docSections } from "@/content/components";
import { embedMarkdown, embedPath, parseEmbed } from "@/lib/embed/params";

const q = (query: Record<string, string>) => new URLSearchParams(query);

/** What parseEmbed says is wrong, or "" when nothing is. */
const problem = (query: Record<string, string>) => {
  const r = parseEmbed("repository-card", q(query));
  return "problem" in r ? r.problem : "";
};

describe("parseEmbed", () => {
  it("reads the repo, defaulting to Minimal as SVG", () => {
    expect(parseEmbed("repository-card", q({ repo: "honojs/hono" }))).toEqual({
      slug: "repository-card",
      subject: "honojs/hono",
      world: "minimal",
      format: "svg",
    });
    expect(
      parseEmbed("repository-card", q({ repo: "honojs/hono", world: "toy", format: "png" })),
    ).toEqual({ slug: "repository-card", subject: "honojs/hono", world: "toy", format: "png" });
  });

  it("says what's missing or wrong, in the format asked for", () => {
    expect(parseEmbed("repository-card", q({}))).toEqual({
      problem: "Add ?repo=JanaSundar/ovio to the URL",
      format: "svg",
    });
    expect(parseEmbed("repository-card", q({ format: "png" }))).toHaveProperty("format", "png");
    expect(problem({ repo: "hono" })).toMatch(/not a GitHub owner\/name/);
    expect(problem({ repo: "-bad/name" })).toMatch(/not a GitHub owner\/name/);
    expect(problem({ repo: "a--b/name" })).toMatch(/not a GitHub owner\/name/);
    expect(problem({ repo: "a/b", world: "neon" })).toMatch(/^world/);
    expect(problem({ repo: "a/b", format: "gif" })).toMatch(/^format/);
  });

  it("accepts dots and underscores in repo names, not in owners", () => {
    expect(problem({ repo: "vercel/next.js" })).toBe("");
    expect(problem({ repo: "a/b_c-d.e" })).toBe("");
    expect(problem({ repo: "ada.park/lumen" })).toMatch(/not a GitHub/);
  });
});

describe("embed URLs", () => {
  it("leaves the default world out and the repo slash unescaped", () => {
    expect(embedPath("repository-card", "honojs/hono", "minimal")).toBe(
      "/embed/repository-card?repo=honojs/hono",
    );
    expect(embedPath("repository-card", "honojs/hono", "retro")).toBe(
      "/embed/repository-card?repo=honojs/hono&world=retro",
    );
  });

  it("links the image to the repo on GitHub", () => {
    expect(embedMarkdown("https://ovio.dev", "repository-card", "honojs/hono", "craft")).toBe(
      "[![honojs/hono](https://ovio.dev/embed/repository-card?repo=honojs/hono&world=craft)](https://github.com/honojs/hono)",
    );
  });

  it("offers a README embed only where public data exists for anyone", () => {
    expect(docSections("repository-card").map((s) => s.id)).toContain("embed");
    expect(docSections("contribution-graph").map((s) => s.id)).not.toContain("embed");
    expect(docSections("physical-knob").map((s) => s.id)).not.toContain("embed");
  });
});
