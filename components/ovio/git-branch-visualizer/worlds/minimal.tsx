"use client";

import { motion } from "motion/react";
import { AutoHeight } from "@/components/shared/auto-height";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { GitBranchVisualizerWorldProps } from "../git-branch-visualizer";
import { Graph, type GraphLook, type LabelProps, type NodeProps, type TagProps } from "../graph";
import { Counts, Cursor, Swap } from "../parts";

const LOOK: GraphLook = {
  colors: ["#161614", "#8d8a82", "#2f9a45", "#3178c6", "#c0bdb5"],
  hot: "#161614",
  curve: true,
  edgeWidth: 1.75,
  hotWidth: 3,
  cap: "round",
  labelWidth: 140,
  laneGap: 64,
  maxStep: 100,
  draw: { duration: 0.32, ease: [0.2, 0, 0, 1] },
  enter: motionTokens.minimal.slow,
  move: motionTokens.minimal.slow,
  stagger: 0.04,
  // A faint dot grid.
  canvas: "radial-gradient(circle, rgba(22,22,20,.13) 1px, transparent 1.5px) 0 0 / 20px 20px",
};

const button =
  "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium disabled:cursor-default disabled:opacity-40";

function MinimalNode({ node: n, ...s }: NodeProps) {
  const fast = useOvioTransition(motionTokens.minimal.base);
  return (
    <>
      <motion.circle
        fill="none"
        stroke="var(--ovio-ink)"
        strokeWidth={1.25}
        initial={false}
        animate={{ r: s.selected ? 12 : 6, opacity: s.selected ? 1 : 0 }}
        transition={fast}
      />
      <motion.circle
        fill="var(--ovio-surface)"
        strokeWidth={2}
        initial={false}
        animate={{ r: s.hot ? 7 : 6, stroke: s.hot ? LOOK.hot : s.color }}
        transition={fast}
      />
      {n.merge && <circle r={2.5} fill="var(--ovio-ink)" />}
      {s.head && (
        <text
          y={-16}
          textAnchor="middle"
          className="fill-(--ovio-muted) font-(family-name:--ovio-mono) text-[10px]"
        >
          HEAD
        </text>
      )}
    </>
  );
}

function MinimalLabel({ lane, ...s }: LabelProps) {
  return (
    <button
      type="button"
      aria-pressed={s.active}
      onClick={s.onToggle}
      className={cn(
        "flex h-full max-w-full cursor-pointer items-center truncate rounded-md border-0 px-2 text-[13px] font-medium transition-colors",
        s.active ? "bg-(--ovio-track)" : "bg-transparent",
      )}
      style={{ color: s.color }}
    >
      {lane.name}
    </button>
  );
}

function MinimalTag({ text }: TagProps) {
  return (
    <span className="rounded px-1.5 py-px font-(family-name:--ovio-mono) text-[11px] whitespace-nowrap text-white bg-(--ovio-ink)">
      {text}
    </span>
  );
}

export function MinimalGitBranchVisualizer({
  graph,
  current,
  status,
  head,
  actions,
  repo,
  className,
  ...rest
}: GitBranchVisualizerWorldProps) {
  return (
    <section
      data-ovio-world="minimal"
      aria-label={repo ? `Commit graph of ${repo}` : "Commit graph"}
      className={cn(
        "w-full max-w-[880px] min-w-0 rounded-[10px] border border-(--ovio-line) bg-(--ovio-surface) font-(family-name:--ovio-font) text-(--ovio-ink)",
        className,
      )}
    >
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-(--ovio-line-2) px-4 py-3.5 text-xs text-(--ovio-muted)">
        <span className="font-(family-name:--ovio-mono)">git log --graph</span>
        {repo && <span>{repo}</span>}
      </div>

      {actions && (
        <div className="flex flex-wrap gap-2 px-4 pt-3">
          <button
            type="button"
            disabled={!actions.mergeTarget}
            onClick={actions.merge}
            className={cn(button, "border border-(--ovio-ink) bg-(--ovio-ink) text-white")}
          >
            {actions.mergeTarget ? `Merge ${actions.mergeTarget}` : "All merged"}
          </button>
          <button
            type="button"
            disabled={!actions.branchFrom}
            onClick={actions.branch}
            className={cn(button, "border border-(--ovio-line) bg-(--ovio-surface)")}
          >
            Branch from{" "}
            <span className="font-(family-name:--ovio-mono)">{actions.branchFrom ?? "HEAD"}</span>
          </button>
          <button
            type="button"
            disabled={!actions.dirty}
            onClick={actions.reset}
            className={cn(button, "border border-transparent bg-transparent text-(--ovio-muted)")}
          >
            Reset
          </button>
        </div>
      )}

      <Graph
        {...rest}
        graph={graph}
        look={LOOK}
        className="px-2 pt-1"
        Node={MinimalNode}
        Label={MinimalLabel}
        Tag={MinimalTag}
      />

      <AutoHeight className="mx-4 border-t border-(--ovio-line-2) pt-2.5 pb-1 text-[13px] leading-[1.45]">
        {current && (
          <Swap id={current.commit.id} transition={motionTokens.minimal.base}>
            <div className="break-words">
              <span className="font-(family-name:--ovio-mono) text-(--ovio-muted)">
                {current.short}
              </span>{" "}
              {current.commit.message}
            </div>
            <div className="text-(--ovio-muted)">
              {current.meta}
              {current.merge && " · merge"}
            </div>
          </Swap>
        )}
        <div className="font-(family-name:--ovio-mono) text-xs" aria-live="polite">
          &gt; {status}
          <Cursor className="ml-0.5 text-[10px]" />
        </div>
      </AutoHeight>

      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-4 pt-1 pb-3 text-xs text-(--ovio-muted)">
        <span>
          HEAD → <span className="text-(--ovio-ink)">{head}</span>
        </span>
        <Counts commits={graph.nodes.length} branches={graph.lanes.length} />
      </div>
    </section>
  );
}
