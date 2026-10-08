import type { ReactNode } from "react";

/** 1200×630, the size every network shows. */
export const OG_SIZE = { width: 1200, height: 630 };

export const ink = "#161614";
export const paper = "#f3f2ee";
export const muted = "#6f716a";
const rule = "#bdbcb3";

export const mono = '"DM Mono", monospace';
export const sans = '"DM Sans", sans-serif';
const display = "Archivo, sans-serif";

/** A component name on one line, or split across two at the word nearest the middle. */
export function splitTitle(name: string): string[] {
  if (name.length <= 13) return [name];
  const words = name.split(" ");
  let best = 1;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ").length;
    const b = words.slice(0, best).join(" ").length;
    if (Math.abs(a - name.length / 2) < Math.abs(b - name.length / 2)) best = i;
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** The guide lines of the grid, and the + marks where they cross. */
const ROWS = [56, 176, 496, 576];
const COLS = [32, 212, 392, 710, 1168];
const MARKS = [32, 710, 1168];

const dots = (direction: "right" | "bottom") =>
  `repeating-linear-gradient(to ${direction}, ${rule} 0px, ${rule} 1.5px, transparent 1.5px, transparent 6px)`;

function Grid() {
  return (
    <>
      {ROWS.map((y) => (
        <div
          key={`r${y}`}
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: y,
            height: 1.5,
            backgroundImage: dots("right"),
          }}
        />
      ))}
      {COLS.map((x) => (
        <div
          key={`c${x}`}
          style={{
            position: "absolute",
            top: 12,
            bottom: 12,
            left: x,
            width: 1.5,
            backgroundImage: dots("bottom"),
          }}
        />
      ))}
      {ROWS.flatMap((y) =>
        MARKS.map((x) => (
          <div
            key={`m${x}-${y}`}
            style={{
              position: "absolute",
              left: x - 7,
              top: y - 7,
              width: 15,
              height: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "absolute", width: 15, height: 1.5, background: "#5b5c56" }} />
            <div style={{ position: "absolute", width: 1.5, height: 15, background: "#5b5c56" }} />
          </div>
        )),
      )}
    </>
  );
}

/** The Ovio mark: an open ring with a tail, white on black (app/icon.svg). */
const LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="22" fill="#000"/><path d="M70 26 A30 30 0 1 0 78 52 C80 40 84 34 90 30" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/></svg>',
)}`;

export function Label({
  children,
  color = ink,
  size = 15,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
}) {
  return (
    <span
      style={{
        fontFamily: mono,
        fontSize: size,
        letterSpacing: size / 10,
        whiteSpace: "nowrap",
        color,
      }}
    >
      {children}
    </span>
  );
}

/** The right-hand card: a dotted frame with a label row, the drawing, and a footer row. */
export function ArtCard({
  label,
  metric,
  footer,
  children,
}: {
  label: string;
  metric?: string;
  footer?: string[];
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 731,
        top: 83,
        width: 418,
        height: 463,
        display: "flex",
        flexDirection: "column",
        padding: "28px 24px 26px",
        borderRadius: 16,
        border: `1.5px dashed ${rule}`,
        background: "#f6f5f1",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 16,
        }}
      >
        <Label size={13.5}>{label.toUpperCase()}</Label>
        {metric && <Label size={13.5}>{metric}</Label>}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: "18px 0",
        }}
      >
        {children}
      </div>
      {footer && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {footer.map((f) => (
            <Label key={f}>{f}</Label>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * An Ovio OG image, after the brand card: the mark, a heavy condensed headline, two counts along
 * the bottom rule, and a card on the right showing the thing itself.
 */
export function OgFrame({
  title,
  description,
  footLeft,
  footRight,
  card,
}: {
  title: string[];
  description?: string;
  footLeft: string;
  footRight: string;
  card: ReactNode;
}) {
  // As large as the longest line allows across the 650px column (measured, a character of
  // condensed Archivo Black is about 0.35em wide with this tracking), smaller when a
  // description shares the space.
  const longest = Math.max(...title.map((l) => l.length));
  const size = Math.min(description ? 104 : 110, Math.floor(630 / (longest * 0.37)));

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        background: paper,
        color: ink,
      }}
    >
      <Grid />
      <img
        alt="Ovio"
        src={LOGO}
        width={78}
        height={78}
        style={{ position: "absolute", left: 56, top: 78 }}
      />

      <div
        style={{
          position: "absolute",
          left: 52,
          top: 190,
          width: 650,
          height: 300,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 22,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {title.map((line) => (
            <span
              key={line}
              style={{
                fontFamily: display,
                fontWeight: 900,
                // Archivo's narrowest width, as in the brand card.
                fontStretch: "62%",
                fontVariationSettings: "'wdth' 62",
                fontSize: size,
                lineHeight: 0.88,
                // A hair of space: at this weight, tighter tracking makes letters touch.
                letterSpacing: 1,
              }}
            >
              {line}
            </span>
          ))}
        </div>
        {description && (
          <span
            style={{ fontFamily: sans, fontSize: 25, lineHeight: 1.35, color: muted, width: 600 }}
          >
            {description}
          </span>
        )}
      </div>

      <div style={{ position: "absolute", left: 57, top: 527, display: "flex" }}>
        <Label>{footLeft}</Label>
      </div>
      <div
        style={{
          position: "absolute",
          right: 1200 - 690,
          top: 527,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Label>{footRight}</Label>
      </div>

      {card}
    </div>
  );
}
