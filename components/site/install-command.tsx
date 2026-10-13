"use client";

import { useState } from "react";
import { useWorld } from "@/components/shared/world-provider";
import { worldInfo } from "@/content/worlds";
import { WORLDS, type World } from "@/lib/world";
import { CopyCommand } from "./copy-command";

/** A registry item's command and what it brings besides its own files, read on the server. */
export type InstallOption = {
  command: string;
  dependencies: string[];
  registryDependencies: string[];
};

/** "a", "a and b", "a, b and c", each as code. */
function List({ names }: { names: string[] }) {
  return names.map((d, k) => (
    <span key={d}>
      {k > 0 && (k === names.length - 1 ? " and " : ", ")}
      <code>{d}</code>
    </span>
  ));
}

type Tab = World | "all";

/** "Retro", whatever case the world's tab label is set in. */
const nameOf = (world: World) => {
  const { label } = worldInfo(world);
  return label[0] + label.slice(1).toLowerCase();
};

/**
 * The install command for one world alone, or for all four. The tab starts on the world picked
 * for the page and follows it when it changes, unless all four are chosen.
 */
export function InstallCommand({ options }: { options: Record<Tab, InstallOption> }) {
  const world = useWorld();
  const [tab, setTab] = useState<Tab>(world);
  const [shown, setShown] = useState(world);
  if (shown !== world) {
    setShown(world);
    if (tab !== "all") setTab(world);
  }
  const item = options[tab];

  return (
    <>
      <p>
        Use the shadcn CLI to copy the component source and its dependencies into your own project.{" "}
        {tab === "all" ? "All four worlds, with" : `Only the ${nameOf(tab)} world, with`}{" "}
        {item.dependencies.length > 0 && (
          <>
            <List names={item.dependencies} />, plus{" "}
          </>
        )}
        the Ovio {item.registryDependencies.join(", ")} items.
      </p>
      <div role="tablist" aria-label="Worlds to install" className="snippet-tabs">
        {[...WORLDS, "all" as const].map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
          >
            {t === "all" ? "All four" : nameOf(t)}
          </button>
        ))}
      </div>
      <CopyCommand command={item.command} variant="install-box" />
    </>
  );
}

/** The homepage's command: one component in the world picked on the page. */
export function WorldCommand({ commands }: { commands: Record<World, string> }) {
  return <CopyCommand command={commands[useWorld()]} />;
}
