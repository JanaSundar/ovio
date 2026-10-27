import { describe, expect, it } from "vitest";
import { SPECS, propsOf } from "@/components/registry/playables/specs";
import { INTERACTIONS } from "@/content/interactions";
import { CATEGORIES } from "@/content/interactions/types";
import { RECIPES } from "@/content/recipes";
import { defaultsOf, sanitize, usageSnippet, type Control } from "@/lib/registry/controls";
import {
  DEFAULT_QUERY,
  isFiltered,
  parseQuery,
  queryRegistry,
  queryString,
  registryCounts,
} from "@/lib/registry/query";

const params = (s: string) => new URLSearchParams(s);
const q = (patch: Partial<typeof DEFAULT_QUERY>) =>
  queryRegistry(INTERACTIONS, { ...DEFAULT_QUERY, ...patch });

describe("the registry catalogue", () => {
  it("has unique slugs, a spec for every interaction and nothing else", () => {
    const slugs = INTERACTIONS.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(Object.keys(SPECS).sort()).toEqual([...slugs].sort());
  });

  it("claims no platform beyond the web, since no native implementation exists", () => {
    for (const i of INTERACTIONS) expect(i.platforms).toEqual(["web"]);
  });

  it("files every interaction under at least one known purpose, with 2–3 tags", () => {
    const ids = new Set<string>(CATEGORIES.map((c) => c.id));
    for (const i of INTERACTIONS) {
      expect(i.categories.length).toBeGreaterThan(0);
      for (const c of i.categories) expect(ids).toContain(c);
      expect(i.tags.length).toBeGreaterThanOrEqual(2);
      expect(i.tags.length).toBeLessThanOrEqual(3);
      expect(i.added).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("builds recipes only from interactions it has", () => {
    const slugs = new Set(INTERACTIONS.map((i) => i.slug));
    for (const r of RECIPES) for (const u of r.uses) expect(slugs).toContain(u);
  });
});

describe("search, filters and sort", () => {
  it("searches names, descriptions, purposes, tags and platforms, every word", () => {
    expect(q({ q: "knob" }).map((i) => i.slug)).toContain("physical-knob");
    expect(q({ q: "right-click" }).map((i) => i.slug)).toEqual(
      expect.arrayContaining(["context-menu", "dial-menu"]),
    );
    expect(
      q({ q: "data visualization github" }).every((i) =>
        i.categories.includes("data-visualization"),
      ),
    ).toBe(true);
    expect(q({ q: "expo" })).toEqual([]);
    expect(q({ q: "web" })).toHaveLength(INTERACTIONS.length);
    expect(q({ q: "zzz-nothing" })).toEqual([]);
  });

  it("filters by platform honestly: nothing is native, so native and both are empty", () => {
    expect(q({ platform: "web" })).toHaveLength(INTERACTIONS.length);
    expect(q({ platform: "native" })).toEqual([]);
    expect(q({ platform: "both" })).toEqual([]);
  });

  it("narrows by category, collection, featured and new", () => {
    expect(
      q({ category: "contextual-actions" })
        .map((i) => i.slug)
        .sort(),
    ).toEqual(["context-menu", "dial-menu"]);
    expect(q({ collection: "new" }).every((i) => i.isNew)).toBe(true);
    expect(q({ highlight: "featured" }).every((i) => i.featured)).toBe(true);
  });

  it("sorts by rank, by newest with rank breaking ties, and by name", () => {
    expect(q({}).map((i) => i.rank)).toEqual(INTERACTIONS.map((_, k) => k));
    const newest = q({ sort: "newest" });
    for (let k = 1; k < newest.length; k++)
      expect(newest[k - 1].added >= newest[k].added).toBe(true);
    const named = q({ sort: "name" }).map((i) => i.name);
    expect(named).toEqual([...named].sort((a, b) => a.localeCompare(b)));
  });

  it("counts every sidebar entry from the data", () => {
    const counts = registryCounts(INTERACTIONS);
    expect(counts.all).toBe(INTERACTIONS.length);
    expect(counts.platforms).toEqual({ web: INTERACTIONS.length, native: 0, both: 0 });
    for (const c of CATEGORIES) expect(counts.categories[c.id]).toBe(q({ category: c.id }).length);
  });

  it("round-trips a query through the URL and ignores what it doesn't know", () => {
    const query = {
      ...DEFAULT_QUERY,
      q: "menu",
      platform: "web" as const,
      category: "navigation" as const,
      sort: "name" as const,
    };
    expect(parseQuery(params(queryString(query).slice(1)))).toEqual(query);
    expect(parseQuery(params("platform=ios&category=nope&sort=up&show=x"))).toEqual(DEFAULT_QUERY);
    expect(queryString(DEFAULT_QUERY)).toBe("");
    expect(isFiltered(DEFAULT_QUERY)).toBe(false);
    expect(isFiltered({ ...DEFAULT_QUERY, sort: "name" })).toBe(false);
    expect(isFiltered({ ...DEFAULT_QUERY, q: "x" })).toBe(true);
  });
});

describe("controls and the usage snippet", () => {
  const range: Control = {
    kind: "range",
    prop: "size",
    label: "Size",
    min: 10,
    max: 20,
    step: 1,
    default: 12,
  };

  it("keeps values inside what a control allows", () => {
    expect(sanitize(range, 99)).toBe(20);
    expect(sanitize(range, "abc")).toBe(12);
    expect(
      sanitize(
        {
          kind: "select",
          prop: "a",
          label: "A",
          options: [{ value: "x", label: "X" }],
          default: "x",
        },
        "y",
      ),
    ).toBe("x");
    expect(
      sanitize({ kind: "text", prop: "t", label: "T", default: "", maxLength: 3 }, "abcdef"),
    ).toBe("abc");
  });

  it("prints only props that differ from the component's own defaults", () => {
    const code = usageSnippet({
      exportName: "Knob",
      importPath: "@/k",
      usage: "  data={data}",
      props: { size: 12, label: "Level", on: true, range: [1, 2] },
      defaults: { size: 12 },
    });
    expect(code).toBe(
      'import { Knob } from "@/k"\n\n<Knob\n  data={data}\n  label="Level"\n  on\n  range={[1, 2]}\n/>',
    );
  });

  it("gives every spec's defaults a snippet that compiles to the component's real props", () => {
    for (const [slug, spec] of Object.entries(SPECS)) {
      const props = propsOf(spec, defaultsOf(spec.controls));
      for (const v of Object.values(props))
        expect(["string", "number", "boolean", "object"]).toContain(typeof v);
      expect(spec.height, slug).toBeGreaterThan(0);
    }
  });

  it("turns the slider's two-thumb switch into a [low, high] default on the step", () => {
    const spec = SPECS["fluid-range-slider"];
    const values = { ...defaultsOf(spec.controls), range: true, step: "10", max: 200 };
    expect(propsOf(spec, values)).toMatchObject({ defaultValue: [50, 150], step: 10 });
  });
});
