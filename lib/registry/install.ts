import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { InstallInfo } from "@/components/registry/detail/install-panel";
import { highlight } from "@/components/site/highlight";
import { installCommand } from "@/content/components";
import type { Interaction } from "@/content/interactions";
import { registryItem } from "@/content/registry";

/** Source files, read and highlighted on the server so no highlighter ships for them. */
export async function readSources(files: string[]) {
  return Promise.all(
    files.map(async (f) => {
      const code = await readFile(path.join(process.cwd(), f), "utf8");
      return { path: f, code, html: highlight(code, f.endsWith(".json") ? "json" : "tsx") };
    }),
  );
}

/** How an interaction installs: the registry item's command and dependencies, or its source files. */
export async function installInfo(item: Interaction): Promise<InstallInfo> {
  if (item.distribution.kind === "registry") {
    const reg = registryItem(item.slug);
    return {
      kind: "registry",
      command: installCommand(item.slug),
      dependencies: reg.dependencies,
      registryDependencies: reg.registryDependencies,
    };
  }
  return {
    kind: "source",
    dependencies: item.distribution.dependencies,
    files: await readSources(item.distribution.files),
  };
}
