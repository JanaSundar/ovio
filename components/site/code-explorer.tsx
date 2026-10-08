"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ease, useOvioTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";
import { useCopy } from "./copy-command";

/** A source file with its highlighted markup, made on the server. */
export type SourceFile = { path: string; html: string };

type Folder = { kind: "folder"; name: string; path: string; children: Node[] };
type Node = Folder | { kind: "file"; name: string; path: string; file: number };

/** A visible row of the tree, in reading order. */
type Row = { node: Node; level: number; parent?: string };

const SIDEBAR = 232;
const NARROW = "(max-width: 639px)";
const SLIDE = { duration: 0.28, ease: ease.minimal };

/**
 * Folders from the file paths, rooted at their shared folder (components/ovio/<slug>/ becomes
 * <slug>/). Folders sort first, then names, as in VS Code.
 */
function buildTree(files: SourceFile[]): Folder {
  const split = files.map((f) => f.path.split("/"));
  let common = 0;
  while (split.every((p) => p.length > common + 1 && p[common] === split[0][common])) common++;
  const root: Folder = { kind: "folder", name: "", path: "", children: [] };
  split.forEach((parts, file) => {
    let dir = root;
    parts.slice(Math.max(common - 1, 0)).forEach((name, i, rest) => {
      const path = rest.slice(0, i + 1).join("/");
      if (i === rest.length - 1) {
        dir.children.push({ kind: "file", name, path, file });
        return;
      }
      let next = dir.children.find((c): c is Folder => c.kind === "folder" && c.name === name);
      if (!next) dir.children.push((next = { kind: "folder", name, path, children: [] }));
      dir = next;
    });
  });
  const sort = (n: Node) => {
    if (n.kind === "file") return;
    n.children.sort((a, b) =>
      a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "folder" ? -1 : 1,
    );
    n.children.forEach(sort);
  };
  sort(root);
  return root;
}

function visibleRows(nodes: Node[], open: Set<string>, level = 1, parent?: string): Row[] {
  return nodes.flatMap((node) => [
    { node, level, parent },
    ...(node.kind === "folder" && open.has(node.path)
      ? visibleRows(node.children, open, level + 1, node.path)
      : []),
  ]);
}

function allFolders(n: Node): string[] {
  return n.kind === "folder" ? [n.path, ...n.children.flatMap(allFolders)].filter(Boolean) : [];
}

const EXT_COLOR: Record<string, string> = { tsx: "#61dafb", ts: "#4f9fe8", json: "#e6c27f" };

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop() ?? "";
  const color = EXT_COLOR[ext] ?? "#8d8b83";
  if (ext === "tsx")
    return (
      <svg viewBox="0 0 16 16" className="size-3.5 flex-none" aria-hidden>
        <g fill="none" stroke={color} strokeWidth="1.1">
          <ellipse cx="8" cy="8" rx="6.6" ry="2.6" />
          <ellipse cx="8" cy="8" rx="6.6" ry="2.6" transform="rotate(60 8 8)" />
          <ellipse cx="8" cy="8" rx="6.6" ry="2.6" transform="rotate(120 8 8)" />
        </g>
        <circle cx="8" cy="8" r="1.3" fill={color} />
      </svg>
    );
  return (
    <span
      aria-hidden
      className="w-3.5 flex-none text-center font-sans text-[8.5px] leading-none font-bold"
      style={{ color }}
    >
      {ext === "ts" ? "TS" : ext === "json" ? "{}" : "•"}
    </span>
  );
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 flex-none" aria-hidden fill="#c9a86a">
      {open ? (
        <path d="M1.5 3.5h4l1.5 1.5h6v1.5H4.2L2.5 12.5h-1zM4.6 7.5h10.4l-2 5.5H2.6z" />
      ) : (
        <path d="M1.5 3.5h4l1.5 1.5h7.5v8h-13z" />
      )}
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("size-3 flex-none transition-transform", open && "rotate-90")}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function SidebarIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-4"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <path d="M6 2.5v11" />
    </svg>
  );
}

const toolButton =
  "flex h-7 cursor-pointer items-center gap-1.5 rounded-md border-0 bg-transparent px-2 font-mono text-[11px] text-code-muted hover:bg-[#2c2b28] hover:text-paper";

/**
 * The Code tab: a VS Code-style explorer over a component's source files, with a collapsible
 * folder tree, the selected file's code and a button to copy it.
 */
export function CodeExplorer({ files }: { files: SourceFile[] }) {
  const tree = useMemo(() => buildTree(files), [files]);
  const [open, setOpen] = useState(() => new Set(allFolders(tree)));
  const [file, setFile] = useState(0);
  // Rendered only on the client (behind the Code tab), so the media query is safe to read here.
  const [sidebar, setSidebar] = useState(() => !window.matchMedia(NARROW).matches);
  const [focused, setFocused] = useState("f:0");
  const { copied, copy } = useCopy();
  const slide = useOvioTransition(SLIDE);
  const treeRef = useRef<HTMLUListElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const sidebarId = useId();

  const rows = visibleRows(tree.children, open);
  const key = (n: Node) => (n.kind === "file" ? `f:${n.file}` : `d:${n.path}`);
  const current = files[file];
  const crumbs = rows.find((r) => r.node.kind === "file" && r.node.file === file)?.node.path;

  const toggleFolder = (path: string, to = !open.has(path)) =>
    setOpen((s) => {
      const next = new Set(s);
      if (to) next.add(path);
      else next.delete(path);
      return next;
    });

  const focusRow = (k: string) => {
    setFocused(k);
    treeRef.current?.querySelector<HTMLElement>(`[data-key="${k}"]`)?.focus();
  };

  const activate = (n: Node) => {
    if (n.kind === "folder") return toggleFolder(n.path);
    setFile(n.file);
    // On a phone the tree covers most of the code, so picking a file closes it.
    if (window.matchMedia(NARROW).matches) {
      setSidebar(false);
      codeRef.current?.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const { node, parent } = rows[i];
    const isOpen = node.kind === "folder" && open.has(node.path);
    const move: Record<string, (() => void) | undefined> = {
      ArrowDown: () => rows[i + 1] && focusRow(key(rows[i + 1].node)),
      ArrowUp: () => rows[i - 1] && focusRow(key(rows[i - 1].node)),
      Home: () => focusRow(key(rows[0].node)),
      End: () => focusRow(key(rows[rows.length - 1].node)),
      ArrowRight: () => {
        if (node.kind !== "folder") return;
        if (!isOpen) toggleFolder(node.path, true);
        else if (node.children[0]) focusRow(key(node.children[0]));
      },
      ArrowLeft: () => {
        if (isOpen) toggleFolder(node.path, false);
        else if (parent) focusRow(`d:${parent}`);
      },
      Enter: () => activate(node),
      " ": () => activate(node),
    };
    const fn = move[e.key];
    if (!fn) return;
    e.preventDefault();
    fn();
  };

  // Keep one row tabbable even when the focused one is hidden inside a closed folder.
  const tabbable = rows.some((r) => key(r.node) === focused) ? focused : key(rows[0].node);

  return (
    <div className="flex flex-col overflow-hidden bg-ink text-paper">
      <div className="flex items-center gap-2 border-b border-[#2c2b28] px-2 py-1.5">
        <button
          type="button"
          className={toolButton}
          aria-expanded={sidebar}
          aria-controls={sidebarId}
          aria-label={sidebar ? "Hide files" : "Show files"}
          title={sidebar ? "Hide files" : "Show files"}
          onClick={() => setSidebar((s) => !s)}
        >
          <SidebarIcon />
        </button>
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-code-muted">
          {crumbs?.split("/").map((part, i, all) => (
            <span key={i} className={i === all.length - 1 ? "text-paper" : undefined}>
              {i > 0 && <span className="px-1 opacity-60">/</span>}
              {part}
            </span>
          ))}
        </span>
        <button
          type="button"
          className={toolButton}
          onClick={() => copy(codeRef.current?.textContent ?? "")}
          aria-label={copied ? "Copied" : `Copy ${current?.path.split("/").pop()}`}
        >
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <div className="relative flex h-[min(560px,70vh)]">
        <AnimatePresence initial={false}>
          {sidebar && (
            <motion.div
              id={sidebarId}
              className="flex-none overflow-hidden border-r border-[#2c2b28] bg-ink max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:z-10 max-sm:shadow-[12px_0_24px_rgba(0,0,0,.35)]"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: SIDEBAR, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={slide}
            >
              <div className="flex h-full flex-col overflow-y-auto" style={{ width: SIDEBAR }}>
                <div className="px-4 pt-3 pb-1.5 text-[10.5px] font-medium tracking-[0.08em] text-code-muted uppercase">
                  Explorer
                </div>
                <ul
                  ref={treeRef}
                  role="tree"
                  aria-label="Source files"
                  className="m-0 list-none p-0 pb-2"
                >
                  {rows.map((row, i) => {
                    const { node, level } = row;
                    const k = key(node);
                    const isOpen = node.kind === "folder" && open.has(node.path);
                    const active = node.kind === "file" && node.file === file;
                    return (
                      <li
                        key={k}
                        data-key={k}
                        role="treeitem"
                        aria-level={level}
                        aria-expanded={node.kind === "folder" ? isOpen : undefined}
                        aria-selected={node.kind === "file" ? active : undefined}
                        tabIndex={k === tabbable ? 0 : -1}
                        onFocus={() => setFocused(k)}
                        onClick={() => {
                          setFocused(k);
                          activate(node);
                        }}
                        onKeyDown={(e) => onKeyDown(e, i)}
                        className={cn(
                          "flex h-7 cursor-pointer items-center gap-1.5 pr-3 font-mono text-[12px] whitespace-nowrap select-none",
                          active
                            ? "bg-[#2c2b28] text-paper"
                            : "text-[#c9c6bd] hover:bg-[#1f1e1b] hover:text-paper",
                        )}
                        style={{ paddingLeft: 8 + (level - 1) * 14 }}
                      >
                        {node.kind === "folder" ? (
                          <>
                            <Chevron open={isOpen} />
                            <FolderIcon open={isOpen} />
                          </>
                        ) : (
                          <>
                            <span className="w-3 flex-none" />
                            <FileIcon name={node.name} />
                          </>
                        )}
                        <span className="truncate">{node.name}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={codeRef} tabIndex={-1} className="min-w-0 flex-1">
          <CodeBlock html={current?.html ?? ""} className="h-full text-[12.5px]" />
        </div>
      </div>
    </div>
  );
}
