"use client";

import { LiquidMagnifier } from "./liquid-magnifier";

const COPY = [
  "lumen is a tiny, typed state machine",
  "for interface animation. Every state",
  "is a frame; every frame knows where",
  "it can go next.",
  "",
  "Set at every size from 9 px labels",
  "to 190 px display, in the world's",
  "own face and colours.",
  "",
  "0123456789 · ?!&@#% · fi fl ff",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
];

const GUIDES: [number, string][] = [
  [62, "ASCENDER"],
  [96, "X-HEIGHT"],
  [196, "BASELINE"],
  [234, "DESCENDER"],
];

/** A type specimen in the world's own face: huge letters, hairline guides, print too fine to read. */
function Specimen() {
  return (
    <svg
      viewBox="0 0 420 315"
      preserveAspectRatio="xMidYMid slice"
      className="font-(family-name:--ovio-font)"
    >
      <rect width="420" height="315" className="fill-(--ovio-surface)" />
      {Array.from({ length: 13 }, (_, i) => (
        <path
          key={`v${i}`}
          d={`M${i * 35} 0V315`}
          strokeWidth=".6"
          className="stroke-(--ovio-line)"
        />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <path
          key={`h${i}`}
          d={`M0 ${i * 35}H420`}
          strokeWidth=".6"
          className="stroke-(--ovio-line)"
        />
      ))}
      {GUIDES.map(([y, name]) => (
        <g key={name} className="fill-(--ovio-accent) stroke-(--ovio-accent)">
          <path d={`M0 ${y}H420`} strokeWidth=".5" strokeOpacity=".6" />
          <text x="414" y={y - 2.5} fontSize="4" textAnchor="end" stroke="none" letterSpacing=".8">
            {name}
          </text>
        </g>
      ))}
      <text
        x="22"
        y="196"
        fontSize="190"
        fontWeight="300"
        letterSpacing="-8"
        className="fill-(--ovio-ink)"
      >
        Ag
      </text>
      <text x="268" y="32" fontSize="4.6" letterSpacing="1.1" className="fill-(--ovio-ink)">
        SPECIMEN 07 · LUMEN DOCS
      </text>
      {COPY.map((line, i) => (
        <text key={i} x="268" y={46 + i * 7.6} fontSize="4.8" className="fill-(--ovio-ink-2)">
          {line}
        </text>
      ))}
      {[300, 400, 500, 600].map((w, i) => (
        <g key={w}>
          <text x={28 + i * 64} y="284" fontSize="32" fontWeight={w} className="fill-(--ovio-ink)">
            Aa
          </text>
          <text
            x={28 + i * 64}
            y="296"
            fontSize="4"
            letterSpacing=".8"
            className="fill-(--ovio-muted)"
          >
            WEIGHT {w}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function LiquidMagnifierDemo() {
  return (
    <LiquidMagnifier label="Specimen 07">
      <Specimen />
    </LiquidMagnifier>
  );
}
