import { initialsOf } from "@/components/shared/initials";
import type { DeveloperIdCardProps, DeveloperIdCardWorldProps } from "./developer-id-card";

/**
 * What every world draws from the card's props: initials, the short title, the profile and site
 * without their protocol, and what the QR code opens. Plain, so the component and the README
 * embed read the same card.
 */

/** Square cells as one path: `M x y h1v1h-1z` per dark cell. */
export function cellsPath(cells: boolean[][]): string {
  let d = "";
  cells.forEach((row, y) =>
    row.forEach((on, x) => {
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }),
  );
  return d;
}

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** A mirrored 8×8 sprite seeded by the name, so each developer gets the same face every time. */
export function sprite(name: string): string {
  let s = 7;
  for (const ch of name) s = (s * 31 + ch.charCodeAt(0)) % 2147483647;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const rows = Array.from({ length: 8 }, () => {
    const half = Array.from({ length: 4 }, () => rand() > 0.45);
    return [...half, ...[...half].reverse()];
  });
  return cellsPath(rows);
}

type CardData = Omit<DeveloperIdCardProps, "variant" | "className">;

export function readIdCard({
  name,
  title,
  stack = [],
  github,
  url,
  website,
  location,
  available,
  avatarUrl,
  serial,
  since,
}: CardData): Omit<DeveloperIdCardWorldProps, "className"> {
  return {
    name,
    initials: initialsOf(name),
    title,
    shortTitle: title?.replace(/^Senior\b/i, "Sr."),
    stack,
    profile: github ? `github.com/${github}` : undefined,
    website: website ? stripProtocol(website) : undefined,
    location,
    available,
    avatarUrl,
    serial,
    since,
    qrUrl: url ?? (github ? `https://github.com/${github}` : undefined),
  };
}
