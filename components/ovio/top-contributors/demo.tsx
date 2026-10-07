"use client";

import { TopContributors, type Contributor } from "./top-contributors";

/** lumen's contributors. The ranking shifts between windows: Mei leads the last 30 days. */
const CONTRIBUTORS: Contributor[] = [
  { login: "ada-dev", name: "Ada Okafor", commits: 1248, byPeriod: { "30d": 61, "90d": 212 } },
  { login: "meitanaka", name: "Mei Tanaka", commits: 812, byPeriod: { "30d": 74, "90d": 168 } },
  { login: "jweber", name: "Jonas Weber", commits: 604, byPeriod: { "30d": 18, "90d": 97 } },
  { login: "priyar", name: "Priya Raman", commits: 451, byPeriod: { "30d": 33, "90d": 131 } },
  { login: "leoduarte", name: "Leo Duarte", commits: 290, byPeriod: { "30d": 0, "90d": 38 } },
  { login: "samk", name: "Sam Kim", commits: 174, byPeriod: { "30d": 39, "90d": 64 } },
  { login: "noor-h", name: "Noor Haddad", commits: 98, byPeriod: { "30d": 12, "90d": 22 } },
  { login: "tomvl", name: "Tom van Leeuwen", commits: 41, byPeriod: { "30d": 0, "90d": 5 } },
];

export function TopContributorsDemo() {
  return <TopContributors repo="ada-dev/lumen" contributors={CONTRIBUTORS} limit={6} />;
}
