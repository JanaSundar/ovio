"use client";

import { type ComponentType, useMemo, useState, type KeyboardEvent } from "react";
import { useWorld, type World } from "@/components/shared/world-provider";
import { formatShortDate } from "@/lib/format";
import { keyToIndex } from "@/lib/keys";
import { MinimalGitBranchVisualizer } from "./worlds/minimal";
import { CraftGitBranchVisualizer } from "./worlds/craft";
import { RetroGitBranchVisualizer } from "./worlds/retro";
import { ToyGitBranchVisualizer } from "./worlds/toy";

export type GitCommit = {
  /** Commit SHA; the first seven characters are shown. */
  id: string;
  branch: string;
  message: string;
  author: string;
  /** ISO 8601. */
  date: string;
  /** Parent ids, first parent first. Two parents make a merge. */
  parents?: string[];
  /** Release tag drawn above the commit, e.g. "v1.0.0". */
  tag?: string;
};

export type GitBranchVisualizerProps = {
  /** History, oldest first: every parent comes before its children. */
  commits: GitCommit[];
  variant?: World;
  /** Checked-out branch. Defaults to the first commit's branch. */
  head?: string;
  /** Header label, e.g. "ada-dev/lumen". */
  repo?: string;
  /** Selected commit id, controlled. */
  value?: string;
  /** Selected commit id at first. Defaults to the newest commit. */
  defaultValue?: string;
  onValueChange?: (id: string, commit: GitCommit) => void;
  /** Shows the merge, branch and reset controls, which play changes out locally. Default true. */
  actions?: boolean;
  /** Fires with the merge commit the merge control makes. */
  onMerge?: (commit: GitCommit) => void;
  /** Fires with the new branch's name and the commit it starts from. */
  onBranch?: (branch: string, from: GitCommit) => void;
  className?: string;
};

export type GraphNode = {
  commit: GitCommit;
  short: string;
  /** Column, counted from the oldest commit. */
  col: number;
  lane: number;
  merge: boolean;
  /** Made by the merge or branch controls, so it enters after the graph has drawn. */
  local: boolean;
  /** One line of detail: branch, author, date, tag. */
  meta: string;
};

export type GraphEdge = {
  id: string;
  from: GraphNode;
  to: GraphNode;
  /** How it leaves its lane: along it, out to a new branch, or back in as a merge. */
  kind: "straight" | "branch" | "merge";
  /** Lane whose colour it takes. */
  lane: number;
};

export type GraphLane = { name: string; index: number };

export type GitGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  lanes: GraphLane[];
  cols: number;
};

/** Everything a world needs to draw the graph and its controls. Worlds only render; state lives here. */
export type GitBranchVisualizerWorldProps = {
  graph: GitGraph;
  /** The commit shown in the detail panel: hovered, else selected. */
  current?: GraphNode;
  selected?: string;
  /** Ids lit up around the current commit: itself, its parents and children. */
  near: Set<string>;
  /** Branch picked from the lane labels; the others dim. */
  focusBranch: string | null;
  head: string;
  headId?: string;
  status: string;
  hover: (id: string | null) => void;
  select: (id: string) => void;
  toggleBranch: (name: string) => void;
  onNodeKeyDown: (e: KeyboardEvent, id: string) => void;
  /** Null when the controls are hidden. */
  actions: {
    /** Branch the merge control would merge into head, or null when all are merged. */
    mergeTarget: string | null;
    /** Short SHA the branch control branches from, or null when no more lanes fit. */
    branchFrom: string | null;
    dirty: boolean;
    merge: () => void;
    branch: () => void;
    reset: () => void;
  } | null;
  repo?: string;
  className?: string;
};

/** Lanes the palettes colour; branching stops once they are all used. */
const MAX_LANES = 5;

const now = () => new Date().toISOString();

/** A stable fake SHA for commits the controls make. */
function fakeSha(seed: string): string {
  let h = 0x811c9dc5;
  let out = "";
  for (let round = 0; out.length < 40; round++) {
    for (const ch of seed + round) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193);
    out += (h >>> 0).toString(16).padStart(8, "0");
  }
  return out.slice(0, 40);
}

/**
 * Columns and lanes: a commit sits one column after its latest parent and after the commit
 * before it on its lane. Head's lane is on top; other branches follow in order of appearance.
 */
function layout(commits: GitCommit[], head: string, local: Set<string>): GitGraph {
  const names = [head, ...new Set(commits.map((c) => c.branch).filter((b) => b !== head))];
  const laneOf = new Map(names.map((n, i) => [n, i]));
  const byId = new Map<string, GraphNode>();
  const lastCol: number[] = [];
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const commit of commits) {
    const lane = laneOf.get(commit.branch) ?? 0;
    const parents = (commit.parents ?? []).flatMap((p) => byId.get(p) ?? []);
    const col = Math.max(0, ...parents.map((p) => p.col + 1), (lastCol[lane] ?? -1) + 1);
    lastCol[lane] = col;
    const node: GraphNode = {
      commit,
      short: commit.id.slice(0, 7),
      col,
      lane,
      merge: parents.length > 1,
      local: local.has(commit.id),
      meta: [commit.branch, commit.author, formatShortDate(commit.date), commit.tag]
        .filter(Boolean)
        .join(" · "),
    };
    byId.set(commit.id, node);
    nodes.push(node);
    parents.forEach((from, k) => {
      const kind = from.lane === lane ? "straight" : k > 0 ? "merge" : "branch";
      edges.push({
        id: `${from.commit.id}-${commit.id}`,
        from,
        to: node,
        kind,
        lane: kind === "merge" ? from.lane : lane,
      });
    });
  }

  const used = new Set(nodes.map((n) => n.lane));
  return {
    nodes,
    edges,
    lanes: names.map((name, index) => ({ name, index })).filter((l) => used.has(l.index)),
    cols: Math.max(1, ...nodes.map((n) => n.col + 1)),
  };
}

/** Every commit reachable from `id` through its parents, itself included. */
function ancestors(id: string | undefined, byId: Map<string, GitCommit>): Set<string> {
  const seen = new Set<string>();
  const stack = id ? [id] : [];
  while (stack.length) {
    const c = byId.get(stack.pop()!);
    if (!c || seen.has(c.id)) continue;
    seen.add(c.id);
    stack.push(...(c.parents ?? []));
  }
  return seen;
}

const VIEWS = {
  minimal: MinimalGitBranchVisualizer,
  craft: CraftGitBranchVisualizer,
  retro: RetroGitBranchVisualizer,
  toy: ToyGitBranchVisualizer,
} satisfies Record<World, ComponentType<GitBranchVisualizerWorldProps>>;

export function GitBranchVisualizer({
  commits,
  variant,
  head: headProp,
  repo,
  value: valueProp,
  defaultValue,
  onValueChange,
  actions = true,
  onMerge,
  onBranch,
  className,
}: GitBranchVisualizerProps) {
  const world = useWorld(variant);
  const head = headProp ?? commits[0]?.branch ?? "main";
  const [local, setLocal] = useState<GitCommit[]>([]);
  const [inner, setInner] = useState(defaultValue);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focusBranch, setFocusBranch] = useState<string | null>(null);
  const [status, setStatus] = useState("ready");

  const all = useMemo(() => [...commits, ...local], [commits, local]);
  const graph = useMemo(
    () => layout(all, head, new Set(local.map((c) => c.id))),
    [all, local, head],
  );
  const byId = useMemo(() => new Map(all.map((c) => [c.id, c])), [all]);
  const nodeOf = useMemo(() => new Map(graph.nodes.map((n) => [n.commit.id, n])), [graph]);

  const tips = new Map(all.map((c) => [c.branch, c.id]));
  const headId = tips.get(head);
  const selected = valueProp ?? inner ?? all[all.length - 1]?.id;
  const current =
    nodeOf.get(hovered ?? "") ?? nodeOf.get(selected ?? "") ?? nodeOf.get(headId ?? "");

  const near = new Set<string>();
  if (current) {
    near.add(current.commit.id);
    current.commit.parents?.forEach((p) => near.add(p));
    for (const c of all) if (c.parents?.includes(current.commit.id)) near.add(c.id);
  }

  const setSelected = (commit: GitCommit) => {
    if (valueProp === undefined) setInner(commit.id);
    onValueChange?.(commit.id, commit);
  };

  const select = (id: string) => {
    const commit = byId.get(id);
    if (!commit || id === selected) return;
    setSelected(commit);
    setStatus(`checkout ${id.slice(0, 7)}`);
  };

  // Left and Right walk the columns; Up and Down hop to the nearest commit on the next lane.
  const order = [...graph.nodes].sort((a, b) => a.col - b.col || a.lane - b.lane);
  const onNodeKeyDown = (e: KeyboardEvent, id: string) => {
    const at = order.findIndex((n) => n.commit.id === id);
    const node = order[at];
    if (!node) return;
    let next: GraphNode | undefined;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const dir = e.key === "ArrowUp" ? -1 : 1;
      const lanes = graph.lanes.map((l) => l.index);
      const li = lanes.indexOf(node.lane) + dir;
      if (li >= 0 && li < lanes.length) {
        next = order
          .filter((n) => n.lane === lanes[li])
          .reduce<GraphNode | undefined>(
            (best, n) =>
              !best || Math.abs(n.col - node.col) < Math.abs(best.col - node.col) ? n : best,
            undefined,
          );
      }
    } else if (e.key === "Enter" || e.key === " ") {
      next = node;
    } else {
      const i = keyToIndex(e.key, at, order.length);
      if (i !== null) next = order[i];
    }
    if (!next) return;
    e.preventDefault();
    select(next.commit.id);
  };

  const toggleBranch = (name: string) => {
    const next = focusBranch === name ? null : name;
    setFocusBranch(next);
    setStatus(next ? `log ${next}` : "ready");
  };

  const reachable = ancestors(headId, byId);
  const mergeable = graph.lanes
    .map((l) => l.name)
    .filter((b) => b !== head && !reachable.has(tips.get(b) ?? ""));
  const selectedBranch = byId.get(selected ?? "")?.branch;
  const mergeTarget = mergeable.find((b) => b === selectedBranch) ?? mergeable[0] ?? null;
  const from = byId.get(selected ?? "") ?? byId.get(headId ?? "");

  const merge = () => {
    const tip = mergeTarget && tips.get(mergeTarget);
    if (!tip || !headId) return;
    const seed = `${headId}${tip}${all.length}`;
    const commit: GitCommit = {
      id: fakeSha(seed),
      branch: head,
      message: `Merge branch '${mergeTarget}' into ${head}`,
      author: "you",
      date: now(),
      parents: [headId, tip],
    };
    setLocal((l) => [...l, commit]);
    setSelected(commit);
    setFocusBranch(null);
    setStatus(`merge ${mergeTarget}... done`);
    onMerge?.(commit);
  };

  const branch = () => {
    if (!from || graph.lanes.length >= MAX_LANES) return;
    const taken = new Set(all.map((c) => c.branch));
    let name = "hotfix";
    for (let n = 2; taken.has(name); n++) name = `hotfix-${n}`;
    const date = now();
    const first: GitCommit = {
      id: fakeSha(`${from.id}${name}`),
      branch: name,
      message: `fix: patch from ${from.id.slice(0, 7)}`,
      author: "you",
      date,
      parents: [from.id],
    };
    const second: GitCommit = {
      id: fakeSha(`${first.id}${name}`),
      branch: name,
      message: "test: cover the fix",
      author: "you",
      date,
      parents: [first.id],
    };
    setLocal((l) => [...l, first, second]);
    setSelected(second);
    setFocusBranch(null);
    setStatus(`checkout -b ${name}`);
    onBranch?.(name, from);
  };

  const reset = () => {
    setLocal([]);
    setFocusBranch(null);
    setHovered(null);
    setStatus("ready");
    const first = byId.get(defaultValue ?? commits[commits.length - 1]?.id ?? "");
    if (first && first.id !== selected) setSelected(first);
  };

  const props: GitBranchVisualizerWorldProps = {
    graph,
    current,
    selected,
    near,
    focusBranch,
    head,
    headId,
    status,
    hover: setHovered,
    select,
    toggleBranch,
    onNodeKeyDown,
    actions: actions
      ? {
          mergeTarget,
          branchFrom: from && graph.lanes.length < MAX_LANES ? from.id.slice(0, 7) : null,
          dirty: local.length > 0 || focusBranch !== null,
          merge,
          branch,
          reset,
        }
      : null,
    repo,
    className,
  };

  const View = VIEWS[world] ?? VIEWS.minimal;
  return <View {...props} />;
}
