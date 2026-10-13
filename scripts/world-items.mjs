/**
 * The single-world registry items. A component's own item installs all four worlds; next to it,
 * `<slug>-<world>` installs the component with that world alone: the entry, the files that world
 * reaches through its imports, and registry/worlds/<world>.ts as worlds/index.ts. Its npm and
 * registry dependencies are the component's, narrowed to what those files import.
 *
 * They are derived, never edited by hand: `node scripts/check-registry.mjs --write` rewrites them
 * in registry.json, and a plain run fails when they are stale.
 */
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

export const PREFIX = "JanaSundar/ovio/";
export const WORLDS = ["minimal", "craft", "retro", "toy"];
const TITLE = { minimal: "Minimal", craft: "Craft", retro: "Retro", toy: "Toy" };
/** shadcn's own items, and what they provide. */
export const BUILT_IN = { utils: ["lib/utils.ts"] };

/** Where a file lands in the consumer's project, which is what its relative imports resolve from. */
export const installedPath = (file) => file.target ?? file.path;

/** Every module a source file imports or re-exports, types included. */
export const importsOf = (file) =>
  ts.preProcessFile(readFileSync(file, "utf8"), true, true).importedFiles.map((f) => f.fileName);

export const isLocal = (spec) => spec.startsWith("@/") || spec.startsWith(".");

export const packageOf = (spec) =>
  spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];

// POSIX paths throughout, to match registry.json; Node's default would use backslashes on Windows.
export function resolve(spec, from) {
  const base = spec.startsWith("@/")
    ? spec.slice(2)
    : path.posix.join(path.posix.dirname(from), spec);
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"])
    if (statSync(base + ext, { throwIfNoEntry: false })?.isFile())
      return path.posix.normalize(base + ext);
  return path.posix.normalize(base);
}

const depName = (name) => (name in BUILT_IN ? name : PREFIX + name);
const isCode = (file) => /\.(ts|tsx)$/.test(file.path);

/** The component items: those that install a worlds/index.ts. */
export const componentItems = (registry) =>
  registry.items.filter((item) => item.files?.some((f) => f.path.endsWith("/worlds/index.ts")));

/** `letter` → letter-minimal, letter-craft, letter-retro, letter-toy. */
export const worldItemNames = (slug) => WORLDS.map((w) => `${slug}-${w}`);

/**
 * One component with one world. `owner` maps an installed path to the item that provides it;
 * `assets` are items with no code (the theme's CSS), needed without being imported.
 */
function worldItem(component, world, owner, assets) {
  const dir = `components/ovio/${component.name}`;
  const index = {
    path: `registry/worlds/${world}.ts`,
    type: "registry:lib",
    target: `${dir}/worlds/index.ts`,
  };
  const files = component.files.map((f) => (installedPath(f) === index.target ? index : f));
  const byPath = new Map(files.map((f) => [installedPath(f), f]));

  const reached = new Set();
  const items = new Set();
  const packages = new Set();
  const queue = [`${dir}/${component.name}.tsx`];
  while (queue.length) {
    const at = queue.pop();
    if (reached.has(at)) continue;
    reached.add(at);
    for (const spec of importsOf(byPath.get(at).path)) {
      if (!isLocal(spec)) packages.add(packageOf(spec));
      else {
        const target = resolve(spec, at);
        if (byPath.has(target)) queue.push(target);
        else if (owner.has(target)) items.add(depName(owner.get(target)));
        else
          throw new Error(
            `${component.name}-${world}: ${at} imports ${target}, which no item installs`,
          );
      }
    }
  }

  const registryDependencies = (component.registryDependencies ?? []).filter(
    (d) => items.has(d) || assets.has(d),
  );
  const dependencies = (component.dependencies ?? []).filter((d) => packages.has(d));
  return {
    name: `${component.name}-${world}`,
    type: component.type,
    title: `${component.title} — ${TITLE[world]}`,
    description: `${component.title} in the ${TITLE[world]} world alone, without the other three. Add ${component.name} for all four.`,
    ...(dependencies.length && { dependencies }),
    registryDependencies,
    files: files.filter((f) => reached.has(installedPath(f))),
  };
}

/** The registry with every component's single-world items placed right after it, fresh. */
export function withWorldItems(source) {
  const derived = new Set(componentItems(source).flatMap((c) => worldItemNames(c.name)));
  const base = source.items.filter((item) => !derived.has(item.name));
  const owner = new Map(Object.entries(BUILT_IN).flatMap(([name, fs]) => fs.map((f) => [f, name])));
  for (const item of base) for (const f of item.files ?? []) owner.set(installedPath(f), item.name);
  const assets = new Set(
    base.filter((i) => i.files?.length && !i.files.some(isCode)).map((i) => depName(i.name)),
  );
  const components = new Set(componentItems(source));
  return {
    ...source,
    items: base.flatMap((item) =>
      components.has(item)
        ? [item, ...WORLDS.map((w) => worldItem(item, w, owner, assets))]
        : [item],
    ),
  };
}
