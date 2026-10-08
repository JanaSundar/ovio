import { posthog } from "posthog-js";
import type { World } from "@/lib/world";

/**
 * Every product event the site sends, with its properties. PostHog itself only starts on the
 * production deployment (instrumentation-client.ts); elsewhere these calls do nothing.
 */
type Events = {
  /** A world tab, compass point or 1–4 key changed the site's world. */
  design_world_changed: { design_world: World };
  /** The install command was copied, from the homepage or a docs page. */
  install_command_copied: { command_variant: "command" | "install-box" };
  /** A docs page switched between the live specimen and its source. */
  component_view_changed: { component_slug: string; view: "preview" | "code" };
  /** A source file was copied from the docs code explorer. */
  source_code_copied: undefined;
};

export function track<E extends keyof Events>(
  event: E,
  ...[properties]: Events[E] extends undefined ? [] : [Events[E]]
) {
  posthog.capture(event, properties);
}
