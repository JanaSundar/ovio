import type { ReactElement } from "react";
import { readIdCard, sprite } from "@/components/ovio/developer-id-card/card";
import type { DeveloperIdCardWorldProps } from "@/components/ovio/developer-id-card/developer-id-card";
import { dots } from "@/lib/format";
import type { Developer } from "@/lib/github";
import type { World } from "@/lib/world";
import {
  clampLines,
  col,
  CraftTape,
  Face,
  fitSize,
  Icon,
  Margin,
  Mark,
  oneLine,
  Qr,
  retroText,
  row,
  toyKey,
  toyText,
} from "./parts";
import { CRAFT, MINIMAL, RETRO, TOY } from "./tokens";

/**
 * The Developer ID Card as a still image for a README, one drawing per world, from the same
 * fields the component derives (components/ovio/developer-id-card/card.ts). Every field but the
 * name may be missing; each world draws what there is.
 */

type Card = Omit<DeveloperIdCardWorldProps, "className">;

/** Stack stickers and keys, as the Craft and Toy worlds colour them. */
const STICKERS = [
  ["#2b4a9b", "#fff"],
  [CRAFT.accent, "#fff"],
  ["#2f9a45", "#fff"],
  ["#ffe27a", CRAFT.ink],
] as const;
const KEYS = [TOY.blue, TOY.red, ["#33b07a", "#1f7c52"], TOY.yellow] as const;

function Minimal(c: Card) {
  return (
    <div
      style={{
        ...col,
        width: 380,
        gap: 20,
        padding: 28,
        background: MINIMAL.surface,
        border: `1px solid ${MINIMAL.line}`,
        borderRadius: 10,
        fontFamily: MINIMAL.font,
        color: MINIMAL.ink,
      }}
    >
      <div
        style={{
          ...row,
          justifyContent: "space-between",
          fontFamily: MINIMAL.mono,
          fontSize: 11,
          color: MINIMAL.muted,
        }}
      >
        <span>{`developer${c.serial ? ` / ${c.serial}` : ""}`}</span>
        {c.available && (
          <span style={{ ...row, gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: 4, background: "#2f9a45" }} />
            available
          </span>
        )}
      </div>
      <div style={{ ...row, gap: 16 }}>
        <Face
          src={c.avatarUrl}
          name={c.name}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            background: "#efede8",
            fontSize: 20,
            fontWeight: 500,
          }}
        />
        <div style={{ ...col, minWidth: 0, flex: 1 }}>
          <span
            style={{
              ...clampLines(2, 24, 1.15),
              height: "auto",
              fontWeight: 500,
              letterSpacing: -0.7,
            }}
          >
            {c.name}
          </span>
          {c.title && (
            <span style={{ ...clampLines(2, 14, 1.4), height: "auto", color: MINIMAL.muted }}>
              {c.title}
            </span>
          )}
        </div>
      </div>
      {c.stack.length > 0 && (
        <div style={{ ...row, flexWrap: "wrap", gap: 6 }}>
          {c.stack.map((tech) => (
            <span
              key={tech}
              style={{
                padding: "4px 10px",
                border: `1px solid ${MINIMAL.line}`,
                borderRadius: 999,
                fontSize: 12,
                color: MINIMAL.ink2,
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}
      <div
        style={{
          ...row,
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          paddingTop: 16,
          borderTop: `1px solid ${MINIMAL.line2}`,
          fontSize: 13,
        }}
      >
        <div style={{ ...col, minWidth: 0, flex: 1, gap: 3 }}>
          {c.location && <span style={{ ...oneLine, color: MINIMAL.muted }}>{c.location}</span>}
          {c.profile && (
            <span style={{ ...oneLine, fontFamily: MINIMAL.mono, fontSize: 12 }}>{c.profile}</span>
          )}
          <Mark style={{ fontFamily: MINIMAL.mono, fontSize: 11, color: MINIMAL.faint }} />
        </div>
        {c.qrUrl && <Qr value={c.qrUrl} size={56} color={MINIMAL.ink} />}
      </div>
    </div>
  );
}

function Craft(c: Card) {
  const [first, ...rest] = c.name.split(/\s+/);
  // Both lines share one size, set by the longer, so "JanaSundar" fits as "Ada" does.
  const nameSize = fitSize([first, rest.join(" ")].sort((a, b) => b.length - a.length)[0], 38, 8);
  const label = { fontFamily: CRAFT.mono, textTransform: "uppercase" } as const;
  const sheet = (background: string, x: number, y: number, rotate: number) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 8,
        background,
        transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
        boxShadow: "0 2px 3px rgba(70,45,20,.15)",
      }}
    />
  );
  return (
    <Margin x={24} y={30}>
      <div style={{ ...col, position: "relative", width: 380 }}>
        {sheet("#e4d6bd", -3, 8, -1.2)}
        {sheet("#f2e8d4", 3, 4, 1)}
        <div
          style={{
            ...col,
            position: "relative",
            padding: "26px 28px 24px",
            borderRadius: 8,
            background: CRAFT.surface,
            fontFamily: CRAFT.font,
            color: CRAFT.ink,
            boxShadow: CRAFT.shadow,
          }}
        >
          <CraftTape left={142} width={96} rotate={-2.5} top={-13} />
          <div
            style={{
              ...row,
              ...label,
              justifyContent: "space-between",
              fontSize: 10.5,
              letterSpacing: 1.4,
              color: CRAFT.muted,
            }}
          >
            <span>{`Developer${c.serial ? ` / ${c.serial}` : ""}`}</span>
            {c.since && <span>{`Est. ${c.since}`}</span>}
          </div>
          <div style={{ height: 1, margin: "10px 0 18px", background: "rgba(42,31,20,.2)" }} />
          <div style={{ ...row, alignItems: "flex-end", gap: 18 }}>
            <div style={{ position: "relative", display: "flex", flexShrink: 0 }}>
              <Face
                src={c.avatarUrl}
                name={c.name}
                initials={false}
                style={{
                  width: 104,
                  height: 124,
                  borderRadius: 4,
                  transform: "rotate(-1.5deg)",
                  backgroundColor: CRAFT.accent,
                  backgroundImage:
                    "repeating-linear-gradient(135deg, rgba(255,255,255,.16) 0px, rgba(255,255,255,.16) 7px, transparent 7px, transparent 14px)",
                  boxShadow: "0 2px 4px rgba(70,45,20,.25)",
                }}
              />
              <div
                style={{
                  ...row,
                  position: "absolute",
                  top: -8,
                  right: -8,
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  justifyContent: "center",
                  background: "#ffe27a",
                  fontSize: 12,
                  fontWeight: 800,
                  transform: "rotate(12deg)",
                  boxShadow: "0 3px 6px -2px rgba(90,60,0,.5)",
                }}
              >
                {c.initials}
              </div>
            </div>
            <div style={{ ...col, minWidth: 0, flex: 1 }}>
              <span
                style={{
                  ...oneLine,
                  fontSize: nameSize,
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: -1.7,
                }}
              >
                {first}
              </span>
              {rest.length > 0 && (
                <span
                  style={{
                    ...oneLine,
                    fontSize: nameSize,
                    fontWeight: 800,
                    lineHeight: 0.95,
                    letterSpacing: -1.7,
                  }}
                >
                  {rest.join(" ")}
                </span>
              )}
              {c.title && (
                <span
                  style={{
                    ...label,
                    ...clampLines(2, 10.5, 1.5),
                    height: "auto",
                    marginTop: 10,
                    letterSpacing: 1,
                    color: CRAFT.ink2,
                  }}
                >
                  {c.title}
                </span>
              )}
            </div>
          </div>
          {c.stack.length > 0 && (
            <div style={{ ...row, flexWrap: "wrap", gap: 6, marginTop: 20 }}>
              {c.stack.map((tech, i) => {
                const [bg, fg] = STICKERS[i % STICKERS.length];
                return (
                  <span
                    key={tech}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: bg,
                      color: fg,
                      fontSize: 12.5,
                      fontWeight: 800,
                    }}
                  >
                    {tech}
                  </span>
                );
              })}
            </div>
          )}
          <div
            style={{
              ...row,
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 14,
              marginTop: 20,
            }}
          >
            <div
              style={{
                ...col,
                ...label,
                minWidth: 0,
                flex: 1,
                gap: 10,
                fontSize: 12.5,
                letterSpacing: 0.7,
              }}
            >
              {c.location && (
                <div style={col}>
                  <span style={{ fontSize: 9.5, color: CRAFT.muted }}>Based in</span>
                  <span style={oneLine}>{c.location}</span>
                </div>
              )}
              {c.available && (
                <span style={{ ...row, gap: 7 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 5, background: "#2f9a45" }} />
                  Available
                </span>
              )}
              {(c.profile || c.website) && (
                <div style={{ ...col, fontSize: 11.5, textTransform: "none", color: "#2b4a9b" }}>
                  {c.profile && <span style={oneLine}>{c.profile}</span>}
                  {c.website && <span style={oneLine}>{c.website}</span>}
                </div>
              )}
            </div>
            {c.qrUrl && (
              <div
                style={{
                  display: "flex",
                  padding: 6,
                  borderRadius: 4,
                  background: "#fff",
                  transform: "rotate(1.5deg)",
                  boxShadow: "0 2px 4px rgba(70,45,20,.2)",
                }}
              >
                <Qr value={c.qrUrl} size={74} color={CRAFT.ink} />
              </div>
            )}
          </div>
          {c.available && (
            <span
              style={{
                ...row,
                gap: 6,
                position: "absolute",
                bottom: -26,
                left: 104,
                fontFamily: CRAFT.hand,
                fontSize: 26,
                color: CRAFT.accentDeep,
                transform: "rotate(-4deg)",
              }}
            >
              open to work
              <Icon name="sparkle" color={CRAFT.accentDeep} size={14} />
            </span>
          )}
        </div>
      </div>
    </Margin>
  );
}

function Retro(c: Card) {
  const lines: [string, string][] = [];
  if (c.serial) lines.push(["ID", `DEV-${c.serial}`]);
  if (c.location) lines.push(["LOC", c.location.toUpperCase()]);
  if (c.stack.length) lines.push(["STACK", c.stack.join(" ").toUpperCase()]);
  if (c.available) lines.push(["STATUS", "AVAILABLE"]);
  if (c.profile) lines.push(["GITHUB", c.profile.toUpperCase()]);
  const face = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges"><path d="${sprite(c.name)}" fill="${RETRO.ink}"/></svg>`,
  )}`;
  return (
    <div style={{ ...col, width: 420, padding: 6, background: RETRO.stage }}>
      <div style={{ ...col, ...retroText, border: `4px double ${RETRO.accent}` }}>
        <div
          style={{
            ...row,
            justifyContent: "space-between",
            padding: "3px 10px",
            background: RETRO.accent,
            color: RETRO.stage,
            fontSize: 20,
            textShadow: "none",
          }}
        >
          <span>IDCARD.EXE</span>
          <span>[X]</span>
        </div>
        <div style={{ ...col, gap: 14, padding: "16px 18px", fontSize: 22, lineHeight: 1.1 }}>
          <div style={{ ...row, gap: 16 }}>
            <div
              style={{
                display: "flex",
                flexShrink: 0,
                padding: 8,
                border: `2px solid ${RETRO.ink2}`,
                background: "#0a1f0e",
              }}
            >
              <img alt="" src={face} width={76} height={76} />
            </div>
            <div style={{ ...col, minWidth: 0, flex: 1 }}>
              <span style={{ ...clampLines(2, 34, 1), height: "auto", color: RETRO.bright }}>
                {c.name.toUpperCase()}
              </span>
              {c.shortTitle && (
                <span style={{ ...oneLine, marginTop: 4, color: RETRO.ink2 }}>
                  {c.shortTitle.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          {lines.length > 0 && (
            <div style={{ ...col, paddingTop: 10, borderTop: "1px dashed #1d5a2b" }}>
              {lines.map(([label, value]) => (
                <span
                  key={label}
                  style={{ ...oneLine, color: label === "STATUS" ? "#ffd34d" : RETRO.ink }}
                >
                  {dots(label) + value}
                </span>
              ))}
            </div>
          )}
          <div style={{ ...row, alignItems: "flex-end", justifyContent: "space-between" }}>
            <span style={{ ...row, gap: 16, color: RETRO.ink2 }}>
              {"> _█"}
              <Mark style={{}} />
            </span>
            {c.qrUrl && <Qr value={c.qrUrl} size={64} color={RETRO.ink} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toy(c: Card) {
  const place = c.location?.split(",")[0].toUpperCase();
  const small = { fontFamily: TOY.mono, fontSize: 11 } as const;
  return (
    <Margin x={12} y={20}>
      <div
        style={{
          ...col,
          ...toyText,
          width: 340,
          gap: 12,
          padding: 14,
          borderRadius: 24,
          background: TOY.surface,
          boxShadow: "inset 0 1px 0 #fff, 0 8px 0 #d2ccbf, 0 28px 34px -16px rgba(40,28,10,.5)",
        }}
      >
        <div
          style={{
            alignSelf: "center",
            width: 58,
            height: 14,
            borderRadius: 7,
            background: "#e3dfd5",
            boxShadow: "inset 0 3px 5px rgba(40,28,10,.3)",
          }}
        />
        <div
          style={{
            ...row,
            gap: 14,
            padding: 16,
            borderRadius: 16,
            background: TOY.blue[0],
            color: "#ffffff",
            boxShadow: "inset 0 -5px 0 rgba(0,0,0,.2), inset 0 2px 0 rgba(255,255,255,.2)",
          }}
        >
          <Face
            src={c.avatarUrl}
            name={c.name}
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              background: TOY.yellow[0],
              color: TOY.ink,
              fontSize: 24,
              fontWeight: 800,
              boxShadow: `0 5px 0 ${TOY.yellow[1]}`,
            }}
          />
          <div style={{ ...col, minWidth: 0, flex: 1 }}>
            <span
              style={{
                ...clampLines(2, 28, 1),
                height: "auto",
                fontWeight: 800,
                letterSpacing: -0.8,
              }}
            >
              {c.name}
            </span>
            {c.shortTitle && (
              <span
                style={{
                  ...small,
                  ...oneLine,
                  marginTop: 6,
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                }}
              >
                {c.shortTitle}
              </span>
            )}
          </div>
        </div>
        {c.stack.length > 0 && (
          <div style={{ ...row, flexWrap: "wrap", gap: 8, paddingBottom: 6 }}>
            {c.stack.map((tech, i) => {
              const plastic = KEYS[i % KEYS.length];
              return (
                <span
                  key={tech}
                  style={{
                    ...oneLine,
                    ...toyKey(plastic, 5),
                    // Keys keep their width and wrap to a new row, as the component's do.
                    flex: "1 0 auto",
                    minWidth: 60,
                    maxWidth: "100%",
                    padding: "10px 8px",
                    borderRadius: 11,
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: plastic === TOY.yellow ? TOY.ink : "#ffffff",
                  }}
                >
                  {tech}
                </span>
              );
            })}
          </div>
        )}
        <div
          style={{
            ...row,
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 14px",
            borderRadius: 14,
            background: "#ebe6db",
            boxShadow: "inset 0 3px 6px rgba(40,28,10,.2)",
          }}
        >
          <div style={{ ...col, ...small, minWidth: 0, flex: 1, gap: 3 }}>
            {(place || c.profile) && (
              <span style={{ ...oneLine, color: TOY.muted }}>
                {[place, c.profile].filter(Boolean).join(" · ")}
              </span>
            )}
            {c.available && (
              <span style={{ ...row, gap: 7 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    background: "#33b07a",
                    boxShadow: "0 0 0 3px rgba(51,176,122,.25)",
                  }}
                />
                AVAILABLE
              </span>
            )}
            <Mark style={{ fontWeight: 800, color: TOY.faint }} />
          </div>
          {c.qrUrl && <Qr value={c.qrUrl} size={52} color={TOY.ink} />}
        </div>
      </div>
    </Margin>
  );
}

const VIEWS: Record<World, (card: Card) => ReactElement> = {
  minimal: Minimal,
  craft: Craft,
  retro: Retro,
  toy: Toy,
};

export function DeveloperIdCardEmbed({ world, developer }: { world: World; developer: Developer }) {
  const View = VIEWS[world];
  return <View {...readIdCard(developer)} />;
}
