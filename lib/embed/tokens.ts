import type { World } from "@/lib/world";

/**
 * The worlds' tokens as plain values for the embeds, which render outside the page and can't
 * read CSS variables. They mirror styles/ovio.css: change a colour there, change it here.
 */
export const MINIMAL = {
  surface: "#ffffff",
  ink: "#161614",
  ink2: "#55534d",
  muted: "#77756e",
  faint: "#99968e",
  line: "#e6e4df",
  line2: "#eeece8",
  font: "Geist",
  mono: "Geist Mono",
} as const;

export const CRAFT = {
  surface: "#fbf7ef",
  surface2: "#f1e6d2",
  ink: "#2a1f14",
  ink2: "#6e5a45",
  muted: "#8a7258",
  accent: "#e0713a",
  accentDeep: "#b8471f",
  onAccent: "#fff6ea",
  tape: "rgba(240,220,160,.86)",
  shadow: "0 2px 4px rgba(70,45,20,.12), 0 18px 34px -12px rgba(70,45,20,.4)",
  font: "Bricolage Grotesque",
  hand: "Caveat",
  mono: "IBM Plex Mono",
} as const;

export const RETRO = {
  stage: "#061108",
  ink: "#6dff8a",
  ink2: "#3fae55",
  bright: "#c9ffd2",
  accent: "#4fdc68",
  glow: "0 0 6px rgba(80,255,120,.55)",
  font: "VT323",
} as const;

export const TOY = {
  surface: "#f8f5ef",
  ink: "#1e1d1a",
  ink2: "#55524a",
  muted: "#6b665b",
  faint: "#a69e90",
  blue: ["#2c55e0", "#1a36a3"],
  red: ["#ef4f2b", "#b5311a"],
  yellow: ["#f4b52a", "#b9821a"],
  white: ["#ffffff", "#cfc8b8"],
  black: "#2a2925",
  font: "Archivo",
  mono: "IBM Plex Mono",
} as const;

/** The families each world draws with, so an embed fetches only its own. */
export const WORLD_FONTS = {
  minimal: [MINIMAL.font, MINIMAL.mono],
  craft: [CRAFT.font, CRAFT.hand, CRAFT.mono],
  // VT323 has no block characters (█ ░▒▓); Geist Mono draws them.
  retro: [RETRO.font, MINIMAL.mono],
  toy: [TOY.font, TOY.mono],
} as const satisfies Record<World, readonly string[]>;
