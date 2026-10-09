"use client";

import { motion } from "motion/react";
import { AutoHeight } from "@/components/shared/auto-height";
import { ToyKey } from "@/components/shared/toy";
import { motionTokens, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { GitBranchVisualizerWorldProps } from "../git-branch-visualizer";
import { Graph, type GraphLook, type LabelProps, type NodeProps, type TagProps } from "../graph";
import { Counts, Cursor, Swap } from "../parts";

const LOOK: GraphLook = {
  colors: ["#2c55e0", "#ef4f2b", "#f4b52a", "#33b07a", "#9b59d0"],
  hot: "#1e1d1a",
  curve: false,
  edgeWidth: 8,
  hotWidth: 10,
  cap: "round",
  shine: true,
  labelWidth: 150,
  laneGap: 72,
  maxStep: 100,
  draw: { duration: 0.4, ease: [0.3, 0, 0.2, 1] },
  enter: motionTokens.toy.piece,
  move: motionTokens.toy.slide,
  stagger: 0.045,
};

/** How far a bead's plastic side shows below its face. */
const SIDE = 3;

const key =
  "flex cursor-pointer items-center gap-1.5 rounded-[11px] border-0 px-3.5 py-2 font-(family-name:--ovio-font) text-[13px] font-extrabold touch-manipulation disabled:cursor-default disabled:opacity-50";

function ToyNode({ node: n, ...s }: NodeProps) {
  const spring = useOvioTransition(motionTokens.toy.key);
  return (
    <>
      {/* Centred on the whole bead, side included, which is also where it scales from. */}
      <motion.circle
        cy={SIDE / 2}
        fill="none"
        stroke="var(--ovio-ink)"
        strokeWidth={3}
        initial={false}
        animate={{ r: s.selected ? 17 : 10, opacity: s.selected ? 1 : 0 }}
        transition={spring}
      />
      <motion.g initial={false} animate={{ scale: s.hot ? 1.15 : 1 }} transition={spring}>
        <circle r={11} cy={SIDE} fill={s.color} />
        <circle r={11} cy={SIDE} fill="rgba(0,0,0,.3)" />
        <circle r={11} fill={s.color} />
        <circle r={4} cx={-3.5} cy={-3.5} fill="#fff" opacity={0.4} />
        {n.merge && <circle r={4} fill="var(--ovio-ink)" />}
      </motion.g>
      {s.head && (
        <text
          y={-22}
          textAnchor="middle"
          className="fill-(--ovio-muted) font-(family-name:--ovio-font) text-[11px] font-extrabold tracking-[0.06em]"
        >
          HEAD
        </text>
      )}
    </>
  );
}

function ToyLabel({ lane, ...s }: LabelProps) {
  return (
    <ToyKey
      depth={s.narrow ? 3 : 4}
      side={s.active ? "rgba(0,0,0,.35)" : "#cfc8b8"}
      aria-pressed={s.active}
      onClick={s.onToggle}
      className="flex h-full max-w-full cursor-pointer items-center truncate rounded-lg border-0 px-2.5 font-(family-name:--ovio-font) text-xs font-extrabold touch-manipulation"
      animate={{
        backgroundColor: s.active ? s.color : "#ffffff",
        color: s.active ? "#ffffff" : s.color,
      }}
    >
      {lane.name}
    </ToyKey>
  );
}

function ToyTag({ text }: TagProps) {
  return (
    <span className="block rounded-md bg-(--ovio-red) px-1.5 py-px text-[11px] font-extrabold whitespace-nowrap text-white shadow-[0_3px_0_var(--ovio-red-deep)]">
      {text}
    </span>
  );
}

export function ToyGitBranchVisualizer({
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
      data-ovio-world="toy"
      aria-label={repo ? `Commit graph of ${repo}` : "Commit graph"}
      className={cn(
        "w-full max-w-[880px] min-w-0 rounded-[24px] bg-(--ovio-surface) pb-1 font-(family-name:--ovio-font) text-(--ovio-ink) shadow-[inset_0_1px_0_#fff,0_8px_0_#d2ccbf,0_28px_34px_-16px_rgba(40,28,10,.45)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-[18px] pt-4 text-xs text-(--ovio-muted)">
        <span className="font-(family-name:--ovio-mono) font-semibold">git log --graph</span>
        {repo && <span className="font-bold">{repo}</span>}
      </div>

      {actions && (
        <div className="flex flex-wrap gap-2.5 px-[18px] pt-3 pb-1.5">
          <ToyKey
            depth={5}
            side="var(--ovio-accent-deep)"
            disabled={!actions.mergeTarget}
            onClick={actions.merge}
            className={cn(key, "bg-(--ovio-accent) text-(--ovio-on-accent)")}
          >
            {actions.mergeTarget ? `Merge ${actions.mergeTarget}` : "All merged"}
          </ToyKey>
          <ToyKey
            depth={5}
            side="var(--ovio-yellow-deep)"
            disabled={!actions.branchFrom}
            onClick={actions.branch}
            className={cn(key, "bg-(--ovio-yellow) text-(--ovio-ink)")}
          >
            Branch from
            <span className="font-(family-name:--ovio-mono) text-xs">
              {actions.branchFrom ?? "HEAD"}
            </span>
          </ToyKey>
          <ToyKey
            depth={5}
            side="#cfc8b8"
            disabled={!actions.dirty}
            onClick={actions.reset}
            className={cn(key, "bg-white text-(--ovio-ink)")}
          >
            Reset
          </ToyKey>
        </div>
      )}

      <Graph
        {...rest}
        graph={graph}
        look={LOOK}
        className="px-2 pt-1"
        Node={ToyNode}
        Label={ToyLabel}
        Tag={ToyTag}
      />

      <div className="mx-3.5 mt-1 mb-2.5 rounded-[14px] bg-[#e6e1d6] px-3.5 shadow-[inset_0_3px_5px_rgba(40,28,10,.25)]">
        <AutoHeight className="py-2.5 text-sm leading-[1.45]">
          {current && (
            <Swap
              id={current.commit.id}
              from={{ opacity: 0, y: 10, scale: 0.96 }}
              to={{ opacity: 1, y: 0, scale: 1 }}
              transition={motionTokens.toy.slide}
            >
              <div className="break-words">
                <span className="font-(family-name:--ovio-mono) font-semibold text-(--ovio-red)">
                  {current.short}
                </span>{" "}
                <span className="font-extrabold">{current.commit.message}</span>
              </div>
              <div className="text-(--ovio-muted)">
                {current.meta}
                {current.merge && " · merge"}
              </div>
            </Swap>
          )}
          <div className="font-(family-name:--ovio-mono) text-xs font-semibold" aria-live="polite">
            &gt; {status}
            <Cursor className="ml-0.5" />
          </div>
        </AutoHeight>
      </div>

      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-[18px] pb-3 text-xs font-bold text-(--ovio-muted)">
        <span>
          HEAD → <span className="text-(--ovio-ink)">{head}</span>
        </span>
        <Counts commits={graph.nodes.length} branches={graph.lanes.length} />
      </div>
    </section>
  );
}
