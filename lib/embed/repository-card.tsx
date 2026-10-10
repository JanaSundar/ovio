import type { ReactElement } from "react";
import { repoLanguage, type RepoLanguage } from "@/components/ovio/repository-card/language";
import type { Repository } from "@/components/ovio/repository-card/repository-card";
import { COMPACT, dots, formatNumber } from "@/lib/format";
import type { World } from "@/lib/world";
import {
  clampLines,
  col,
  CraftTape,
  firstSentence,
  fitSize,
  Icon,
  inkOn,
  Margin,
  Mark,
  oneLine,
  retroText,
  row,
  toyKey,
  toyText,
} from "./parts";
import { CRAFT, MINIMAL, RETRO, TOY } from "./tokens";

/**
 * The Repository Card as a still image for a README, one drawing per world, sized like a
 * pinned repo so two sit side by side. Follows components/ovio/repository-card/worlds.
 * Every card is the same height for any repo: names are cut to one line and descriptions to
 * two, with the space kept when there is none.
 */

type Props = { repo: Repository; language?: RepoLanguage; description: string };

const compact = (n: number) => formatNumber(n, COMPACT).toLowerCase();

function Minimal({ repo, language, description }: Props) {
  const stat = { ...row, gap: 5, fontFamily: MINIMAL.mono } as const;
  return (
    <div
      style={{
        ...col,
        width: 420,
        padding: "24px 26px 20px",
        background: MINIMAL.surface,
        border: `1px solid ${MINIMAL.line}`,
        borderRadius: 8,
        fontFamily: MINIMAL.font,
        color: MINIMAL.ink,
      }}
    >
      <span style={{ ...oneLine, fontSize: 12, color: MINIMAL.muted, marginBottom: 6 }}>
        {`${repo.owner} /`}
      </span>
      <span style={{ ...oneLine, fontSize: 22, fontWeight: 500, letterSpacing: -0.4 }}>
        {repo.name}
      </span>
      <span style={{ ...clampLines(2, 14, 1.5), color: MINIMAL.ink2, marginTop: 10 }}>
        {description}
      </span>
      <div
        style={{
          ...row,
          gap: 20,
          marginTop: 18,
          paddingTop: 14,
          borderTop: `1px solid ${MINIMAL.line2}`,
          fontSize: 13,
          color: MINIMAL.ink2,
        }}
      >
        {language && (
          <span style={{ ...row, gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: language.color }} />
            {language.name}
          </span>
        )}
        <span style={stat}>
          <Icon name="star" color={MINIMAL.ink2} />
          {compact(repo.stars)}
        </span>
        <span style={stat}>
          <Icon name="fork" color={MINIMAL.ink2} />
          {compact(repo.forks)}
        </span>
        <Mark
          style={{
            marginLeft: "auto",
            fontFamily: MINIMAL.mono,
            fontSize: 11,
            color: MINIMAL.faint,
          }}
        />
      </div>
    </div>
  );
}

/** A printed count on a paper pill, "12.7k forks". */
function Pill({ children }: { children: string }) {
  return (
    <span
      style={{
        ...oneLine,
        flexShrink: 0,
        padding: "5px 11px",
        borderRadius: 999,
        background: CRAFT.surface2,
        fontSize: 13,
      }}
    >
      {children}
    </span>
  );
}

function Craft({ repo, language, description }: Props) {
  return (
    <Margin x={22} y={26}>
      <div
        style={{
          ...col,
          position: "relative",
          width: 390,
          padding: "28px 28px 24px",
          background: CRAFT.surface,
          borderRadius: 10,
          fontFamily: CRAFT.font,
          color: CRAFT.ink,
          transform: "rotate(-0.6deg)",
          boxShadow: CRAFT.shadow,
        }}
      >
        <CraftTape left={26} width={84} rotate={-4} />
        {language && (
          <div
            style={{
              ...row,
              position: "absolute",
              top: -18,
              right: -14,
              width: 58,
              height: 58,
              borderRadius: 29,
              justifyContent: "center",
              background: language.color,
              color: inkOn(language.color),
              fontSize: 20,
              fontWeight: 800,
              transform: "rotate(-10deg)",
              boxShadow: "0 4px 10px -3px rgba(20,40,90,.5)",
            }}
          >
            {language.short}
          </div>
        )}
        {/* Clear of the language badge in the corner. */}
        <span style={{ ...oneLine, fontSize: 13, color: CRAFT.muted, paddingRight: 40 }}>
          {`${repo.owner} /`}
        </span>
        <span
          style={{
            ...oneLine,
            // A fixed line box, so a long name set smaller leaves the card the same height.
            fontSize: fitSize(repo.name, 32, 16),
            fontWeight: 800,
            letterSpacing: -1,
            height: 38,
            lineHeight: "38px",
            paddingRight: 24,
          }}
        >
          {repo.name}
        </span>
        <span style={{ ...clampLines(2, 15, 1.45), color: CRAFT.ink2, marginTop: 6 }}>
          {description}
        </span>
        <div style={{ ...row, gap: 10, marginTop: 16 }}>
          <span
            style={{
              ...row,
              flexShrink: 0,
              gap: 5,
              marginRight: 4,
              fontFamily: CRAFT.hand,
              fontSize: 30,
              lineHeight: 1,
              color: CRAFT.accentDeep,
            }}
          >
            <span style={{ display: "flex", transform: "rotate(-10deg)", marginTop: -2 }}>
              <Icon name="doodle" color={CRAFT.accentDeep} size={22} />
            </span>
            {compact(repo.stars)}
          </span>
          <Pill>{`${compact(repo.forks)} forks`}</Pill>
          {repo.issues !== undefined && <Pill>{`${compact(repo.issues)} issues`}</Pill>}
        </div>
      </div>
    </Margin>
  );
}

function Retro({ repo, language, description }: Props) {
  const lines = [
    ["STARS", formatNumber(repo.stars)],
    ["FORKS", formatNumber(repo.forks)],
    ["LANG", language?.short ?? "--"],
  ];
  return (
    <div style={{ ...col, width: 420, padding: 6, background: RETRO.stage }}>
      <div style={{ ...col, ...retroText, border: `4px double ${RETRO.accent}` }}>
        <div
          style={{
            ...row,
            justifyContent: "space-between",
            padding: "4px 10px",
            background: RETRO.accent,
            color: RETRO.stage,
            fontSize: 20,
            textShadow: "none",
          }}
        >
          <span>REPO.EXE</span>
          <span>[X]</span>
        </div>
        <div style={{ ...col, padding: "14px 18px", fontSize: 22, lineHeight: 1.2 }}>
          <span style={oneLine}>{`> ${repo.owner}/${repo.name}_`.toUpperCase()}</span>
          <span style={{ ...clampLines(2, 22, 1.2), color: RETRO.ink2, margin: "8px 0 12px" }}>
            {description.replace(/\.$/, "").toUpperCase()}
          </span>
          {lines.map(([label, value]) => (
            <span key={label}>{dots(label) + value}</span>
          ))}
          <span style={{ ...row, justifyContent: "flex-end", color: RETRO.ink2, marginTop: -26 }}>
            <Mark style={{}} />
          </span>
        </div>
      </div>
    </div>
  );
}

function Toy({ repo, language, description }: Props) {
  const key = { ...row, gap: 7, justifyContent: "center", padding: "13px 0" } as const;
  const keyText = { fontSize: 15, fontWeight: 800 } as const;
  return (
    <Margin x={12} y={18}>
      <div
        style={{
          ...col,
          ...toyText,
          width: 400,
          gap: 14,
          padding: 14,
          borderRadius: 22,
          background: TOY.surface,
          boxShadow: "inset 0 1px 0 #fff, 0 7px 0 #d2ccbf, 0 22px 30px -16px rgba(40,28,10,.45)",
        }}
      >
        <div
          style={{
            ...col,
            position: "relative",
            height: 98,
            justifyContent: "center",
            padding: "0 20px",
            borderRadius: 14,
            background: TOY.blue[0],
            color: "#ffffff",
            boxShadow: "inset 0 -4px 0 rgba(0,0,0,.2), inset 0 2px 0 rgba(255,255,255,.2)",
          }}
        >
          <span
            style={{
              ...oneLine,
              fontFamily: TOY.mono,
              fontSize: 11,
              letterSpacing: 0.9,
              paddingRight: 40,
            }}
          >
            {`${repo.owner.toUpperCase()} /`}
          </span>
          <span
            style={{
              ...oneLine,
              fontSize: fitSize(repo.name, 40, 13),
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            {repo.name}
          </span>
          <div style={{ ...row, gap: 6, position: "absolute", top: 14, right: 14 }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{ width: 11, height: 11, borderRadius: 6, background: TOY.blue[1] }}
              />
            ))}
          </div>
        </div>
        <span style={{ ...clampLines(2, 14, 1.45), color: TOY.ink2, margin: "0 6px" }}>
          {description}
        </span>
        <div style={{ ...row, gap: 10, alignItems: "stretch", marginBottom: 6 }}>
          <div style={{ ...key, ...toyKey(TOY.yellow), flex: 1.4 }}>
            <Icon name="star" color={TOY.ink} size={14} />
            <span style={keyText}>{formatNumber(repo.stars)}</span>
          </div>
          <div style={{ ...key, ...toyKey(TOY.white), flex: 1 }}>
            <Icon name="fork" color={TOY.ink} size={14} />
            <span style={keyText}>{formatNumber(repo.forks)}</span>
          </div>
          <div
            style={{
              ...col,
              width: 64,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              background: "#e6e1d6",
              boxShadow: "inset 0 3px 5px rgba(40,28,10,.25)",
            }}
          >
            {language ? (
              <div
                style={{
                  ...row,
                  ...toyKey(TOY.blue, 3),
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {language.short}
              </div>
            ) : (
              <span style={{ fontSize: 15, fontWeight: 800, color: TOY.faint }}>–</span>
            )}
          </div>
        </div>
        <Mark
          style={{
            alignSelf: "flex-end",
            marginTop: -4,
            fontSize: 11,
            fontWeight: 800,
            color: TOY.faint,
          }}
        />
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

export function RepositoryCardEmbed({ world, repo }: { world: World; repo: Repository }) {
  const View = VIEWS[world];
  const description = repo.description ? firstSentence(repo.description) : "No description.";
  return <View repo={repo} language={repoLanguage(repo)} description={description} />;
}
