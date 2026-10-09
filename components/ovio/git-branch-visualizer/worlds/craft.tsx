"use client";

import { motion } from "motion/react";
import { AutoHeight } from "@/components/shared/auto-height";
import { ease, motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { GitBranchVisualizerWorldProps } from "../git-branch-visualizer";
import { Graph, type GraphLook, type LabelProps, type NodeProps, type TagProps } from "../graph";
import { Counts, Swap } from "../parts";

const LOOK: GraphLook = {
  colors: ["#2a1f14", "#b8471f", "#2b4a9b", "#2f9a45", "#8a5a9b"],
  hot: "#e0713a",
  curve: true,
  edgeWidth: 2.5,
  hotWidth: 4,
  cap: "round",
  wobble: 2.5,
  labelWidth: 150,
  laneGap: 68,
  maxStep: 100,
  draw: { duration: 0.45, ease: [0.45, 0, 0.25, 1] },
  enter: motionTokens.craft.base,
  move: motionTokens.craft.base,
  stagger: 0.05,
  // Blue-ruled graph paper.
  canvas:
    "linear-gradient(rgba(43,74,155,.1) 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, rgba(43,74,155,.1) 1px, transparent 1px) 0 0 / 22px 22px",
};

/** A pencil loop around the selected commit: a little over one turn, radius wobbling. */
const LOOP = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 28; i++) {
    const a = Math.PI * (0.15 + (i / 28) * 2.25);
    const r = 13 + 1.3 * Math.sin(a * 3);
    pts.push(`${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`);
  }
  return `M${pts.join("L")}`;
})();

const tagButton =
  "cursor-pointer border-0 px-2.5 py-1 font-(family-name:--ovio-font) text-[13px] font-bold text-(--ovio-ink) shadow-[0_3px_6px_-2px_rgba(70,45,20,.4)] disabled:cursor-default disabled:opacity-45";

function CraftNode({ node: n, ...s }: NodeProps) {
  const settle = useOvioTransition(motionTokens.craft.base);
  const pencil = useOvioTransition({ duration: 0.3, ease: ease.minimal });
  return (
    <>
      <motion.path
        d={LOOP}
        fill="none"
        stroke="var(--ovio-accent-deep)"
        strokeWidth={2}
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: s.selected ? 1 : 0, opacity: s.selected ? 1 : 0 }}
        transition={pencil}
      />
      <motion.circle
        fill="var(--ovio-surface)"
        strokeWidth={2.5}
        initial={false}
        animate={{ r: s.hot ? 8.5 : 7, stroke: s.hot ? LOOK.hot : s.color }}
        transition={settle}
      />
      {n.merge && <circle r={3} fill="var(--ovio-ink)" />}
      {s.head && (
        <text
          y={-17}
          textAnchor="middle"
          transform="rotate(-6)"
          className="fill-(--ovio-accent-deep) font-(family-name:--ovio-hand) text-[17px] font-bold"
        >
          HEAD
        </text>
      )}
    </>
  );
}

function CraftLabel({ lane, ...s }: LabelProps) {
  const settle = useOvioTransition(motionTokens.craft.base);
  return (
    <button
      type="button"
      aria-pressed={s.active}
      onClick={s.onToggle}
      className="relative flex h-full max-w-full cursor-pointer items-center border-0 bg-transparent px-1.5 text-sm font-extrabold tracking-[-0.01em]"
      style={{ color: s.color }}
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-[60%] -translate-y-1/2 -skew-x-6 bg-[#ffe27a]"
        initial={false}
        animate={{ scaleX: s.active ? 1 : 0, opacity: s.active ? 0.8 : 0 }}
        transition={settle}
        style={{ originX: 0 }}
      />
      <span className="relative truncate">{lane.name}</span>
    </button>
  );
}

function CraftTag({ text }: TagProps) {
  return (
    <span className="block -rotate-4 rounded-[2px] bg-[#ffe27a] px-1.5 text-[11px] leading-[1.4] font-semibold whitespace-nowrap shadow-[0_2px_3px_-1px_rgba(70,45,20,.35)]">
      {text}
    </span>
  );
}

export function CraftGitBranchVisualizer({
  graph,
  current,
  status,
  head,
  actions,
  repo,
  className,
  ...rest
}: GitBranchVisualizerWorldProps) {
  const settle = useOvioTransition(motionTokens.craft.base);

  const paperTag = (tilt: number) => ({
    initial: false as const,
    animate: { rotate: tilt, y: 0 },
    whileHover: { rotate: 0, y: -2 },
    whileTap: { y: 1 },
    transition: settle,
  });

  return (
    <section
      data-ovio-world="craft"
      aria-label={repo ? `Commit graph of ${repo}` : "Commit graph"}
      className={cn(
        "relative w-full max-w-[880px] min-w-0 rounded-[6px] bg-(--ovio-surface) font-(family-name:--ovio-font) text-(--ovio-ink) shadow-(--ovio-shadow)",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 h-6 w-[92px] -translate-x-1/2 rotate-2 bg-(--ovio-tape)"
      />
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 px-[18px] pt-5">
        <h3 className="m-0 text-lg font-extrabold tracking-[-0.03em]">Repository log</h3>
        {repo && (
          <span className="font-(family-name:--ovio-hand) text-xl leading-none font-bold text-(--ovio-accent-deep)">
            {repo}
          </span>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 px-[18px] pt-3">
          <motion.button
            type="button"
            disabled={!actions.mergeTarget}
            onClick={actions.merge}
            className={cn(tagButton, "bg-[#ffe27a]")}
            {...paperTag(-1.5)}
          >
            {actions.mergeTarget ? `merge ${actions.mergeTarget}` : "all merged"}
          </motion.button>
          <motion.button
            type="button"
            disabled={!actions.branchFrom}
            onClick={actions.branch}
            className={cn(tagButton, "bg-[#f2c9a0]")}
            {...paperTag(1)}
          >
            branch from{" "}
            <span className="font-(family-name:--ovio-mono) text-xs">
              {actions.branchFrom ?? "HEAD"}
            </span>
          </motion.button>
          <button
            type="button"
            disabled={!actions.dirty}
            onClick={actions.reset}
            className="cursor-pointer border-0 bg-transparent px-1 font-(family-name:--ovio-hand) text-2xl leading-none font-bold text-(--ovio-accent-deep) disabled:cursor-default disabled:opacity-40"
          >
            start over
          </button>
        </div>
      )}

      <Graph
        {...rest}
        graph={graph}
        look={LOOK}
        className="px-2 pt-1"
        Node={CraftNode}
        Label={CraftLabel}
        Tag={CraftTag}
      />

      <AutoHeight className="mx-[18px] border-t border-dashed border-(--ovio-faint) pt-2.5 pb-1 text-sm leading-[1.4]">
        {current && (
          <Swap
            id={current.commit.id}
            from={{ opacity: 0, y: 8, rotate: -1 }}
            to={{ opacity: 1, y: 0, rotate: 0 }}
            transition={motionTokens.craft.base}
          >
            <div className="break-words">
              <span className="font-(family-name:--ovio-mono) text-[13px] text-[#2b4a9b]">
                {current.short}
              </span>{" "}
              <span className="font-bold">{current.commit.message}</span>
            </div>
            <div className="text-(--ovio-muted)">
              {current.meta}
              {current.merge && " · merge"}
            </div>
          </Swap>
        )}
        <div
          className="font-(family-name:--ovio-hand) text-[22px] leading-tight font-bold text-(--ovio-accent-deep)"
          aria-live="polite"
        >
          → {status}
        </div>
      </AutoHeight>

      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-[18px] pt-1 pb-4 text-[13px] text-(--ovio-muted)">
        <span>
          HEAD → <span className="font-bold text-(--ovio-ink)">{head}</span>
        </span>
        <Counts commits={graph.nodes.length} branches={graph.lanes.length} />
      </div>
    </section>
  );
}
