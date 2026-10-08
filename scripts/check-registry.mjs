/**
 * Checks that every registry item installs complete: each file's imports must be one of the item's
 * own files, a file of a registry item it depends on, or an npm dependency it declares.
 * Run after moving code between files, before `shadcn registry validate`.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const PREFIX = "JanaSundar/ovio/";
/** shadcn's own items, and what they provide. */
const BUILT_IN = { utils: ["lib/utils.ts"] };
/** Always present in a Next.js app. */
const PLATFORM = new Set(["react", "react-dom", "next", "server-only"]);

const byName = new Map(registry.items.map((item) => [item.name, item]));

/** Every file an item may import: its own and those of its registry dependencies, recursively. */
function provided(item, seen = new Set()) {
  if (seen.has(item.name)) return [];
  seen.add(item.name);
  const files = item.files.map((f) => f.path);
  for (const dep of item.registryDependencies ?? []) {
    if (BUILT_IN[dep]) files.push(...BUILT_IN[dep]);
    else if (dep.startsWith(PREFIX) && byName.has(dep.slice(PREFIX.length)))
      files.push(...provided(byName.get(dep.slice(PREFIX.length)), seen));
    else files.push(`?unknown dependency ${dep}`);
  }
  return files;
}

function resolve(spec, from) {
  const base = spec.startsWith("@/") ? spec.slice(2) : path.join(path.dirname(from), spec);
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"])
    if (existsSync(base + ext) && !base.endsWith("/")) return path.normalize(base + ext);
  return path.normalize(base);
}

const packageOf = (spec) =>
  spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];

const problems = [];
for (const item of registry.items) {
  if (!item.files?.length) continue;
  const allowed = new Set(provided(item));
  const deps = new Set(item.dependencies ?? []);
  for (const { path: file } of item.files) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const source = readFileSync(file, "utf8");
    for (const { fileName: spec } of ts.preProcessFile(source, true, true).importedFiles) {
      if (spec.startsWith("@/") || spec.startsWith(".")) {
        const target = resolve(spec, file);
        if (!allowed.has(target))
          problems.push(`${item.name}: ${file} imports ${target}, not installed with it`);
      } else {
        const pkg = packageOf(spec);
        if (!PLATFORM.has(pkg) && !deps.has(pkg))
          problems.push(`${item.name}: ${file} imports "${pkg}", missing from dependencies`);
      }
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`registry: ${registry.items.length} items, every import is installed with its item`);
