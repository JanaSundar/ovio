// Checks the built registry against the shadcn registry index rules:
// flat (public/r/registry.json and public/r/<name>.json, no nested folders) and
// no inline `content` in the index's files entries.
import { readdir, readFile } from "node:fs/promises";

const dir = new URL("../public/r/", import.meta.url);
const entries = await readdir(dir, { withFileTypes: true });
const problems = [];

for (const e of entries) {
  if (e.isDirectory()) problems.push(`nested folder public/r/${e.name}`);
}

const index = JSON.parse(await readFile(new URL("registry.json", dir), "utf8"));
for (const item of index.items) {
  if (!entries.some((e) => e.name === `${item.name}.json`)) problems.push(`missing public/r/${item.name}.json`);
  for (const f of item.files ?? []) if ("content" in f) problems.push(`${item.name}: files entry has content`);
}

if (problems.length) {
  console.error("Registry check failed:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log(`Registry OK: ${index.items.length} items, flat, no inline content in the index.`);
