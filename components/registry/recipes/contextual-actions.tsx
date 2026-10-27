"use client";

import {
  ContextMenu,
  type ContextMenuItem,
} from "@/components/interactions/context-menu/context-menu";
import { DialMenu } from "@/components/ovio/dial-menu/dial-menu";
import { OvioToaster, ovioToast } from "@/components/ovio/toast/toast";

/*
 * One set of actions, three ways in: right-click the file for a list, press the round button for a
 * dial, and every action confirms itself with a toast. Define actions once; both menus read them.
 */

type Action = { id: string; label: string; shortcut?: string; destructive?: boolean };

const ACTIONS: Action[] = [
  { id: "open", label: "Open", shortcut: "↵" },
  { id: "duplicate", label: "Duplicate", shortcut: "⌘D" },
  { id: "share", label: "Copy link", shortcut: "⌘L" },
  { id: "archive", label: "Archive" },
  { id: "delete", label: "Delete", shortcut: "⌫", destructive: true },
];

/** What each action does. Here it only reports back; wire your own handlers in. */
function run(id: string) {
  const action = ACTIONS.find((a) => a.id === id);
  if (!action) return;
  if (action.destructive) {
    ovioToast.error(`Deleted machine.ts`, {
      description: "It's in the bin for 30 days.",
      action: { label: "Undo", onClick: () => ovioToast.success("Restored machine.ts") },
    });
  } else {
    ovioToast.success(`${action.label}: machine.ts`);
  }
}

const MENU: ContextMenuItem[] = [
  { type: "label", label: "machine.ts" },
  ...ACTIONS.slice(0, 4),
  { type: "separator" },
  ...ACTIONS.slice(4),
];

export function ContextualActions() {
  return (
    <section
      aria-label="File actions"
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-8"
    >
      <ContextMenu
        items={MENU}
        onSelect={(item) => run(item.id)}
        label="File actions"
        className="w-full rounded-2xl"
      >
        <div className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 text-[#161614] shadow-sm">
          <span className="grid size-11 place-items-center rounded-xl bg-[#161614] font-mono text-xs text-white">
            TS
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-sm font-medium">machine.ts</span>
            <span className="font-mono text-[11px] text-[#77756e]">
              Right-click, long-press or Shift F10
            </span>
          </span>
        </div>
      </ContextMenu>
      <DialMenu
        items={ACTIONS}
        trigger="click"
        onSelect={(item) => run(item.id)}
        label="File actions"
      >
        <button
          type="button"
          aria-label="File actions"
          className="grid size-14 place-items-center rounded-full bg-[#161614] text-2xl text-white shadow-lg transition-transform active:scale-95"
        >
          +
        </button>
      </DialMenu>
      <OvioToaster position="bottom-center" />
    </section>
  );
}
