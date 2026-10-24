import type { DialMenuItem } from "@/components/ovio/dial-menu/types";
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

/** lumen's release card, v1 (a wireframe) against v2 (finished), in the Compare Slider demo and its share image. */
export const SAMPLE_RELEASE = {
  label: "Release card",
  beforeLabel: "v1",
  afterLabel: "v2",
  /** Bar heights in percent. */
  bars: [40, 65, 52, 85, 60, 95, 72],
};

/** Every third bar of the finished card takes the accent. */
export const isAccentBar = (i: number) => i % 3 === 2;

/** lumen's beta invite, under the coating in the Scratch to Reveal demo and its share image. */
export const SAMPLE_INVITE = {
  label: "lumen 3.0 beta",
  title: "Invite code",
  code: "LMN-7K2F-Q9",
  note: "One seat · until Nov 30",
};

/** Quick actions on a lumen doc, round the Dial Menu demo and its share image; the demo adds icons. */
export const SAMPLE_DIAL: DialMenuItem[] = [
  {
    id: "new",
    label: "New",
    shortcut: "N",
    items: [
      { id: "doc", label: "Doc" },
      { id: "task", label: "Task" },
      { id: "board", label: "Board" },
      { id: "channel", label: "Channel" },
    ],
  },
  { id: "search", label: "Search", shortcut: "⌘K" },
  { id: "comment", label: "Comment", shortcut: "C" },
  {
    id: "share",
    label: "Share",
    items: [
      { id: "link", label: "Copy link", shortcut: "⌘L" },
      { id: "invite", label: "Invite people" },
      { id: "export", label: "Export as PDF" },
    ],
  },
  {
    id: "assign",
    label: "Assign",
    items: [
      { id: "ada", label: "Ada Park" },
      { id: "theo", label: "Theo Lin" },
      { id: "mira", label: "Mira Okafor" },
    ],
  },
  { id: "pin", label: "Pin to sidebar", shortcut: "P" },
  { id: "archive", label: "Archive", disabled: true },
  { id: "settings", label: "Doc settings", shortcut: "⌘," },
];
