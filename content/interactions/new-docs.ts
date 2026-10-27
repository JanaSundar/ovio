import type { ComponentDoc } from "../components";

/**
 * Docs for the interactions built for the registry alone: one implementation each, no worlds.
 * They live in components/interactions/ and are not shadcn registry items yet.
 */

type Prop = ComponentDoc["props"][number];
const CL: Prop = { name: "className", type: "string", description: "Merged onto the root." };

export const NEW_DOCS: ComponentDoc[] = [
  {
    slug: "fluid-range-slider",
    name: "Fluid Range Slider",
    tech: "Pointer events · Motion springs · SVG goo filter",
    description:
      "A slider whose thumb chases the pointer on a spring and lifts its value out like a bead of liquid. One thumb or a range.",
    exportName: "FluidRangeSlider",
    usage: '  label="Budget"\n  defaultValue={[20, 80]}',
    isNew: true,
    props: [
      {
        name: "value / defaultValue",
        type: "number | [number, number]",
        description: "A number for one thumb, a pair for a range. Thumbs never cross.",
        default: "midpoint",
      },
      {
        name: "onValueChange",
        type: "(value) => void",
        description: "Fires while dragging or on each key press.",
      },
      {
        name: "onValueCommit",
        type: "(value) => void",
        description: "Fires once a drag or key press settles.",
      },
      { name: "min / max", type: "number", description: "The range.", default: "0 / 100" },
      { name: "step", type: "number", description: "Values snap to it.", default: "1" },
      {
        name: "label",
        type: "string",
        description: "Accessible name, printed above.",
        default: '"Value"',
      },
      {
        name: "formatValue",
        type: "(value: number) => string",
        description: "For the readout and aria-valuetext.",
      },
      {
        name: "ticks",
        type: "boolean",
        description: "A dot per step, up to 40.",
        default: "false",
      },
      {
        name: "stiffness / damping",
        type: "number",
        description: "The thumb's spring.",
        default: "520 / 30",
      },
      {
        name: "accent",
        type: "string",
        description: "Fill and droplet colour.",
        default: '"#9b8cff"',
      },
      { name: "disabled", type: "boolean", description: "Dims it and ignores input." },
      CL,
    ],
  },
  {
    slug: "context-menu",
    name: "Context Menu",
    tech: "Portal · Motion layout highlight · ARIA menu",
    description:
      "A right-click menu that grows from the pointer, with a highlight that glides between items, long-press on touch and full keyboard support.",
    exportName: "ContextMenu",
    usage: "  items={items}\n  onSelect={(item) => run(item.id)}",
    isNew: true,
    props: [
      {
        name: "items",
        type: '({ id; label; icon?; shortcut?; disabled?; destructive? } | { type: "separator" } | { type: "label"; label })[]',
        description: "Actions, separators and group labels, in order.",
      },
      { name: "children", type: "ReactNode", description: "The area that opens the menu." },
      { name: "onSelect", type: "(item) => void", description: "Fires with the chosen action." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Opened or closed." },
      {
        name: "label",
        type: "string",
        description: "The menu's accessible name.",
        default: '"Actions"',
      },
      {
        name: "longPress",
        type: "number",
        description: "Touch hold before opening, ms.",
        default: "480",
      },
      { name: "disabled", type: "boolean", description: "Stops it opening." },
      CL,
    ],
  },
  {
    slug: "peel-to-reveal",
    name: "Peel to Reveal",
    tech: "Polygon clipping · SVG gradient · Motion",
    description:
      "A sticker with a curled corner. Drag it across and the fold follows your finger; let go past the threshold and it comes off.",
    exportName: "PeelToReveal",
    usage: '  label="Launch code"\n  children={<code>LMN-7K2F</code>}',
    isNew: true,
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "What the sticker covers. Inert until peeled.",
      },
      {
        name: "cover",
        type: "ReactNode",
        description: "The sticker's face. A gradient with label and hint by default.",
      },
      {
        name: "peeled / defaultPeeled",
        type: "boolean",
        description: "Whether it has come off.",
        default: "false",
      },
      {
        name: "onPeeledChange",
        type: "(peeled: boolean) => void",
        description: "Peeled, or covered again.",
      },
      {
        name: "threshold",
        type: "number",
        description: "Share of the diagonal a drag must pass, 0–1.",
        default: "0.4",
      },
      {
        name: "corner",
        type: '"top-left" | "top-right" | "bottom-left" | "bottom-right"',
        description: "Which corner lifts.",
        default: '"bottom-right"',
      },
      { name: "curl", type: "number", description: "The resting dog-ear, px.", default: "22" },
      {
        name: "label",
        type: "string",
        description: "Names the hidden content.",
        default: '"Hidden content"',
      },
      {
        name: "hint",
        type: "string",
        description: "Printed on the default face.",
        default: '"Peel from the corner"',
      },
      {
        name: "accent",
        type: "string",
        description: "The default face's colour.",
        default: '"#9b8cff"',
      },
      { name: "aspectRatio", type: "string", description: "The card's shape.", default: '"3 / 2"' },
      { name: "disabled", type: "boolean", description: "Flattens the corner and ignores input." },
      CL,
    ],
  },
  {
    slug: "testimonials",
    name: "Testimonials",
    tech: "Motion drag · AnimatePresence · ARIA carousel",
    description:
      "A stack of quotes you can swipe through. Autoplay pauses on hover and focus, and has its own pause button.",
    exportName: "Testimonials",
    usage: "  items={quotes}",
    isNew: true,
    props: [
      {
        name: "items",
        type: "{ quote; name; role?; avatarUrl? }[]",
        description: "The quotes, in order.",
      },
      {
        name: "index / defaultIndex",
        type: "number",
        description: "The quote on top.",
        default: "0",
      },
      {
        name: "onIndexChange",
        type: "(index: number) => void",
        description: "Swiped, clicked or advanced.",
      },
      {
        name: "interval",
        type: "number",
        description: "Autoplay ms; 0 turns it off.",
        default: "6000",
      },
      { name: "depth", type: "number", description: "Cards stacked behind, 0–3.", default: "2" },
      {
        name: "label",
        type: "string",
        description: "The carousel's accessible name.",
        default: '"Testimonials"',
      },
      CL,
    ],
  },
];
