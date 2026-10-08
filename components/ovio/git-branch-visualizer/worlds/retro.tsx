"use client";

import { motion } from "motion/react";
import { AutoHeight } from "@/components/shared/auto-height";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { GitBranchVisualizerWorldProps } from "../git-branch-visualizer";
import { Graph, type GraphLook, type LabelProps, type NodeProps, type TagProps } from "../graph";
import { Counts, Cursor, Swap } from "../parts";

const LOOK: GraphLook = {
  colors: ["#6dff8a", "#ffd34d", "#ff9a4d", "#7fd8ff", "#ff7fd0"],
  hot: "#c9ffd2",
  curve: false,
  edgeWidth: 3,
  hotWidth: 5,
  cap: "square",
  crisp: true,
  labelWidth: 160,
  laneGap: 66,
  maxStep: 100,
  draw: motionTokens.retro.frames(10, 0.9),
  enter: motionTokens.retro.frames(1, 0.01),
  move: motionTokens.retro.frames(4, 0.24),
  stagger: 0.09,
};

const block =
  "cursor-pointer border-0 px-2.5 py-0.5 font-(family-name:--ovio-font) text-xl leading-tight uppercase disabled:cursor-default disabled:opacity-40";

function RetroNode({ node: n, ...s }: NodeProps) {
  const frame = useOvioTransition(motionTokens.retro.frames(1, 0.01));
  return (
    <>
      <motion.rect
        x={-13}
        y={-13}
        width={26}
        height={26}
        fill="none"
        stroke="#ffd34d"
        strokeWidth={2}
        initial={false}
        animate={{ opacity: s.selected ? 1 : 0 }}
        transition={frame}
      />
      <rect
        x={-7}
        y={-7}
        width={14}
        height={14}
        fill={n.merge ? "#ffd34d" : s.hot ? LOOK.hot : s.color}
        stroke={s.hot ? "#ffffff" : "#061108"}
        strokeWidth={2}
      />
      {n.merge && <rect x={-2} y={-2} width={4} height={4} fill="#061108" />}
      {s.head && (
        <text
          y={-17}
          textAnchor="middle"
          className="fill-(--ovio-muted) font-(family-name:--ovio-font) text-[15px]"
        >
          HEAD
        </text>
      )}
    </>
  );
}

function RetroLabel({ lane, ...s }: LabelProps) {
  return (
    <button
      type="button"
      aria-pressed={s.active}
      onClick={s.onToggle}
      className={cn(
        "flex h-full max-w-full cursor-pointer items-center truncate border-0 px-1.5 font-(family-name:--ovio-font) text-[21px] leading-none",
        s.active ? "bg-[#0f2a14]" : "bg-transparent",
      )}
      style={{ color: s.color }}
    >
      {s.active ? ">" : ""}
      {lane.name}
    </button>
  );
}

function RetroTag({ text }: TagProps) {
  return (
    <span className="block bg-[#ffd34d] px-1 text-base leading-[1.1] whitespace-nowrap text-(--ovio-on-accent) [text-shadow:none]">
      {text}
    </span>
  );
}

export function RetroGitBranchVisualizer({
  graph,
  current,
  status,
  head,
  actions,
  repo,
  className,
  ...rest
}: GitBranchVisualizerWorldProps) {
  const folder = (repo?.split("/").pop() ?? "repo").toUpperCase();

  return (
    <section
      data-ovio-world="retro"
      aria-label={repo ? `Commit graph of ${repo}` : "Commit graph"}
      className={cn(
        "relative w-full max-w-[880px] min-w-0 overflow-hidden border-4 border-double border-(--ovio-accent) bg-[radial-gradient(ellipse_at_50%_40%,#0c2412_0%,#061108_75%)] font-(family-name:--ovio-font) text-(--ovio-ink) [text-shadow:var(--ovio-glow)]",
        className,
      )}
    >
      <div className="flex justify-between gap-3 bg-(--ovio-accent) px-2.5 py-0.5 text-xl text-(--ovio-on-accent) [text-shadow:none]">
        <span className="min-w-0">
          C:\{folder}&gt; <span className="whitespace-nowrap">git log --graph</span>
        </span>
        <span aria-hidden>[X]</span>
      </div>

      {actions && (
        <div className="flex flex-wrap gap-2.5 px-4 pt-3">
          <button
            type="button"
            disabled={!actions.mergeTarget}
            onClick={actions.merge}
            className={cn(block, "bg-(--ovio-accent) text-(--ovio-on-accent) [text-shadow:none]")}
          >
            [ {actions.mergeTarget ? `merge ${actions.mergeTarget}` : "all merged"} ]
          </button>
          <button
            type="button"
            disabled={!actions.branchFrom}
            onClick={actions.branch}
            className={cn(block, "bg-[#ffd34d] text-(--ovio-on-accent) [text-shadow:none]")}
          >
            [ branch from {actions.branchFrom ?? "HEAD"} ]
          </button>
          <button
            type="button"
            disabled={!actions.dirty}
            onClick={actions.reset}
            className={cn(block, "border border-(--ovio-ink-2) bg-transparent text-(--ovio-ink)")}
          >
            [ reset ]
          </button>
        </div>
      )}

      <Graph
        {...rest}
        graph={graph}
        look={LOOK}
        className="px-2 pt-1"
        Node={RetroNode}
        Label={RetroLabel}
        Tag={RetroTag}
      />

      <AutoHeight className="mx-4 border-t border-dashed border-(--ovio-faint) pt-2 pb-1 text-[21px] leading-[1.15]">
        {current && (
          <Swap
            id={current.commit.id}
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            transition={motionTokens.retro.frames(1, 0.01)}
          >
            <div className="break-words">
              <span className="text-[#ffd34d]">[{current.short}]</span> {current.commit.message}
            </div>
            <div className="break-words text-(--ovio-muted)">
              {current.meta}
              {current.merge && " · MERGE"}
            </div>
          </Swap>
        )}
        <div className="flex text-[#c9ffd2]" aria-live="polite">
          <Swap
            id={status}
            from={{ clipPath: "inset(0 100% 0 0)" }}
            to={{ clipPath: "inset(0 0% 0 0)" }}
            transition={motionTokens.retro.frames(status.length + 2, (status.length + 2) * 0.03)}
          >
            &gt; {status}
          </Swap>
          <Cursor />
        </div>
      </AutoHeight>

      <div className="flex flex-wrap justify-between gap-x-4 px-4 pb-2.5 text-[21px] text-(--ovio-muted)">
        <span>HEAD → {head}</span>
        <Counts commits={graph.nodes.length} branches={graph.lanes.length} />
      </div>
      <div aria-hidden className="ovio-scanlines" />
    </section>
  );
}
