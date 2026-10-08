import type { World } from "@/lib/world";

export type WorldInfo = {
  id: World;
  label: string;
  /** Typeface the world's own name is set in on tabs. */
  font: string;
  size: string;
  tracking: string;
  weight: number;
  motion: string;
  /** How the homepage showcase renders in this world. */
  note: string;
  /** One line on the world's character, under the specimens. */
  tagline: string;
  /** Short code on the homepage's world wheel. */
  code: string;
};

export const WORLD_INFO: WorldInfo[] = [
  {
    id: "minimal",
    label: "Minimal",
    font: "var(--font-geist)",
    size: "14px",
    tracking: "-0.01em",
    weight: 500,
    motion: "Small springs, opacity and layout shifts that show state.",
    note: "rendered as clean digital objects",
    tagline: "Clean surfaces and measured motion.",
    code: "MIN",
  },
  {
    id: "craft",
    label: "Craft",
    font: "var(--font-bricolage)",
    size: "15px",
    tracking: "-0.01em",
    weight: 800,
    motion: "Material motion: cards lift, paper slides, pieces settle.",
    note: "rendered as paper, tape and printed labels",
    tagline: "Warm paper, gentle texture, and a made-by-hand feel.",
    code: "CRF",
  },
  {
    id: "retro",
    label: "RETRO",
    font: "var(--font-vt323)",
    size: "19px",
    tracking: "0.04em",
    weight: 400,
    motion: "Stepped frames, typing, blinking cursors.",
    note: "rendered as CRT phosphor and old hardware",
    tagline: "Pixels, punchier color, and a little analog energy.",
    code: "RET",
  },
  {
    id: "toy",
    label: "Toy",
    font: "var(--font-archivo)",
    size: "15px",
    tracking: "-0.01em",
    weight: 800,
    motion: "Physics: spring, drag, inertia, snap, compression, overshoot.",
    note: "rendered as physical pieces you can press and flick",
    tagline: "Rounded depth, elastic movement, and something to touch.",
    code: "TOY",
  },
];

export const worldInfo = (id: World) => WORLD_INFO.find((w) => w.id === id) ?? WORLD_INFO[0];
