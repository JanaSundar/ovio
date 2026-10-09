import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { shapeCommitGraph } = await import("@/lib/github");
type HistoryCommit = import("@/lib/github").HistoryCommit;

const commit = (oid: string, parents: string[], headline = oid, body = ""): HistoryCommit => ({
  oid,
  messageHeadline: headline,
  messageBody: body,
  committedDate: "2026-10-01T00:00:00Z",
  author: { name: "Ada" },
  parents: { nodes: parents.map((p) => ({ oid: p })) },
});

/**
 * Newest first, like GitHub's history: `straight` commits pushed onto main above a run of pull
 * request merges, each bringing in `size` commits branched off the main commit below it.
 */
function history(straight: number, merges: number[]) {
  let below = "root";
  const older: HistoryCommit[] = [commit("root", [])];
  merges.forEach((size, m) => {
    const ids = Array.from({ length: size }, (_, i) => `pr${m}-${i}`);
    ids.forEach((id, i) => older.unshift(commit(id, [i ? ids[i - 1] : below])));
    const merge = commit(
      `merge${m}`,
      [below, ids.at(-1)!],
      `Merge pull request #${m + 1} from owner/feat/pr${m}`,
      `PR ${m} title`,
    );
    older.unshift(merge);
    below = merge.oid;
  });
  for (let i = 0; i < straight; i++) {
    const c = commit(`direct${i}`, [below]);
    older.unshift(c);
    below = c.oid;
  }
  return older;
}

function expectValid(graph: ReturnType<typeof shapeCommitGraph>) {
  const seen = new Set<string>();
  for (const c of graph) {
    for (const p of c.parents ?? []) expect(seen.has(p)).toBe(true);
    seen.add(c.id);
  }
}

describe("shapeCommitGraph", () => {
  it("skips a long straight run to show the merges below it", () => {
    const graph = shapeCommitGraph(history(12, [2, 3, 2]), "main", 14);
    expect(graph.length).toBeLessThanOrEqual(14);
    expectValid(graph);
    expect(new Set(graph.map((c) => c.branch))).toEqual(
      new Set(["main", "feat/pr0", "feat/pr1", "feat/pr2"]),
    );
    // The tip joins straight onto the newest merge kept.
    expect(graph.at(-1)!.id).toBe("direct11");
    expect(graph.find((c) => c.id === "merge2")?.message).toBe("PR 2 title (#3)");
  });

  it("fills spare room with the newest straight commits", () => {
    const graph = shapeCommitGraph(history(12, [2]), "main", 8);
    expectValid(graph);
    expect(graph).toHaveLength(8);
    expect(graph.filter((c) => c.branch === "feat/pr0")).toHaveLength(2);
  });

  it("never goes past the limit with no merges", () => {
    const graph = shapeCommitGraph(history(30, []), "main", 14);
    expect(graph).toHaveLength(14);
    expectValid(graph);
    expect(graph.at(-1)!.id).toBe("direct29");
  });
});
