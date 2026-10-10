import { createElement } from "react";
import { renderSvg } from "takumi-js";
import { describe, expect, it } from "vitest";
import type { Repository } from "@/components/ovio/repository-card/repository-card";
import { RepositoryCardEmbed } from "@/lib/embed/repository-card";
import { WORLDS } from "@/lib/world";

/**
 * Embeds at their limits: the smallest and the largest a GitHub repo can be. A README row
 * of cards only lines up when every card in a world is the same size, whatever it holds.
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
});
