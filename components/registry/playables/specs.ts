import { STYLE_CONTROL, type Control, type Values } from "@/lib/registry/controls";

/**
 * What each interaction lets you change, as data: no component code, so pages can read it without
 * loading every component. The renders live in renders/, one file per group, loaded on demand.
 */

export type RenderGroup = "new" | "manipulation" | "data" | "surfaces";

export interface PlayableSpec {
  group: RenderGroup;
  controls: Control[];
  /** Control values as the component's props; values pass straight through when left out. */
  toProps?: (v: Values) => Record<string, unknown>;
  /** The component's own defaults for those props, so the snippet prints only real changes. */
  defaults: Record<string, unknown>;
  /** Props the example always passes: its data and handlers. */
  usage: string;
  /** The background the preview sits on by default. */
  canvas: "light" | "dark";
  /** The width the component is drawn at before a card scales it down. */
  width: number;
  /** The stage height on its own page. */
  height: number;
  /** What the snippet can't show, said plainly. */
  note?: string;
}

const range = (
  prop: string,
  label: string,
  min: number,
  max: number,
  step: number,
  value: number,
  extra: Partial<Control> = {},
) => ({ kind: "range", prop, label, min, max, step, default: value, ...extra }) as Control;
const text = (prop: string, label: string, value: string, extra: Partial<Control> = {}) =>
  ({ kind: "text", prop, label, default: value, maxLength: 40, ...extra }) as Control;
const toggle = (prop: string, label: string, value: boolean, extra: Partial<Control> = {}) =>
  ({ kind: "toggle", prop, label, default: value, ...extra }) as Control;
const select = (
  prop: string,
  label: string,
  options: string[],
  value: string,
  extra: Partial<Control> = {},
) =>
  ({
    kind: "select",
    prop,
    label,
    options: options.map((o) => ({ value: o, label: o })),
    default: value,
    ...extra,
  }) as Control;

const ACCENTS = {
  kind: "color",
  prop: "accent",
  label: "Accent",
  options: [
    { value: "#9b8cff", label: "Violet" },
    { value: "#6b9bff", label: "Blue" },
    { value: "#5fd4e6", label: "Cyan" },
    { value: "#7ee2a8", label: "Mint" },
    { value: "#ffb86b", label: "Amber" },
  ],
  default: "#9b8cff",
} as const satisfies Control;

const ANIMATION = select("animation", "Animation", ["none", "enter-exit", "always"], "enter-exit", {
  remount: true,
});

/** Ovio components: the style first, then their own props. */
const styled = (
  spec: Omit<PlayableSpec, "defaults"> & { defaults?: Record<string, unknown> },
): PlayableSpec => ({
  ...spec,
  controls: [STYLE_CONTROL, ...spec.controls],
  defaults: { variant: "minimal", ...spec.defaults },
});

/** Leaves out a prop whose control is at its "off" value. */
const omitWhen = (props: Record<string, unknown>, key: string, off: unknown) => {
  if (props[key] === off) delete props[key];
  return props;
};

export const SPECS: Record<string, PlayableSpec> = {
  "fluid-range-slider": {
    group: "new",
    controls: [
      toggle("range", "Two thumbs", false, { remount: true }),
      range("min", "Min", 0, 50, 5, 0, { remount: true }),
      range("max", "Max", 60, 1000, 10, 100, { remount: true }),
      select("step", "Step", ["1", "5", "10"], "1"),
      text("label", "Label", "Budget"),
      toggle("ticks", "Ticks", false),
      range("stiffness", "Spring stiffness", 80, 1000, 20, 520),
      range("damping", "Spring damping", 8, 60, 1, 30),
      ACCENTS,
      toggle("disabled", "Disabled", false),
    ],
    toProps: ({ range: two, step, ...v }) => {
      const min = Number(v.min);
      const span = Number(v.max) - min;
      const at = (share: number) => min + Math.round((share * span) / Number(step)) * Number(step);
      return { ...v, step: Number(step), defaultValue: two ? [at(0.25), at(0.75)] : at(0.6) };
    },
    defaults: {
      min: 0,
      max: 100,
      step: 1,
      label: "Value",
      ticks: false,
      stiffness: 520,
      damping: 30,
      accent: "#9b8cff",
      disabled: false,
    },
    usage: "",
    canvas: "dark",
    width: 380,
    height: 300,
    note: "formatValue takes a function, so the preview keeps the default number format.",
  },
  "context-menu": {
    group: "new",
    controls: [
      text("label", "Menu name", "File actions"),
      range("longPress", "Long-press", 200, 1000, 20, 480, { unit: "ms" }),
      toggle("disabled", "Disabled", false),
    ],
    defaults: { label: "Actions", longPress: 480, disabled: false },
    usage: "  items={items}\n  onSelect={(item) => run(item.id)}",
    canvas: "dark",
    width: 420,
    height: 340,
  },
  "peel-to-reveal": {
    group: "new",
    controls: [
      select(
        "corner",
        "Corner",
        ["bottom-right", "bottom-left", "top-right", "top-left"],
        "bottom-right",
      ),
      range("threshold", "Threshold", 0.1, 0.9, 0.05, 0.4),
      range("curl", "Resting curl", 0, 48, 1, 22, { unit: "px" }),
      text("hint", "Hint", "Peel from the corner"),
      select("aspectRatio", "Shape", ["3 / 2", "1 / 1", "16 / 9"], "3 / 2"),
      ACCENTS,
      toggle("disabled", "Disabled", false),
    ],
    defaults: {
      corner: "bottom-right",
      threshold: 0.4,
      curl: 22,
      hint: "Peel from the corner",
      aspectRatio: "3 / 2",
      accent: "#9b8cff",
      disabled: false,
    },
    usage: '  label="Launch code"\n  children={<LaunchCode />}',
    canvas: "dark",
    width: 420,
    height: 380,
  },
  testimonials: {
    group: "new",
    controls: [
      range("interval", "Autoplay", 0, 10000, 500, 6000, { unit: "ms" }),
      range("depth", "Stack depth", 0, 3, 1, 2),
      text("label", "Name", "What builders say"),
    ],
    defaults: { interval: 6000, depth: 2, label: "Testimonials" },
    usage: "  items={quotes}",
    canvas: "dark",
    width: 440,
    height: 400,
  },
  "physical-knob": styled({
    group: "manipulation",
    controls: [
      range("defaultValue", "Start value", 0, 100, 1, 72, { remount: true }),
      text("label", "Label", "Level"),
      toggle("disabled", "Disabled", false),
    ],
    defaults: { defaultValue: 72, label: "Level", disabled: false },
    usage: "  onValueChange={setLevel}",
    canvas: "light",
    width: 360,
    height: 460,
  }),
  "compare-slider": styled({
    group: "manipulation",
    controls: [
      range("defaultValue", "Start position", 0, 100, 1, 50, { remount: true }),
      select("aspectRatio", "Shape", ["4 / 3", "16 / 9", "1 / 1"], "4 / 3"),
      text("beforeLabel", "Before label", "v1"),
      text("afterLabel", "After label", "v2"),
    ],
    defaults: {
      defaultValue: 50,
      aspectRatio: "4 / 3",
      beforeLabel: "Before",
      afterLabel: "After",
    },
    usage: '  before={<img src="/v1.png" alt="" />}\n  after={<img src="/v2.png" alt="" />}',
    canvas: "light",
    width: 440,
    height: 440,
  }),
  "liquid-magnifier": styled({
    group: "manipulation",
    controls: [
      range("defaultZoom", "Zoom", 1.5, 4, 0.1, 2.5, { remount: true }),
      range("size", "Lens size", 80, 200, 4, 128, { unit: "px" }),
      text("label", "Label", "Specimen 07"),
    ],
    defaults: { defaultZoom: 2.5, size: 128, label: "Magnifier" },
    usage: '  children={<img src="/poster.png" alt="" />}',
    canvas: "light",
    width: 440,
    height: 480,
  }),
  "scratch-to-reveal": styled({
    group: "manipulation",
    controls: [
      range("threshold", "Threshold", 0.2, 0.9, 0.05, 0.5),
      text("hint", "Hint", "Scratch to reveal"),
      toggle("disabled", "Disabled", false),
    ],
    defaults: { threshold: 0.5, hint: "Scratch to reveal", disabled: false },
    usage: '  label="Invite code"\n  children={<code>LMN-7K2F-Q9</code>}',
    canvas: "light",
    width: 420,
    height: 440,
  }),
  "liquid-tabs": styled({
    group: "manipulation",
    controls: [
      range("goo", "Goo", 0, 16, 1, 9),
      select("status", "Status", ["none", "offline", "building", "online"], "building"),
    ],
    toProps: (v) => omitWhen({ ...v }, "status", "none"),
    defaults: { goo: 9 },
    usage: '  tabs={["Overview", "Commits", "Issues", "Releases"]}',
    canvas: "light",
    width: 460,
    height: 420,
  }),
  "dial-menu": styled({
    group: "manipulation",
    controls: [
      select("trigger", "Opens on", ["contextmenu", "click", "inline"], "contextmenu", {
        remount: true,
      }),
      text("label", "Menu name", "Quick actions"),
    ],
    defaults: { trigger: "contextmenu", label: "Quick actions" },
    usage: "  items={items}\n  onSelect={(item) => run(item.id)}",
    canvas: "light",
    width: 440,
    height: 480,
  }),
  toast: styled({
    group: "manipulation",
    controls: [
      select(
        "position",
        "Position",
        ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"],
        "bottom-right",
      ),
    ],
    defaults: { position: "bottom-right" },
    usage: "",
    canvas: "light",
    width: 420,
    height: 280,
    note: "Toasts are fired with ovioToast.success(), .error() and .info() from anywhere below the toaster.",
  }),
  "contribution-graph": styled({
    group: "data",
    controls: [ANIMATION, range("compactMonths", "Months on small screens", 3, 12, 1, 6)],
    defaults: { animation: "enter-exit" },
    usage: "  data={contributions}",
    canvas: "light",
    width: 900,
    height: 520,
  }),
  "star-history": styled({
    group: "data",
    controls: [ANIMATION, text("repo", "Repository", "ada-dev/lumen")],
    defaults: { animation: "enter-exit" },
    usage: "  data={stars}",
    canvas: "light",
    width: 640,
    height: 440,
  }),
  "npm-downloads": styled({
    group: "data",
    controls: [
      range("weeks", "Weeks", 4, 12, 1, 12),
      range("goal", "Weekly goal", 0, 80000, 5000, 50000),
    ],
    toProps: (v) => omitWhen({ ...v }, "goal", 0),
    defaults: { weeks: 12 },
    usage: '  packageName="lumen"\n  data={downloads}',
    canvas: "light",
    width: 560,
    height: 460,
  }),
  "bundle-size": styled({
    group: "data",
    controls: [range("budget", "Budget", 5, 60, 1, 40, { unit: "kB" })],
    usage: '  packageName="lumen"\n  versions={versions}',
    canvas: "light",
    width: 520,
    height: 460,
  }),
  "git-branch-visualizer": styled({
    group: "data",
    controls: [toggle("actions", "Merge and branch actions", true)],
    defaults: { actions: true },
    usage: '  commits={commits}\n  head="main"',
    canvas: "light",
    width: 680,
    height: 540,
  }),
  "top-contributors": styled({
    group: "data",
    controls: [
      range("limit", "People shown", 3, 7, 1, 6),
      select("defaultPeriod", "Period", ["30d", "90d", "all"], "90d", { remount: true }),
    ],
    defaults: { limit: 6, defaultPeriod: "90d" },
    usage: '  contributors={contributors}\n  repo="ada-dev/lumen"',
    canvas: "light",
    width: 480,
    height: 480,
  }),
  "repository-card": styled({
    group: "surfaces",
    controls: [toggle("starred", "Starred", false)],
    defaults: { starred: false },
    usage: "  repository={repository}",
    canvas: "light",
    width: 440,
    height: 400,
  }),
  "event-ticket": styled({
    group: "surfaces",
    controls: [select("layout", "Layout", ["horizontal", "vertical"], "horizontal")],
    defaults: { layout: "horizontal" },
    usage: '  event={event}\n  ticketId="FRM-260918"\n  onBook={reserve}',
    canvas: "light",
    width: 720,
    height: 520,
  }),
  changelog: styled({
    group: "surfaces",
    controls: [range("limit", "Releases shown", 1, 4, 1, 4)],
    usage: "  releases={releases}",
    canvas: "light",
    width: 540,
    height: 480,
  }),
  "sponsor-wall": styled({
    group: "surfaces",
    controls: [text("ctaLabel", "Link text", "Become a sponsor")],
    defaults: { ctaLabel: "Become a sponsor" },
    usage: '  sponsors={sponsors}\n  ctaHref="https://github.com/sponsors/ada-dev"',
    canvas: "light",
    width: 580,
    height: 500,
  }),
  letter: styled({
    group: "surfaces",
    controls: [range("subscribers", "Subscribers", 0, 50000, 100, 2481)],
    usage: "  letter={issue}\n  onSubscribe={subscribe}",
    canvas: "light",
    width: 560,
    height: 660,
  }),
  "now-playing": styled({
    group: "surfaces",
    controls: [toggle("defaultPlaying", "Playing", true, { remount: true })],
    defaults: { defaultPlaying: true },
    usage: "  track={track}",
    canvas: "light",
    width: 440,
    height: 460,
  }),
  "developer-id-card": styled({
    group: "surfaces",
    controls: [
      text("name", "Name", "Ada Park"),
      text("title", "Title", "Senior Software Engineer"),
      toggle("available", "Open to work", true),
    ],
    usage: '  stack={stack}\n  github="ada-dev"',
    canvas: "light",
    width: 460,
    height: 540,
  }),
};

export const propsOf = (spec: PlayableSpec, values: Values) =>
  spec.toProps ? spec.toProps(values) : { ...values };
