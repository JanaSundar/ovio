"use client";

import type { CSSProperties } from "react";
import { RequestedPath } from "./requested-path";

/** 5×7 pixel digits. */
const DIGITS: Record<string, string[]> = {
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
};
const COLS = 23;
const ROWS = 7;
/** The cell for the page that isn't there: last column, middle row. */
const MISSING = 3 * COLS + COLS - 1;

/** Which cells are lit: "404" in the middle, a little background activity, the gap for you. */
const CELLS = (() => {
  const lit = new Set<number>();
  ["4", "0", "4"].forEach((d, k) =>
    DIGITS[d].forEach((row, y) =>
      [...row].forEach((b, x) => b === "1" && lit.add(y * COLS + 2 + k * 7 + x)),
    ),
  );
  let seed = 7;
  return Array.from({ length: COLS * ROWS }, (_, i) => {
    seed = (seed * 9301 + 49297) % 233280;
    const r = seed / 233280;
    if (i === MISSING) return "miss";
    if (lit.has(i)) return r > 0.2 ? "l4" : "l3";
    return r > 0.9 ? "l1" : "";
  });
})();

/** Minimal: a contribution grid that spells 404, with one empty cell where the page should be. */
export function MinimalNotFound() {
  return (
    <section className="nf-minimal">
      <div className="nf-mn-top">
        <div>
          <div className="nf-mn-label">
            Requested page · <RequestedPath />
          </div>
          <div className="nf-mn-big">
            0<small>pages at this address</small>
          </div>
        </div>
        <dl>
          <div>
            <dt>Status</dt>
            <dd>404</dd>
          </div>
          <div>
            <dt>Last seen</dt>
            <dd>Never</dd>
          </div>
        </dl>
      </div>
      <div className="nf-mn-grid" aria-hidden>
        {CELLS.map((c, i) => (
          <i
            key={i}
            className={c}
            // Cells fade in column by column, as the contribution graph's do.
            style={{ "--d": `${(i % COLS) * 18}ms` } as CSSProperties}
          />
        ))}
      </div>
      <div className="nf-mn-foot">
        <span>
          Missing <b>1 page</b> · the outlined cell is you
        </span>
        <span aria-hidden>
          Less <i className="l0" /> <i className="l1" /> <i className="l2" /> <i className="l3" />{" "}
          <i className="l4" /> More
        </span>
      </div>
    </section>
  );
}
