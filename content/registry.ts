import "server-only";
import { REPO } from "@/content/components";
import registry from "@/registry.json";

/** A built component's files and dependencies, read from registry.json so they are declared once. */
export function registryItem(name: string) {
  const item = registry.items.find((i) => i.name === name);
  if (!item) throw new Error(`registry.json has no item "${name}"`);
  return {
    files: item.files.map((f) => f.path),
    dependencies: item.dependencies ?? [],
    registryDependencies: (item.registryDependencies ?? [])
      .filter((d) => d.startsWith(`${REPO}/`))
      .map((d) => d.slice(REPO.length + 1)),
  };
}
