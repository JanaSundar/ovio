import { createElement } from "react";
import { renderSvg } from "takumi-js";
import { describe, expect, it } from "vitest";
import type { Repository } from "@/components/ovio/repository-card/repository-card";
import { SAMPLE_DEVELOPER, SAMPLE_DOWNLOADS } from "@/content/samples";
import { DeveloperIdCardEmbed } from "@/lib/embed/developer-id-card";
import { NpmDownloadsEmbed } from "@/lib/embed/npm-downloads";
import { RepositoryCardEmbed } from "@/lib/embed/repository-card";
import type { Developer } from "@/lib/github";
import { WORLDS } from "@/lib/world";

/**
 * Embeds at their limits: the smallest and the largest a repo, package or profile can be. A
 * README row of cards only lines up when every card in a world is the same size, whatever it
 * holds, and no card may grow wider than its world draws it.
 */

const REPOS: Record<string, Repository> = {
  bare: { owner: "a", name: "b", stars: 0, forks: 0 },
  shadcn: {
    owner: "shadcn-ui",
    name: "ui",
    stars: 125_243,
    forks: 12_658,
    issues: 1_773,
    language: "TypeScript",
    description:
      "Composable, accessible components with thoughtful defaults. Build your own component library with code you can customize, extend, and make your own.",
  },
  // GitHub's limits: a 39-character owner, a 100-character name, a 350-character description.
  max: {
    owner: "an-extremely-long-organisation-name-39",
    name: "this-repository-name-is-as-long-as-github-allows-which-is-one-hundred-characters-in-total-ok-done",
    stars: 1_234_567,
    forks: 234_567,
    issues: 98_765,
    language: "Objective-C++",
    description: "word ".repeat(70).trim(),
  },
};

const weeks = (n: number, downloads: (i: number) => number) =>
  Array.from({ length: n }, (_, i) => ({
    week: new Date(Date.UTC(2026, 6, 6) + i * 7 * 864e5).toISOString().slice(0, 10),
    downloads: downloads(i),
  }));

// npm's limits: a 214-character scoped name, tens of millions a week, nothing, three weeks old.
const PACKAGES = {
  sample: { name: "lumen", data: SAMPLE_DOWNLOADS },
  huge: { name: "react", data: weeks(13, (i) => 31_000_000 + i * 1_400_000) },
  zero: { name: "quiet", data: weeks(13, () => 0) },
  young: { name: "fresh", data: weeks(3, (i) => [12, 0, 5_400][i]) },
  max: {
    name: `@${"s".repeat(60)}/${"p".repeat(150)}`,
    data: weeks(13, (i) => (i === 12 ? 99_999_999 : 1)),
  },
};

// GitHub's: a 255-character name, a 160-character bio, every field set, or only a name.
const DEVELOPERS: Record<string, Developer> = {
  sample: SAMPLE_DEVELOPER,
  bare: { name: "a" },
  max: {
    name: "Wolfeschlegelsteinhausenbergerdorff ".repeat(7).trim(),
    title: "Principal engineer ".repeat(8).trim(),
    stack: ["Jupyter Notebook", "Visual Basic .NET", "Objective-C++", "Vim Script"],
    github: "an-extremely-long-github-username-39chr",
    website: `https://${"w".repeat(80)}.example.com/`,
    location: "Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch, Wales",
    available: true,
    serial: "999",
    since: 2008,
  },
};

const size = (svg: string) =>
  svg
    .match(/width="([\d.]+)" height="([\d.]+)"/)!
    .slice(1)
    .join("×");

describe.each(WORLDS)("%s embeds", (world) => {
  it("draws every repository card the same size", async () => {
    const sizes = await Promise.all(
      Object.values(REPOS).map(async (repo) =>
        size(await renderSvg(createElement(RepositoryCardEmbed, { world, repo }))),
      ),
    );
    expect(sizes).toEqual(sizes.map(() => sizes[0]));
  });

  it("draws every npm chart the same size, and the receipt the same width", async () => {
    const sizes = await Promise.all(
      Object.values(PACKAGES).map(async ({ name, data }) =>
        size(await renderSvg(createElement(NpmDownloadsEmbed, { world, packageName: name, data }))),
      ),
    );
    // A receipt is as long as its weeks; everything else keeps one size.
    const compared = world === "craft" ? sizes.map((s) => s.split("×")[0]) : sizes;
    expect(compared).toEqual(compared.map(() => compared[0]));
  });

  it("keeps every ID card its world's width", async () => {
    const widths = await Promise.all(
      Object.values(DEVELOPERS).map(
        async (developer) =>
          size(await renderSvg(createElement(DeveloperIdCardEmbed, { world, developer }))).split(
            "×",
          )[0],
      ),
    );
    expect(widths).toEqual(widths.map(() => widths[0]));
  });
});
