export const WORLDS = ["minimal", "craft", "retro", "toy"] as const;

export type World = (typeof WORLDS)[number];
