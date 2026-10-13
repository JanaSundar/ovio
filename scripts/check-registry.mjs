/**
 * Checks that every registry item installs complete: each file's imports must be one of the item's
 * own files, a file of a registry item it depends on, or an npm dependency it declares. Imports
 * resolve from where a file is installed, its target. Also fails when the single-world items
 * (scripts/world-items.mjs) are stale; `--write` regenerates them.
 * Run after moving code between files, before `shadcn registry validate`.
 */
import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";
import {
  BUILT_IN,
  PREFIX,
  importsOf,
  installedPath,
  isLocal,
  packageOf,
  resolve,
  withWorldItems,
} from "./world-items.mjs";

let registry = JSON.parse(readFileSync("registry.json", "utf8"));
const fresh = withWorldItems(registry);
if (process.argv.includes("--write")) {
  writeFileSync("registry.json", JSON.stringify(fresh, null, 2) + "\n");
  // Through node, since .bin/oxfmt is a shell script Windows cannot spawn.
  execFileSync(process.execPath, ["node_modules/oxfmt/bin/oxfmt", "--write", "registry.json"]);
  registry = fresh;
} else if (!isDeepStrictEqual(registry, fresh)) {
  console.error(
    "registry: single-world items are stale; run node scripts/check-registry.mjs --write",
  );
  process.exit(1);
}

/** Always present in a Next.js app. */
const PLATFORM = new Set(["react", "react-dom", "next", "server-only"]);

const byName = new Map(registry.items.map((item) => [item.name, item]));

/** Every installed path an item may import: its own and its registry dependencies', recursively. */
function provided(item, seen = new Set()) {
  if (seen.has(item.name)) return [];
  seen.add(item.name);
  const files = item.files.map(installedPath);
  for (const dep of item.registryDependencies ?? []) {
    if (BUILT_IN[dep]) files.push(...BUILT_IN[dep]);
    else if (dep.startsWith(PREFIX) && byName.has(dep.slice(PREFIX.length)))
      files.push(...provided(byName.get(dep.slice(PREFIX.length)), seen));
    else files.push(`?unknown dependency ${dep}`);
  }
  return files;
}

const problems = [];
for (const item of registry.items) {
  if (!item.files?.length) continue;
  const allowed = new Set(provided(item));
  const deps = new Set(item.dependencies ?? []);
  for (const file of item.files) {
    if (!/\.(ts|tsx)$/.test(file.path)) continue;
    for (const spec of importsOf(file.path)) {
      if (isLocal(spec)) {
        const target = resolve(spec, installedPath(file));
        if (!allowed.has(target))
          problems.push(`${item.name}: ${file.path} imports ${target}, not installed with it`);
      } else {
        const pkg = packageOf(spec);
        if (!PLATFORM.has(pkg) && !deps.has(pkg))
          problems.push(`${item.name}: ${file.path} imports "${pkg}", missing from dependencies`);
      }
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`registry: ${registry.items.length} items, every import is installed with its item`);
