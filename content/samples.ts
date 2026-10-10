import type { DownloadWeek } from "@/components/ovio/npm-downloads/npm-downloads";
import type { Repository } from "@/components/ovio/repository-card/repository-card";
import { seeded } from "@/components/site/seeded";
import type { Developer } from "@/lib/github";
import { DEMO_WEEKS } from "./demo-sources";

/**
 * The site's sample data, shared by each demo and its README embed preview: lumen, the fictional
 * project the samples are about, and Ada Park, who makes it.
 */

/** Shown when the Repository Card demo's live data can't load. */
export const SAMPLE_REPOSITORY: Repository = {
  owner: "ada-dev",
  name: "lumen",
  description: "A tiny, typed state machine for interface animation.",
  language: "TypeScript",
  stars: 10945,
  forks: 812,
  issues: 37,
  updatedAt: "2026-10-07T06:00:00Z",
};

/** The sample: steady growth with some noise, from a fixed seed so SSR and client agree. */
function sampleWeeks(): DownloadWeek[] {
  const rnd = seeded(4821);
  const start = Date.UTC(2026, 6, 6);
  const weeks = Array.from({ length: DEMO_WEEKS }, (_, i) => ({
    week: new Date(start + i * 7 * 86400000).toISOString().slice(0, 10),
    downloads: Math.round(31000 * Math.pow(1.034, i) * (0.9 + rnd() * 0.2)),
  }));
  weeks[11].downloads = 42890;
  weeks[12].downloads = 48210;
  return weeks;
}

/** lumen's weekly downloads. */
export const SAMPLE_DOWNLOADS = sampleWeeks();
export const SAMPLE_PACKAGE = "lumen";

/** Ada Park, as the Developer ID Card demo and its embed preview show her. */
export const SAMPLE_DEVELOPER: Developer = {
  name: "Ada Park",
  title: "Senior Software Engineer",
  stack: ["React", "TypeScript", "Node", "Postgres"],
  github: "ada-dev",
  website: "ada.dev",
  location: "Seoul, Korea",
  available: true,
  serial: "024",
  since: 2019,
};
