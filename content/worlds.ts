import type { World } from "@/lib/world";

export type WorldInfo = {
  id: World;
  label: string;
  /** Typeface the world's own name is set in on tabs. */
  font: string;
  size: string;
  tracking: string;
  weight: number;
  want: string;
  description: string;
  motion: string;
  /** How the homepage showcase renders in this world. */
  note: string;
};

export const WORLD_INFO: WorldInfo[] = [
  {
    id: "minimal",
    label: "Minimal",
    font: "var(--font-geist)",
    size: "14px",
    tracking: "-0.01em",
    weight: 500,
    want: "I want it clean.",
    description:
      "Clean digital objects. Whitespace, thin rules, neutral colour and clear type hierarchy.",
    motion: "Small springs, opacity and layout shifts that show state.",
    note: "rendered as clean digital objects",
  },
  {
    id: "craft",
    label: "Craft",
    font: "var(--font-bricolage)",
    size: "15px",
    tracking: "-0.01em",
    weight: 800,
    want: "I want it beautifully made.",
    description:
      "Crafted physical artefacts. Cream paper, tape, printed labels, soft layered shadows.",
    motion: "Material motion: cards lift, paper slides, pieces settle.",
    note: "rendered as paper, tape and printed labels",
  },
  {
    id: "retro",
    label: "RETRO",
    font: "var(--font-vt323)",
    size: "19px",
    tracking: "0.04em",
    weight: 400,
    want: "I want it nostalgic.",
    description:
      "Nostalgic digital artefacts. Phosphor, pixel borders, terminal output, old windows.",
    motion: "Stepped frames, typing, blinking cursors.",
    note: "rendered as CRT phosphor and old hardware",
  },
  {
    id: "toy",
    label: "Toy",
    font: "var(--font-archivo)",
    size: "15px",
    tracking: "-0.01em",
    weight: 800,
    want: "I want to play with it.",
    description: "Playful physical objects. Molded plastic, raised keys, knobs, pegs and blocks.",
    motion: "Physics: spring, drag, inertia, snap, compression, overshoot.",
    note: "rendered as physical pieces you can press and flick",
  },
];

export const worldInfo = (id: World) => WORLD_INFO.find((w) => w.id === id) ?? WORLD_INFO[0];
