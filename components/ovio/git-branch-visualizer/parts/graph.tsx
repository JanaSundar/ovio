"use client";

import { motion, type Transition } from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent,
} from "react";
import { useOvioTransition, useReducedMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { GitBranchVisualizerWorldProps, GraphLane, GraphNode } from "../git-branch-visualizer";

/** How a world draws the graph. */
export type GraphLook = {
  /** Lane colours, top lane first. */
  colors: string[];
  /** Colour of the edges around the current commit. */
  hot: string;
  /** Curved branch and merge edges; false draws them square, like a terminal. */
  curve: boolean;
  edgeWidth: number;
  hotWidth: number;
  cap: "round" | "square";
  crisp?: boolean;
  /** How far straight edges bow, in px, so they read as drawn by hand. */
  wobble?: number;
  /** A thin highlight along each edge, for plastic tubes. */
  shine?: boolean;
  /** Width of the lane label column on wide stages. */
  labelWidth: number;
  laneGap: number;
  /** Widest gap between columns. */
  maxStep: number;
  /** Edges drawing in, and nodes popping in after them. */
  draw: Transition;
  enter: Transition;
  /** Position and colour changes. */
  move: Transition;
  /** Delay between columns as the graph first draws, in seconds. */
  stagger: number;
  /** CSS background under the plot. It moves with it, so a wide history pans like a canvas. */
  canvas: string;
};

export type NodeProps = {
  node: GraphNode;
  color: string;
  hot: boolean;
  selected: boolean;
  head: boolean;
};

export type LabelProps = {
  lane: GraphLane;
  color: string;
  active: boolean;
  narrow: boolean;
  onToggle: () => void;
};

export type TagProps = { text: string; color: string };

type GraphProps = Pick<
  GitBranchVisualizerWorldProps,
  | "graph"
  | "selected"
  | "near"
  | "focusBranch"
  | "headId"
  | "hover"
  | "select"
  | "onNodeKeyDown"
  | "toggleBranch"
> & {
  look: GraphLook;
  Node: ComponentType<NodeProps>;
  Label: ComponentType<LabelProps>;
  Tag: ComponentType<TagProps>;
  className?: string;
};

/** Below this the lane labels move from a left column to above each lane. */
const NARROW = 520;
const PAD = 22;
const DIM = 0.25;
/** Columns never get closer than this; past it the plot scrolls sideways instead. */
const MIN_STEP = 44;
/** Width of the fade that shows there's more to scroll to. */
const FADE = 28;

const r1 = (n: number) => Math.round(n * 10) / 10;

function edgePath(
  [x1, y1]: [number, number],
  [x2, y2]: [number, number],
  kind: "straight" | "branch" | "merge",
  step: number,
  curve: boolean,
  bow = 0,
): string {
  if (kind === "straight" || y1 === y2)
    return `M${x1} ${y1}Q${r1((x1 + x2) / 2)} ${y1 + bow} ${x2} ${y2}`;
  const s = Math.min(step, x2 - x1);
  // A branch leaves in its first column then runs on; a merge runs along and joins in its last.
  const x = kind === "branch" ? x1 : x2 - s;
  const start = kind === "branch" ? `M${x1} ${y1}` : `M${x1} ${y1}H${r1(x)}`;
  const turn = curve
    ? `C${r1(x + s / 2)} ${y1} ${r1(x + s / 2)} ${y2} ${r1(x + s)} ${y2}`
    : `H${r1(x + s / 2)}V${y2}H${r1(x + s)}`;
  return `${start}${turn}H${x2}`;
}

/** The commit graph: SVG edges and nodes, with HTML lane labels and tags laid over it. */
export function Graph({
  graph,
  selected,
  near,
  focusBranch,
  headId,
  hover,
  select,
  onNodeKeyDown,
  toggleBranch,
  look,
  Node,
  Label,
  Tag,
  className,
}: GraphProps) {
  const reduced = useReducedMotionSafe();
  const move = useOvioTransition(look.move);
  const draw = useOvioTransition(look.draw);
  const enter = useOvioTransition(look.enter);
  const wrap = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);
  const [more, setMore] = useState({ before: false, after: false });

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keyboard moves the selection; focus follows it when it is already in the graph.
  useEffect(() => {
    const el = svg.current;
    if (!el || !selected || !el.contains(document.activeElement)) return;
    el.querySelector<SVGGElement>(`[data-id="${CSS.escape(selected)}"]`)?.focus();
  }, [selected]);

  const narrow = width < NARROW;
  // The plot sits beside the lane labels; when its columns would crowd, it grows wider and scrolls.
  const plot = Math.max(0, width - (narrow ? 0 : look.labelWidth));
  const left = PAD;
  const fit = graph.cols > 1 ? (plot - 2 * PAD) / (graph.cols - 1) : 0;
  const step = graph.cols > 1 ? Math.max(MIN_STEP, Math.min(look.maxStep, fit)) : 0;
  const inner = Math.max(plot, 2 * PAD + (graph.cols - 1) * step);
  const scrolls = inner > plot;
  // HEAD sits above its commit, so a tag there moves up to clear it.
  const lift = (n: GraphNode) => (n.commit.id === headId ? 14 : 0);
  const headNode = graph.nodes.find((n) => n.commit.id === headId);
  const top = 42 + (headNode?.commit.tag ? 14 : 0);
  const row = new Map(graph.lanes.map((l, i) => [l.index, i]));
  const height = top + (graph.lanes.length - 1) * look.laneGap + 34;
  const at = (n: GraphNode): [number, number] => [
    r1(left + n.col * step),
    top + (row.get(n.lane) ?? 0) * look.laneGap,
  ];
  const colorOf = (lane: number) => look.colors[lane % look.colors.length];
  const laneName = new Map(graph.lanes.map((l) => [l.index, l.name]));
  const dim = (lane: number) => (focusBranch && laneName.get(lane) !== focusBranch ? DIM : 1);
  const delayOf = (n: GraphNode) => (reduced ? 0 : n.local ? 0 : n.col * look.stagger);

  const measure = () => {
    const el = scroller.current;
    if (!el) return;
    const before = el.scrollLeft > 1;
    const after = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setMore((m) => (m.before === before && m.after === after ? m : { before, after }));
  };

  // A scrolling plot keeps the selected commit in view: the newest at first, then wherever the
  // keyboard or the actions move it.
  const selectedX = graph.nodes.find((n) => n.commit.id === selected)?.col;
  const shown = useRef(false);
  useEffect(() => {
    const el = scroller.current;
    if (!el || selectedX === undefined) return;
    if (scrolls) {
      const x = left + selectedX * step;
      if (x < el.scrollLeft + FADE * 2 || x > el.scrollLeft + el.clientWidth - FADE * 2)
        el.scrollTo({
          left: x - el.clientWidth / 2,
          behavior: reduced || !shown.current ? "auto" : "smooth",
        });
      shown.current = true;
    }
    measure();
    // Scroll only when the selection or the plot's size changes, not on every render.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [selectedX, step, inner, scrolls]);

  // Mouse and pen drag a wide plot sideways like a canvas; touch already pans it natively. The
  // drag starts past a few pixels, so a click still selects a commit.
  const pan = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const panned = useRef(false);
  const [panning, setPanning] = useState(false);
  const startPan = (e: PointerEvent<HTMLDivElement>) => {
    panned.current = false;
    if (!scrolls || e.pointerType === "touch" || e.button !== 0) return;
    pan.current = { id: e.pointerId, x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  };
  const movePan = (e: PointerEvent<HTMLDivElement>) => {
    const p = pan.current;
    if (p?.id !== e.pointerId) return;
    const dx = e.clientX - p.x;
    if (!p.moved) {
      if (Math.abs(dx) < 4) return;
      p.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setPanning(true);
    }
    e.currentTarget.scrollLeft = p.left - dx;
  };
  const endPan = (e: PointerEvent<HTMLDivElement>) => {
    if (pan.current?.id !== e.pointerId) return;
    panned.current = pan.current.moved;
    pan.current = null;
    setPanning(false);
  };

  const edges = graph.edges
    .map((e) => ({ ...e, hot: near.has(e.from.commit.id) && near.has(e.to.commit.id) }))
    .sort((a, b) => Number(a.hot) - Number(b.hot));

  const label = (lane: GraphLane) => (
    <Label
      lane={lane}
      color={colorOf(lane.index)}
      active={focusBranch === lane.name}
      narrow={narrow}
      onToggle={() => toggleBranch(lane.name)}
    />
  );

  return (
    <div ref={wrap} className={cn("w-full", className)}>
      {narrow && width > 0 && (
        <div
          role="group"
          aria-label="Branches"
          className="flex flex-wrap gap-x-2 gap-y-2 px-2.5 pt-2 pb-1.5"
        >
          {graph.lanes.map((lane) => (
            <motion.div
              key={lane.name}
              className="flex h-6 items-center"
              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: dim(lane.index), scale: 1 }}
              transition={enter}
            >
              {label(lane)}
            </motion.div>
          ))}
        </div>
      )}
      <div className="flex">
        {!narrow && width > 0 && (
          <motion.div
            className="relative shrink-0"
            style={{ width: look.labelWidth }}
            initial={false}
            animate={{ height }}
            transition={move}
          >
            {graph.lanes.map((lane) => {
              const place = { y: top + (row.get(lane.index) ?? 0) * look.laneGap - 14 };
              return (
                <motion.div
                  key={lane.name}
                  className="absolute top-0 left-1"
                  style={{ width: look.labelWidth - 8 }}
                  initial={reduced ? false : place}
                  animate={{ ...place, opacity: dim(lane.index) }}
                  transition={move}
                >
                  <motion.div
                    className="flex h-7 items-center"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={enter}
                  >
                    {label(lane)}
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
        <div
          ref={scroller}
          onScroll={measure}
          onPointerDown={startPan}
          onPointerMove={movePan}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          onClickCapture={(e) => {
            // The click that ends a drag isn't a selection.
            if (panned.current) e.stopPropagation();
          }}
          className={cn(
            "min-w-0 flex-1",
            scrolls &&
              "overflow-x-auto overflow-y-hidden [scrollbar-width:none] select-none [&::-webkit-scrollbar]:hidden",
            scrolls && (panning ? "cursor-grabbing" : "cursor-grab"),
          )}
          style={
            scrolls
              ? {
                  maskImage: `linear-gradient(to right, ${more.before ? "transparent" : "#000"}, #000 ${FADE}px, #000 calc(100% - ${FADE}px), ${more.after ? "transparent" : "#000"})`,
                }
              : undefined
          }
        >
          <div
            className="relative"
            style={{ width: scrolls ? inner : "100%", background: look.canvas }}
          >
            <motion.svg
              ref={svg}
              role="listbox"
              aria-label="Commits"
              aria-orientation="horizontal"
              width={scrolls ? inner : "100%"}
              initial={false}
              animate={{ height }}
              transition={move}
              className="block overflow-visible"
              shapeRendering={look.crisp ? "crispEdges" : undefined}
            >
              {width > 0 && (
                <>
                  <g>
                    {edges.map((e) => {
                      const bow = (look.wobble ?? 0) * (e.to.col % 2 ? 1 : -1);
                      const d = edgePath(at(e.from), at(e.to), e.kind, step, look.curve, bow);
                      const color = e.hot ? look.hot : colorOf(e.lane);
                      const strokeWidth = e.hot ? look.hotWidth : look.edgeWidth;
                      const drawIn = {
                        ...draw,
                        delay: reduced ? 0 : e.to.local ? 0 : delayOf(e.from),
                      };
                      return (
                        <g key={e.id}>
                          <motion.path
                            fill="none"
                            strokeLinecap={look.cap}
                            strokeLinejoin={look.cap === "round" ? "round" : "miter"}
                            initial={reduced ? false : { pathLength: 0 }}
                            animate={{
                              pathLength: 1,
                              d,
                              stroke: color,
                              strokeWidth,
                              opacity: dim(e.lane),
                            }}
                            transition={{ default: move, pathLength: drawIn }}
                          />
                          {look.shine && (
                            <motion.path
                              fill="none"
                              stroke="#fff"
                              strokeLinecap="round"
                              strokeWidth={2}
                              className="pointer-events-none"
                              initial={reduced ? false : { pathLength: 0 }}
                              animate={{
                                pathLength: 1,
                                d,
                                opacity: dim(e.lane) * 0.35,
                                y: -strokeWidth / 4,
                              }}
                              transition={{ default: move, pathLength: drawIn }}
                            />
                          )}
                        </g>
                      );
                    })}
                  </g>
                  {graph.nodes.map((n) => {
                    const [x, y] = at(n);
                    const id = n.commit.id;
                    const hot = near.has(id);
                    const isSelected = id === selected;
                    return (
                      <motion.g
                        key={id}
                        data-id={id}
                        role="option"
                        aria-selected={isSelected}
                        aria-label={`${n.short} ${n.commit.message}, ${n.meta}`}
                        tabIndex={isSelected ? 0 : -1}
                        className="cursor-pointer outline-none"
                        initial={false}
                        animate={{ x, y, opacity: dim(n.lane) }}
                        transition={move}
                        onPointerEnter={(e) => e.pointerType === "mouse" && hover(id)}
                        onPointerLeave={() => hover(null)}
                        onClick={() => select(id)}
                        onKeyDown={(e) => onNodeKeyDown(e, id)}
                      >
                        <motion.g
                          initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            ...enter,
                            delay: reduced ? 0 : n.local ? 0.45 : delayOf(n) + 0.15,
                          }}
                        >
                          <circle r={18} fill="transparent" />
                          <Node
                            node={n}
                            color={colorOf(n.lane)}
                            hot={hot}
                            selected={isSelected}
                            head={id === headId}
                          />
                        </motion.g>
                      </motion.g>
                    );
                  })}
                </>
              )}
            </motion.svg>
            {width > 0 &&
              graph.nodes
                .filter((n) => n.commit.tag)
                .map((n) => {
                  const [x, y] = at(n);
                  return (
                    <motion.div
                      key={`${n.commit.id}-tag`}
                      className="absolute top-0 left-0"
                      initial={reduced ? false : { x, y: y - 40 - lift(n) }}
                      animate={{ x, y: y - 40 - lift(n), opacity: dim(n.lane) }}
                      transition={move}
                    >
                      <motion.div
                        className="-translate-x-1/2"
                        initial={reduced ? false : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...enter, delay: delayOf(n) + 0.3 }}
                      >
                        <Tag text={n.commit.tag!} color={colorOf(n.lane)} />
                      </motion.div>
                    </motion.div>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
}
