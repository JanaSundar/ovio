import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEMOS } from "@/components/site/demos";
import { COMPONENTS } from "@/content/components";

/**
 * Every component folder has the same shape, so any one of them reads like the others:
 *
 *   <slug>.tsx       the component: props, data shaping, the world switch
 *   types.ts         the data it takes, plain types the fetchers in lib/ share
 *   demo.tsx         the docs demo (site only, not installed)
 *   parts.tsx        pieces two or more worlds share, or parts/ when there are several
 *   use-<name>.ts    hooks the worlds share
 *   <name>.ts        plain logic, no React, safe for server code (embeds, OG images)
 *   worlds/          minimal.tsx, craft.tsx, retro.tsx, toy.tsx
 */

const ROOT = "components/ovio";
const WORLDS = ["craft.tsx", "minimal.tsx", "retro.tsx", "toy.tsx"];
const slugs = readdirSync(ROOT).filter((d) => statSync(path.join(ROOT, d)).isDirectory());
const read = (file: string) => readFileSync(file, "utf8");

/** Every file under a folder, relative to it. */
function walk(dir: string, base = dir): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full, base) : [path.relative(base, full)];
  });
}

describe.each(slugs)("components/ovio/%s", (slug) => {
  const dir = path.join(ROOT, slug);
  const files = walk(dir);
  const top = files.filter((f) => !f.includes("/"));
  const folders = new Set(files.filter((f) => f.includes("/")).map((f) => f.split("/")[0]));

  it("has the component, its demo and all four worlds", () => {
    expect(top).toContain(`${slug}.tsx`);
    expect(top).toContain("demo.tsx");
    expect(files.filter((f) => f.startsWith("worlds/")).sort()).toEqual(
      WORLDS.map((w) => `worlds/${w}`),
    );
  });

  it("keeps everything else in its place", () => {
    const allowed = new Set([`${slug}.tsx`, "demo.tsx", "parts.tsx"]);
    expect(top.filter((f) => f.endsWith(".tsx") && !allowed.has(f))).toEqual([]);
    expect([...folders].filter((f) => f !== "worlds" && f !== "parts")).toEqual([]);
    expect(top.includes("parts.tsx") && folders.has("parts")).toBe(false);
  });

  it("keeps plain modules free of React", () => {
    const plain = top.filter((f) => f.endsWith(".ts") && !f.startsWith("use-"));
    for (const f of plain) {
      const source = read(path.join(dir, f));
      expect(source, f).not.toMatch(/^"use client"/);
      expect(source, f).not.toMatch(/^import (?!type )[^;]*from "(react|motion\/react)"/m);
    }
  });

  it("keeps types.ts to types", () => {
    if (!top.includes("types.ts")) return;
    const runtime = read(path.join(dir, "types.ts"))
      .split("\n")
      .filter((line) => /^(import|export) (?!type )/.test(line));
    expect(runtime).toEqual([]);
  });

  it("is listed everywhere the site and the registry look", () => {
    expect(COMPONENTS.some((c) => c.slug === slug)).toBe(true);
    expect(Object.keys(DEMOS)).toContain(slug);
    const registry = JSON.parse(read("registry.json")) as {
      items: { name: string; files: { path: string }[] }[];
    };
    const item = registry.items.find((i) => i.name === slug);
    expect(item?.files.map((f) => f.path).sort()).toEqual(
      files
        .filter((f) => f !== "demo.tsx")
        .map((f) => `${dir}/${f}`)
        .sort(),
    );
  });
});

it("has a folder for every catalogued component", () => {
  expect(COMPONENTS.map((c) => c.slug).sort()).toEqual([...slugs].sort());
  expect(Object.keys(DEMOS).sort()).toEqual([...slugs].sort());
});

it("lets the fetchers take only the data types, not whole components", () => {
  for (const file of ["lib/github.ts", "lib/npm.ts", "lib/music.ts"]) {
    const imports = [...read(file).matchAll(/from "@\/components\/ovio\/([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(
      imports.filter((i) => !i.endsWith("/types")),
      file,
    ).toEqual([]);
  }
});
