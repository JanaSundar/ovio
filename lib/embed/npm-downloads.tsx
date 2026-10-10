import type { ReactElement } from "react";
import {
  formatDelta,
  readDownloads,
  receiptNote,
  type DownloadsChart,
} from "@/components/ovio/npm-downloads/chart";
import type { DownloadWeek } from "@/components/ovio/npm-downloads/npm-downloads";
import { formatNumber } from "@/lib/format";
import type { World } from "@/lib/world";
import { col, Margin, Mark, oneLine, retroText, row, Scanlines, toyText } from "./parts";
import { CRAFT, MINIMAL, RETRO, TOY } from "./tokens";

/**
 * npm Downloads as a still image for a README, one drawing per world, from the same chart the
 * component reads (components/ovio/npm-downloads/chart.ts). The latest week is the one shown.
 * 480px wide, so it reads on a phone and sits beside a repository card in a README.
 */

const WIDTH = 480;

type Props = { packageName: string; chart: DownloadsChart };

const UP = { minimal: "#2f7a45", toy: "#1f7c52" } as const;
const DOWN = { minimal: "#b5311a", toy: TOY.red[1] } as const;

/** The weeks as bars, the latest one in its own colour. */
function Bars({
  chart,
  height,
  gap,
  bar,
}: {
  chart: DownloadsChart;
  height: number;
  gap: number;
  bar: (latest: boolean) => Record<string, string | number>;
}) {
  return (
    <div style={{ ...row, alignItems: "flex-end", height, gap }}>
      {chart.points.map((p) => (
        <div
          key={p.week}
          style={{ display: "flex", flex: 1, height: "100%", alignItems: "flex-end" }}
        >
          <div
            style={{
              width: "100%",
              // A quiet week still shows as a sliver, so the chart never looks unfinished.
              height: Math.max(2, Math.round(p.height * height)),
              ...bar(p.ago === 0),
            }}
          />
        </div>
      ))}
    </div>
  );
}

function Minimal({ packageName, chart }: Props) {
  const { latest } = chart;
  const label = { fontSize: 11, color: MINIMAL.muted } as const;
  return (
    <div
      style={{
        ...col,
        width: WIDTH,
        gap: 22,
        padding: "30px 32px 24px",
        background: MINIMAL.surface,
        border: `1px solid ${MINIMAL.line}`,
        borderRadius: 8,
        fontFamily: MINIMAL.font,
        color: MINIMAL.ink,
      }}
    >
      <div style={col}>
        <span style={{ ...label, ...oneLine, letterSpacing: 1.3, marginBottom: 10 }}>
          {`WEEKLY DOWNLOADS · ${packageName.toUpperCase()}`}
        </span>
        <span style={{ fontSize: 48, lineHeight: 1, letterSpacing: -2.1 }}>
          {formatNumber(latest.downloads)}
        </span>
        <span style={{ ...row, gap: 5, height: 18, marginTop: 8, fontSize: 13 }}>
          {latest.delta !== null && (
            <>
              <span style={{ color: latest.delta >= 0 ? UP.minimal : DOWN.minimal }}>
                {formatDelta(latest.delta, ["↑ ", "↓ "])}
              </span>
              <span style={{ color: MINIMAL.muted }}>vs week before</span>
            </>
          )}
        </span>
      </div>
      <div style={{ ...col, borderBottom: `1px solid ${MINIMAL.line}` }}>
        <Bars
          chart={chart}
          height={130}
          gap={4}
          bar={(last) => ({ background: last ? MINIMAL.ink : "#d6d3cc" })}
        />
      </div>
      <div style={{ ...row, justifyContent: "space-between", marginTop: -12, ...label }}>
        <span>{chart.points[0]?.label}</span>
        <span>{latest.label}</span>
      </div>
      <div
        style={{
          ...row,
          justifyContent: "space-between",
          paddingTop: 14,
          borderTop: `1px solid ${MINIMAL.line2}`,
          fontSize: 13,
          color: MINIMAL.ink2,
        }}
      >
        <span style={{ ...row, gap: 6 }}>
          {`${chart.points.length}-week total`}
          <span style={{ fontFamily: MINIMAL.mono }}>{formatNumber(chart.total)}</span>
        </span>
        <Mark style={{ fontFamily: MINIMAL.mono, fontSize: 11, color: MINIMAL.faint }} />
      </div>
    </div>
  );
}

const PAPER = "#fffdf8";
const RECEIPT_INK = "#7d6650";

/** The receipt's torn foot: a row of paper teeth. */
function TornEdge({ width }: { width: number }) {
  const teeth = Math.round(width / 12);
  const d = Array.from({ length: teeth }, (_, i) => `L${i * 12 + 6} 12L${i * 12 + 12} 0`).join("");
  const src = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${teeth * 12} 12"><path d="M0 0${d}Z" fill="${PAPER}"/></svg>`,
  )}`;
  return <img alt="" src={src} width={width} height={12} />;
}

function Craft({ packageName, chart }: Props) {
  const { latest } = chart;
  const rule = { borderTop: "1px dashed #b9a88f", paddingTop: 8, marginTop: 8 } as const;
  const line = { ...row, justifyContent: "space-between" } as const;
  // The six weeks before the latest one, printed as line items.
  const recent = chart.points.slice(-7, -1);
  return (
    <Margin x={24} y={22}>
      <div
        style={{
          ...col,
          width: 300,
          transform: "rotate(-1.5deg)",
          fontFamily: MINIMAL.mono,
          fontSize: 12,
          lineHeight: 1.7,
          color: CRAFT.ink,
          boxShadow: "0 14px 18px -6px rgba(70,45,20,.3)",
        }}
      >
        <div style={{ ...col, padding: "22px 22px 14px", background: PAPER }}>
          <span
            style={{
              ...oneLine,
              textAlign: "center",
              fontFamily: CRAFT.font,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: -0.4,
            }}
          >
            {`npm · ${packageName}`}
          </span>
          <span style={{ textAlign: "center", color: RECEIPT_INK, marginBottom: 4 }}>
            weekly downloads receipt
          </span>
          <div style={{ ...col, ...rule }}>
            {recent.map((p) => (
              <div key={p.week} style={line}>
                <span>{p.label.toUpperCase()}</span>
                <span>{formatNumber(p.downloads)}</span>
              </div>
            ))}
          </div>
          <div style={{ ...line, ...rule, fontSize: 14, fontWeight: 500 }}>
            <span>THIS WEEK</span>
            <span>{formatNumber(latest.downloads)}</span>
          </div>
          <div style={{ ...line, color: RECEIPT_INK }}>
            <span>VS LAST</span>
            <span>{formatDelta(latest.delta)}</span>
          </div>
          <div style={{ ...line, color: RECEIPT_INK }}>
            <span>{`${chart.points.length} WK TOTAL`}</span>
            <span>{formatNumber(chart.total)}</span>
          </div>
          <span
            style={{
              textAlign: "center",
              marginTop: 10,
              fontFamily: CRAFT.hand,
              fontSize: 26,
              lineHeight: 1.2,
              color: CRAFT.accentDeep,
              transform: "rotate(-4deg)",
            }}
          >
            {receiptNote(latest.delta, false)}
          </span>
          <div
            style={{
              height: 30,
              marginTop: 8,
              backgroundImage:
                "repeating-linear-gradient(90deg, #2a1f14 0px, #2a1f14 2px, transparent 2px, transparent 4px, #2a1f14 4px, #2a1f14 5px, transparent 5px, transparent 8px)",
            }}
          />
          <span style={{ ...row, justifyContent: "center", marginTop: 6, color: RECEIPT_INK }}>
            <Mark style={{ fontSize: 10, letterSpacing: 1 }} />
          </span>
        </div>
        <TornEdge width={300} />
      </div>
    </Margin>
  );
}

function Retro({ packageName, chart }: Props) {
  const { latest } = chart;
  const stripes = (color: string) =>
    `repeating-linear-gradient(0deg, ${color} 0px, ${color} 5px, transparent 5px, transparent 7px)`;
  return (
    <div
      style={{
        ...col,
        ...retroText,
        position: "relative",
        width: WIDTH,
        gap: 18,
        padding: 28,
        background: RETRO.stage,
      }}
    >
      <div style={{ ...row, justifyContent: "space-between", gap: 20, fontSize: 22 }}>
        <span
          style={{ ...oneLine, flex: 1, minWidth: 0 }}
        >{`NPM://${packageName.toUpperCase()}`}</span>
        <span style={{ flexShrink: 0, color: RETRO.ink2 }}>DL/WK</span>
      </div>
      <div style={row}>
        <span
          style={{
            padding: "0 14px",
            border: "2px solid #1d5a2b",
            background: "#0a1f0e",
            fontSize: 60,
            lineHeight: "66px",
            color: RETRO.bright,
          }}
        >
          {formatNumber(latest.downloads)}
        </span>
      </div>
      <Bars
        chart={chart}
        height={110}
        gap={3}
        bar={(last) => ({ backgroundImage: stripes(last ? RETRO.bright : RETRO.accent) })}
      />
      <div style={{ ...row, justifyContent: "space-between", fontSize: 20, color: RETRO.ink2 }}>
        <span>{`> ${formatDelta(latest.delta)} WOW · PEAK ${formatNumber(chart.peak)}_`}</span>
        <Mark style={{}} />
      </div>
      <Scanlines />
    </div>
  );
}

/** Toy's week knob, at rest on the latest week: a dial with a tick per week. */
function Knob({ weeks }: { weeks: number }) {
  const size = 104;
  const c = size / 2;
  const ticks = Array.from({ length: Math.max(1, weeks) }, (_, i) => {
    const a = (-135 + (270 * i) / Math.max(1, weeks - 1)) * (Math.PI / 180);
    const on = i === weeks - 1;
    return `<line x1="${c + 41 * Math.sin(a)}" y1="${c - 41 * Math.cos(a)}" x2="${c + 49 * Math.sin(a)}" y2="${c - 49 * Math.cos(a)}" stroke="${on ? TOY.red[0] : TOY.faint}" stroke-width="3" stroke-linecap="round"/>`;
  }).join("");
  const pointer = (135 * Math.PI) / 180;
  const body =
    ticks +
    `<circle cx="${c}" cy="${c + 5}" r="33" fill="${TOY.blue[1]}"/>` +
    `<circle cx="${c}" cy="${c}" r="33" fill="${TOY.blue[0]}"/>` +
    `<line x1="${c + 11 * Math.sin(pointer)}" y1="${c - 11 * Math.cos(pointer)}" x2="${c + 26 * Math.sin(pointer)}" y2="${c - 26 * Math.cos(pointer)}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
  const src = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${body}</svg>`,
  )}`;
  return <img alt="" src={src} width={size} height={size} />;
}

function Toy({ packageName, chart }: Props) {
  const { latest } = chart;
  const small = { fontFamily: TOY.mono, fontSize: 11, color: TOY.muted } as const;
  return (
    <Margin x={12} y={18}>
      <div
        style={{
          ...row,
          ...toyText,
          width: WIDTH,
          gap: 16,
          padding: 22,
          borderRadius: 22,
          background: TOY.surface,
          boxShadow: "inset 0 1px 0 #fff, 0 7px 0 #d2ccbf, 0 22px 30px -16px rgba(40,28,10,.45)",
        }}
      >
        <div style={{ ...col, flex: 1, minWidth: 0, gap: 14 }}>
          <span style={{ ...small, ...oneLine, letterSpacing: 0.9 }}>
            {`NPM · ${packageName.toUpperCase()} · DOWNLOADS / WEEK`}
          </span>
          <div style={row}>
            <span
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                background: TOY.black,
                fontFamily: TOY.mono,
                fontSize: 40,
                lineHeight: 1,
                color: TOY.surface,
                boxShadow: "inset 0 3px 6px rgba(0,0,0,.6)",
              }}
            >
              {formatNumber(latest.downloads)}
            </span>
          </div>
          <Bars
            chart={chart}
            height={54}
            gap={3}
            bar={(last) => ({ borderRadius: 3, background: last ? TOY.red[0] : "#d6cfc0" })}
          />
          <div style={{ ...row, justifyContent: "space-between", ...small }}>
            <span>{`THIS WEEK · ${latest.label.toUpperCase()}`}</span>
            {latest.delta !== null && (
              <span style={{ color: latest.delta >= 0 ? UP.toy : DOWN.toy }}>
                {/* Plex Mono has no ▲ ▼, which the component's font stack falls back for. */}
                {formatDelta(latest.delta, ["↑ ", "↓ "])}
              </span>
            )}
          </div>
        </div>
        <div style={{ ...col, alignItems: "center", gap: 6, flexShrink: 0 }}>
          <Knob weeks={chart.points.length} />
          <Mark style={{ fontSize: 11, fontWeight: 800, color: TOY.faint }} />
        </div>
      </div>
    </Margin>
  );
}

const VIEWS: Record<World, (props: Props) => ReactElement> = {
  minimal: Minimal,
  craft: Craft,
  retro: Retro,
  toy: Toy,
};

export function NpmDownloadsEmbed({
  world,
  packageName,
  data,
}: {
  world: World;
  packageName: string;
  data: DownloadWeek[];
}) {
  const View = VIEWS[world];
  return <View packageName={packageName} chart={readDownloads(packageName, data)} />;
}
