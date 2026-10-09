import type { ReactNode } from "react";
import { ArtCard, ink, Label, mono, muted, sans } from "./card";

/** The olive-to-lime ramp from the brand card, quiet to busy. */
const RAMP = ["#dcdbd4", "#c9cbb8", "#a3a98a", "#7e8a55", "#5d6a33", "#c6ef3d", "#d7fb58"];
const lime = "#d7fb58";
const line = "#cfcec6";

/** Mulberry32, so every build draws the same picture. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`,
  )}`;

const row = { display: "flex", alignItems: "center" } as const;
const col = { display: "flex", flexDirection: "column" } as const;

/** A year of activity that warms up to lime on the right, as in the brand card. */
function Heatmap() {
  const rnd = seeded(1467);
  return (
    <div style={{ ...col, gap: 5 }}>
      {Array.from({ length: 12 }, (_, r) => (
        <div key={r} style={{ ...row, gap: 5 }}>
          {Array.from({ length: 16 }, (__, c) => {
            const heat = c / 15;
            const v = rnd() * 0.6 + heat * 0.75;
            const lvl = rnd() < 0.35 - heat * 0.25 ? 0 : Math.min(6, Math.floor(v * 6.2));
            return (
              <div
                key={c}
                style={{ width: 17, height: 17, borderRadius: 4, background: RAMP[lvl] }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Ticket() {
  return (
    <div style={{ ...row, width: 360, height: 196, borderRadius: 14, background: ink }}>
      <div
        style={{ ...col, flex: 1, height: "100%", justifyContent: "space-between", padding: 24 }}
      >
        <Label color="#a9aa9f">LAUNCH · 2026</Label>
        <span
          style={{
            fontFamily: sans,
            fontSize: 34,
            fontWeight: 500,
            color: "#f6f5f0",
            lineHeight: 1,
          }}
        >
          Get early access
        </span>
        <Label color="#a9aa9f">MAY 24 · LISBON</Label>
      </div>
      <div
        style={{
          ...col,
          width: 92,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderLeft: "2px dashed #4a4b45",
          background: lime,
          borderRadius: "0 14px 14px 0",
        }}
      >
        <span style={{ fontFamily: mono, fontSize: 30, fontWeight: 500, color: ink }}>024</span>
        <Label>ADMIT</Label>
      </div>
    </div>
  );
}

function Tabs() {
  return (
    <div style={{ ...col, gap: 26, width: 360 }}>
      <div style={{ ...row, padding: 6, borderRadius: 14, background: "#e5e4dd" }}>
        {["Overview", "Commits", "Issues"].map((t, i) => (
          <div
            key={t}
            style={{
              ...row,
              flex: 1,
              justifyContent: "center",
              padding: "14px 0",
              borderRadius: 10,
              background: i === 0 ? ink : "transparent",
              color: i === 0 ? "#f6f5f0" : muted,
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div style={{ ...row, gap: 14 }}>
        {["#c9cbb8", "#7e8a55", lime].map((c) => (
          <div key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c }} />
        ))}
        <span style={{ fontFamily: sans, fontSize: 22, fontWeight: 500, marginLeft: 6 }}>
          Deploy online
        </span>
      </div>
    </div>
  );
}

/** A rising line with a spike, drawn as SVG. */
function LineChart({ points, w = 360, h = 230 }: { points: number[]; w?: number; h?: number }) {
  // Inset so the end marker isn't clipped at the corner.
  const pad = 10;
  const step = (w - pad * 2) / (points.length - 1);
  const max = Math.max(...points);
  const xy = points.map(
    (p, i) => `${(pad + i * step).toFixed(1)},${(h - (p / max) * (h - pad * 2)).toFixed(1)}`,
  );
  const area = `${pad},${h} ${xy.join(" ")} ${w - pad},${h}`;
  const [lx, ly] = xy[xy.length - 1].split(",");
  const body =
    [0.25, 0.5, 0.75]
      .map(
        (f) =>
          `<line x1="0" x2="${w}" y1="${h * f}" y2="${h * f}" stroke="${line}" stroke-dasharray="2 5"/>`,
      )
      .join("") +
    `<polygon points="${area}" fill="${lime}" fill-opacity="0.35"/>` +
    `<polyline points="${xy.join(" ")}" fill="none" stroke="${ink}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<circle cx="${lx}" cy="${ly}" r="7" fill="${lime}" stroke="${ink}" stroke-width="3"/>`;
  return <img alt="" src={svg(body, w, h)} width={w} height={h} />;
}

function Bars({ values, w = 360, h = 230 }: { values: number[]; w?: number; h?: number }) {
  const max = Math.max(...values);
  return (
    <div style={{ ...row, alignItems: "flex-end", gap: 8, width: w, height: h }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            borderRadius: 5,
            background: i >= values.length - 3 ? lime : RAMP[3],
          }}
        />
      ))}
    </div>
  );
}

function Repo() {
  return (
    <div
      style={{
        ...col,
        gap: 18,
        width: 360,
        padding: 24,
        borderRadius: 14,
        background: "#fff",
        border: `1.5px solid ${line}`,
      }}
    >
      <span style={{ fontFamily: sans, fontSize: 30, fontWeight: 500, letterSpacing: -0.5 }}>
        ada-dev / lumen
      </span>
      <span style={{ fontFamily: sans, fontSize: 19, color: muted, lineHeight: 1.4 }}>
        A tiny, typed state machine for interface animation.
      </span>
      <div style={{ ...row, gap: 10 }}>
        {["10.9K STARS", "812 FORKS", "TS"].map((t, i) => (
          <div
            key={t}
            style={{
              ...row,
              padding: "7px 12px",
              borderRadius: 999,
              background: i === 0 ? lime : "#eceae4",
              fontFamily: mono,
              fontSize: 15,
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function Contributors() {
  const people: [string, number, string][] = [
    ["AP", 1, lime],
    ["JS", 0.78, "#c9cbb8"],
    ["MK", 0.55, "#a3a98a"],
    ["RL", 0.36, "#dcdbd4"],
  ];
  return (
    <div style={{ ...col, gap: 18, width: 360 }}>
      {people.map(([who, share, c]) => (
        <div key={who} style={{ ...row, gap: 16 }}>
          <div
            style={{
              ...row,
              justifyContent: "center",
              width: 46,
              height: 46,
              borderRadius: 23,
              background: c,
              fontFamily: mono,
              fontSize: 15,
            }}
          >
            {who}
          </div>
          <div style={{ ...row, flex: 1, height: 14, borderRadius: 7, background: "#e7e6df" }}>
            <div
              style={{ width: `${share * 100}%`, height: 14, borderRadius: 7, background: RAMP[4] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Sponsors() {
  const rows = [
    ["Northwind", "Orbit", "Hexa"],
    ["Kestrel Cloud", "Tidal"],
    ["Quill", "Daybreak", "Acme"],
  ];
  return (
    <div style={{ ...col, gap: 12, alignItems: "center" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ ...row, gap: 12 }}>
          {r.map((name, j) => (
            <div
              key={name}
              style={{
                ...row,
                padding: name.length > 8 ? "16px 22px" : "12px 16px",
                borderRadius: 12,
                background: (i + j) % 3 === 0 ? lime : (i + j) % 3 === 1 ? "#fff" : "#e5e4dd",
                border: `1.5px solid ${line}`,
                fontFamily: sans,
                fontSize: name.length > 8 ? 22 : 18,
                fontWeight: 500,
              }}
            >
              {name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** A knob with ticks round the dial, set to 72%. */
function Knob() {
  const s = 250;
  const c = s / 2;
  const ticks = Array.from({ length: 31 }, (_, i) => {
    const a = ((-135 + i * 9) * Math.PI) / 180;
    const on = i <= 22;
    const r1 = i % 5 === 0 ? 100 : 106;
    return `<line x1="${c + r1 * Math.sin(a)}" y1="${c - r1 * Math.cos(a)}" x2="${c + 116 * Math.sin(a)}" y2="${c - 116 * Math.cos(a)}" stroke="${on ? "#5d6a33" : "#cfcec6"}" stroke-width="${i % 5 === 0 ? 3.5 : 2.5}" stroke-linecap="round"/>`;
  }).join("");
  const a = ((-135 + 0.72 * 270) * Math.PI) / 180;
  const body =
    ticks +
    `<circle cx="${c}" cy="${c}" r="86" fill="${ink}"/>` +
    `<circle cx="${c}" cy="${c}" r="74" fill="#2b2c28"/>` +
    `<line x1="${c + 30 * Math.sin(a)}" y1="${c - 30 * Math.cos(a)}" x2="${c + 64 * Math.sin(a)}" y2="${c - 64 * Math.cos(a)}" stroke="${lime}" stroke-width="7" stroke-linecap="round"/>`;
  return <img alt="" src={svg(body, s, s)} width={s} height={s} />;
}

function IdCard() {
  return (
    <div
      style={{
        ...col,
        gap: 20,
        width: 340,
        padding: 24,
        borderRadius: 16,
        background: "#fff",
        border: `1.5px solid ${line}`,
      }}
    >
      <div style={{ ...row, justifyContent: "space-between" }}>
        <Label>OVIO / ID</Label>
        <Label color={muted}>NO. 024</Label>
      </div>
      <div style={{ ...row, gap: 18 }}>
        <div
          style={{
            ...row,
            justifyContent: "center",
            width: 84,
            height: 96,
            borderRadius: 12,
            background: lime,
            fontFamily: sans,
            fontSize: 38,
            fontWeight: 500,
          }}
        >
          A
        </div>
        <div style={{ ...col, gap: 8 }}>
          <span style={{ fontFamily: sans, fontSize: 28, fontWeight: 500 }}>Ada Park</span>
          <span style={{ fontFamily: sans, fontSize: 17, color: muted }}>Design engineer</span>
        </div>
      </div>
      <div style={{ ...row, gap: 3, height: 34 }}>
        {Array.from({ length: 46 }, (_, i) => (
          <div
            key={i}
            style={{
              width: (i * 7) % 3 === 0 ? 4 : 2,
              height: 34,
              background: i % 4 === 3 ? "transparent" : ink,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function BundleBars() {
  const rows: [string, number, string][] = [
    ["RAW", 1, RAMP[3]],
    ["GZIP", 0.42, RAMP[4]],
    ["BROTLI", 0.31, lime],
  ];
  return (
    <div style={{ ...col, gap: 24, width: 360 }}>
      {rows.map(([name, share, c]) => (
        <div key={name} style={{ ...col, gap: 8 }}>
          <div style={{ ...row, justifyContent: "space-between" }}>
            <Label>{name}</Label>
            <Label color={muted}>{`${(24.8 * share).toFixed(1)} KB`}</Label>
          </div>
          <div style={{ ...row, height: 26, borderRadius: 8, background: "#e7e6df" }}>
            <div style={{ width: `${share * 100}%`, height: 26, borderRadius: 8, background: c }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** main and a feature branch that forks and merges back. */
function Branches() {
  const w = 360;
  const h = 230;
  const commits = [30, 100, 170, 240, 310];
  const body =
    `<line x1="10" y1="160" x2="${w - 10}" y2="160" stroke="${RAMP[4]}" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M100 160 C 130 160, 120 70, 170 70 L 240 70 C 290 70, 280 160, 310 160" fill="none" stroke="${lime}" stroke-width="5" stroke-linecap="round"/>` +
    commits
      .map(
        (x) =>
          `<circle cx="${x}" cy="160" r="11" fill="#f6f5f1" stroke="${RAMP[4]}" stroke-width="5"/>`,
      )
      .join("") +
    [170, 240]
      .map(
        (x) =>
          `<circle cx="${x}" cy="70" r="11" fill="#f6f5f1" stroke="#8fb82a" stroke-width="5"/>`,
      )
      .join("") +
    `<rect x="248" y="182" width="96" height="30" rx="15" fill="${ink}"/>`;
  return (
    <div style={{ display: "flex", position: "relative", width: w, height: h }}>
      <img alt="" src={svg(body, w, h)} width={w} height={h} />
      <span
        style={{
          position: "absolute",
          left: 262,
          top: 187,
          fontFamily: mono,
          fontSize: 15,
          color: "#f6f5f0",
        }}
      >
        v1.2.0
      </span>
    </div>
  );
}

function Changelog() {
  const releases: [string, string, string][] = [
    ["v2.4.0", "Added", "Keyboard navigation"],
    ["v2.3.1", "Fixed", "Hover on touch screens"],
    ["v2.3.0", "Changed", "Smoother entrance"],
  ];
  return (
    <div style={{ ...col, width: 360 }}>
      {releases.map(([v, kind, what], i) => (
        <div
          key={v}
          style={{
            ...row,
            gap: 16,
            padding: "18px 0",
            borderBottom: i < releases.length - 1 ? `1.5px dashed ${line}` : "none",
          }}
        >
          <div
            style={{ width: 14, height: 14, borderRadius: 7, background: i === 0 ? lime : RAMP[3] }}
          />
          <div style={{ ...col, gap: 6 }}>
            <Label>{`${v} · ${kind.toUpperCase()}`}</Label>
            <span style={{ fontFamily: sans, fontSize: 21, fontWeight: 500 }}>{what}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Player() {
  const s = 190;
  const c = s / 2;
  const grooves = [86, 76, 66, 56]
    .map(
      (r) =>
        `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#33342f" stroke-width="1.5"/>`,
    )
    .join("");
  const body = `<circle cx="${c}" cy="${c}" r="94" fill="${ink}"/>${grooves}<circle cx="${c}" cy="${c}" r="34" fill="${lime}"/><circle cx="${c}" cy="${c}" r="5" fill="${ink}"/>`;
  return (
    <div style={{ ...col, gap: 22, width: 360, alignItems: "center" }}>
      <img alt="" src={svg(body, s, s)} width={s} height={s} />
      <div style={{ ...col, gap: 10, width: 360 }}>
        <div style={{ ...row, justifyContent: "space-between" }}>
          <span style={{ fontFamily: sans, fontSize: 22, fontWeight: 500 }}>Midnight Compile</span>
          <Label color={muted}>2:20 / 3:48</Label>
        </div>
        <div style={{ ...row, height: 8, borderRadius: 4, background: "#e2e1da" }}>
          <div style={{ width: "61%", height: 8, borderRadius: 4, background: ink }} />
        </div>
      </div>
    </div>
  );
}

function Toasts() {
  const toasts: [string, string, string][] = [
    [RAMP[3], "Install command copied", ""],
    ["#b4432a", "Rate limit reached", "Resets in 12 min"],
    [lime, "Live data is back", ""],
  ];
  return (
    <div style={{ ...col, gap: 14, width: 360 }}>
      {toasts.map(([dot, title, note], i) => (
        <div
          key={title}
          style={{
            ...row,
            gap: 14,
            padding: "16px 18px",
            borderRadius: 10,
            border: `1.5px solid ${line}`,
            background: "#fff",
            opacity: 0.55 + i * 0.225,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 6, background: dot }} />
          <div style={{ ...col, gap: 4 }}>
            <span style={{ fontFamily: sans, fontSize: 20, fontWeight: 500 }}>{title}</span>
            {note && <Label color={muted}>{note}</Label>}
          </div>
        </div>
      ))}
    </div>
  );
}

type Art = { label: string; metric?: string; footer?: string[]; draw: () => ReactNode };

const ARTS: Record<string, Art> = {
  "contribution-graph": {
    label: "Contribution graph",
    metric: "1,467 contributions",
    footer: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"],
    draw: Heatmap,
  },
  "event-ticket": {
    label: "Event ticket",
    metric: "NO. 024",
    footer: ["BOOK", "TEAR", "FLIP"],
    draw: Ticket,
  },
  "gooey-tabs": {
    label: "Gooey tabs",
    metric: "4 TABS",
    footer: ["OFFLINE", "BUILDING", "ONLINE"],
    draw: Tabs,
  },
  "star-history": {
    label: "Star history",
    metric: "10,945 STARS",
    footer: ["OCT", "JAN", "APR", "JUL", "SEP"],
    draw: () => <LineChart points={[2, 3, 4, 5, 7, 8, 9, 22, 26, 29, 33, 38, 44, 52, 61]} />,
  },
  "repository-card": {
    label: "Repository card",
    metric: "PUBLIC",
    footer: ["STARS", "FORKS", "ISSUES"],
    draw: Repo,
  },
  "top-contributors": {
    label: "Top contributors",
    metric: "LAST 90 DAYS",
    footer: ["COMMITS", "ADDITIONS"],
    draw: Contributors,
  },
  "npm-downloads": {
    label: "npm downloads",
    metric: "48,210 / WK",
    footer: ["12 WEEKS AGO", "THIS WEEK"],
    draw: () => <Bars values={[18, 22, 21, 26, 30, 28, 33, 37, 35, 41, 46, 48]} />,
  },
  "sponsor-wall": {
    label: "Sponsor wall",
    metric: "THANK YOU",
    footer: ["GOLD", "SILVER", "BACKERS"],
    draw: Sponsors,
  },
  "physical-knob": {
    label: "Physical knob",
    metric: "LEVEL 72",
    footer: ["0", "50", "100"],
    draw: Knob,
  },
  "developer-id-card": {
    label: "Developer ID",
    metric: "VERIFIED",
    footer: ["FLIP", "TILT", "SCAN"],
    draw: IdCard,
  },
  "bundle-size": {
    label: "Bundle size",
    metric: "lumen@1.2.0",
    footer: ["RAW", "GZIP", "BROTLI"],
    draw: BundleBars,
  },
  "git-branch-visualizer": {
    label: "Git branches",
    metric: "main",
    footer: ["BRANCH", "MERGE", "TAG"],
    draw: Branches,
  },
  changelog: {
    label: "Changelog",
    metric: "v2.4.0",
    footer: ["ADDED", "FIXED", "CHANGED"],
    draw: Changelog,
  },
  "now-playing": {
    label: "Now playing",
    metric: "LIVE",
    footer: ["PLAY", "SCRUB", "SKIP"],
    draw: Player,
  },
  toast: {
    label: "Toast",
    metric: "3 queued",
    footer: ["SUCCESS", "ERROR", "INFO"],
    draw: Toasts,
  },
};

/** The right-hand card for a component; the contribution graph for anything else. */
export function ComponentArt({ slug }: { slug?: string }) {
  const art = (slug && ARTS[slug]) || ARTS["contribution-graph"];
  return (
    <ArtCard label={art.label} metric={art.metric} footer={art.footer}>
      {art.draw()}
    </ArtCard>
  );
}
