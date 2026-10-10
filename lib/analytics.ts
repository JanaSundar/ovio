import { posthog } from "posthog-js";
import type { World } from "@/lib/world";

/**
 * Every product event the site sends, with its properties. PostHog itself only starts on the
 * production deployment (instrumentation-client.ts); elsewhere these calls do nothing.
 */
type Events = {
  /** A world tab, compass point or 1–4 key changed the site's world. */
  design_world_changed: { design_world: World };
  /** The install command was copied, from the homepage, docs, gallery, or a recipe. */
  install_command_copied: { command_variant: "command" | "install-box" | "gallery" | "recipe" };
  /** A docs page switched between the live specimen and its source. */
  component_view_changed: { component_slug: string; view: "preview" | "code" };
  /** The docs preview toggled the four-world comparison. */
  preview_compare_toggled: { component_slug: string; enabled: boolean };
  /** The docs preview forced reduced motion, or handed it back to the system. */
  preview_motion_toggled: { component_slug: string; reduced: boolean };
  /** A usage snippet was copied from a docs page. */
  usage_snippet_copied: { component_slug: string; design_world: World };
  /** A source file was copied from the docs code explorer. */
  source_code_copied: undefined;
  /** A docs demo could not load its live data and fell back to sample data. */
  demo_data_failed: { component_slug: string };
};

export function track<E extends keyof Events>(
  event: E,
  ...[properties]: Events[E] extends undefined ? [] : [Events[E]]
) {
  posthog.capture(event, properties);
}
