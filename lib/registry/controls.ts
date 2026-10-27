/** Customisation controls and the usage snippet they produce: pure, shared by pages and tests. */

export type ControlValue = string | number | boolean;
export type Values = Record<string, ControlValue>;

type Base = {
  /** The prop it sets. */
  prop: string;
  label: string;
  /**
   * The prop is only read on mount (a default value), so a change remounts the preview.
   * Live props update in place.
   */
  remount?: boolean;
};

export type Control =
  | (Base & {
      kind: "range";
      min: number;
      max: number;
      step: number;
      default: number;
      unit?: string;
    })
  | (Base & { kind: "select"; options: { value: string; label: string }[]; default: string })
  | (Base & { kind: "toggle"; default: boolean })
  | (Base & { kind: "text"; default: string; maxLength?: number })
  | (Base & { kind: "color"; options: { value: string; label: string }[]; default: string });

export const STYLE_OPTIONS = [
  { value: "minimal", label: "Minimal" },
  { value: "craft", label: "Craft" },
  { value: "retro", label: "Retro" },
  { value: "toy", label: "Toy" },
];

/** The Ovio style a component draws in: its `variant` prop. */
export const STYLE_CONTROL: Control = {
  kind: "select",
  prop: "variant",
  label: "Style",
  options: STYLE_OPTIONS,
  default: "minimal",
};

export const defaultsOf = (controls: Control[]): Values =>
  Object.fromEntries(controls.map((c) => [c.prop, c.default]));

/** The values that only take effect on mount, as a key: a change remounts the preview. */
export const remountKey = (controls: Control[], values: Values) =>
  controls
    .filter((c) => c.remount)
    .map((c) => `${c.prop}=${values[c.prop]}`)
    .join("&");

/** Keeps a value inside what its control allows, for values arriving from a URL or a reset. */
export function sanitize(control: Control, value: unknown): ControlValue {
  switch (control.kind) {
    case "range": {
      const n = typeof value === "number" ? value : Number(value);
      return Number.isFinite(n) ? Math.min(control.max, Math.max(control.min, n)) : control.default;
    }
    case "toggle":
      return typeof value === "boolean" ? value : control.default;
    case "select":
    case "color":
      return control.options.some((o) => o.value === value) ? (value as string) : control.default;
    case "text":
      return typeof value === "string" ? value.slice(0, control.maxLength ?? 60) : control.default;
  }
}

/** One prop as JSX: `name="text"`, `name={42}`, `name` for true. */
export function jsxProp(name: string, value: unknown): string {
  if (value === true) return name;
  if (typeof value === "string") return `${name}=${JSON.stringify(value)}`;
  return `${name}={${JSON.stringify(value).replace(/,/g, ", ")}}`;
}

/**
 * The usage snippet: the import, the component, the props the example always passes (`usage`),
 * then each customised prop that differs from its default.
 */
export function usageSnippet({
  exportName,
  importPath,
  usage,
  props,
  defaults,
}: {
  exportName: string;
  importPath: string;
  usage: string;
  props: Record<string, unknown>;
  defaults: Record<string, unknown>;
}): string {
  const changed = Object.entries(props)
    .filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(defaults[k]))
    .map(([k, v]) => `  ${jsxProp(k, v)}`);
  const lines = [usage, ...changed].filter(Boolean).join("\n");
  return `import { ${exportName} } from "${importPath}"\n\n<${exportName}${lines ? `\n${lines}\n` : " "}/>`;
}
