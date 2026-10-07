export const WORLDS = ["minimal", "craft", "retro", "toy"] as const;

export type World = (typeof WORLDS)[number];

export function isWorld(value: unknown): value is World {
  return typeof value === "string" && (WORLDS as readonly string[]).includes(value);
}
