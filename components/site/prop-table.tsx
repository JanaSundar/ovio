import type { ComponentDoc } from "@/content/components";
import { formatType } from "./format-type";

type Prop = ComponentDoc["props"][number];

/** The members of a union of string literals ("a" | "b"), or null for any other type. */
function literals(type: string) {
  const parts = type.split(" | ");
  return parts.length > 1 && parts.every((p) => /^"[^"|]+"$/.test(p))
    ? parts.map((p) => p.slice(1, -1))
    : null;
}

/** A prop's type: a union of strings as chips, anything else laid out by formatType. */
function PropType({ type }: { type: string }) {
  const values = literals(type);
  if (!values) return formatType(type);
  return (
    <span className="prop-chips">
      {values.map((v) => (
        <code key={v}>{v}</code>
      ))}
    </span>
  );
}

/**
 * A component's props. A table on wide screens; below 640px each row becomes a card, name and
 * default first, then what it does, then its type, so nothing scrolls sideways on a phone.
 */
export function PropTable({ props }: { props: Prop[] }) {
  return (
    <table className="prop-table prop-list">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {props.map((p) => (
          <tr key={p.name}>
            <td>
              <span className="prop-name">{p.name}</span>
              {p.default && <span className="prop-default">default {p.default}</span>}
            </td>
            <td>
              <PropType type={p.type} />
            </td>
            <td>{p.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
