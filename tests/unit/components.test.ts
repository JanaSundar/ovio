import { describe, expect, it } from "vitest";
import { barLabel, deltaLabel, signedDelta } from "@/components/ovio/bundle-size/bundle-size";
import { buildContributionYear } from "@/components/ovio/contribution-graph/year";
import { cellsPath, initialsOf } from "@/components/ovio/developer-id-card/developer-id-card";
import { hashString, random } from "@/components/ovio/event-ticket/seed";
import { formatDelta } from "@/components/ovio/npm-downloads/npm-downloads";
import { detents } from "@/components/ovio/physical-knob/physical-knob";
import { nearestIndex, shapeStarHistory, smoothPath } from "@/components/ovio/star-history/shape";
import { seeded } from "@/components/site/seeded";

/** Pins today's outputs, so refactors that share this logic can prove nothing changed. */

describe("seeded values", () => {
  it("hashString is stable", () => {
    expect(["", "guest", "Ada Park", "Lumen Launch 2026"].map(hashString)).toMatchSnapshot();
  });

  it("random and seeded produce the same stable sequence", () => {
    const a = random(42);
    const b = seeded(42);
    const xs = Array.from({ length: 5 }, () => a());
    expect(Array.from({ length: 5 }, () => b())).toEqual(xs);
    expect(xs).toMatchSnapshot();
  });
});

describe("initialsOf", () => {
  it("takes the first and last word, or the first two letters", () => {
    expect(initialsOf("Jana Sundar")).toBe("JS");
    expect(initialsOf("Ada Okafor Park")).toBe("AP");
    expect(initialsOf("ada-dev")).toBe("AD");
    expect(initialsOf("jana")).toBe("JA");
  });
});

describe("contribution year", () => {
  const data = Array.from({ length: 120 }, (_, i) => ({
    date: new Date(Date.UTC(2026, 0, 1) + i * 3 * 86_400_000).toISOString().slice(0, 10),
    count: (i * 7) % 13,
  }));

  it("shapes a year deterministically", () => {
    const year = buildContributionYear(data, { end: "2026-10-07" });
    expect({
      weeks: year.weeks,
      days: year.days.length,
      total: year.total,
      longest: year.longest,
      current: year.current,
      best: year.best.date,
      busiestWeekday: year.busiestWeekday,
      months: year.months,
      levels: year.days.map((d) => d.level).join(""),
    }).toMatchSnapshot();
  });
});

describe("star history shape", () => {
  const data = Array.from({ length: 60 }, (_, i) => ({
    date: new Date(Date.UTC(2025, 6, 1) + i * 5 * 86_400_000).toISOString().slice(0, 10),
    stars: Math.round(40 * i + (i * i) / 3),
  }));

  it("shapes points, months and annotations", () => {
    const shape = shapeStarHistory(data, [{ date: "2025-09-14", label: "HN" }], "ada-dev/lumen");
    expect({
      total: shape.total,
      points: shape.points.length,
      months: shape.months,
      annotations: shape.annotations.map((a) => [a.label, a.index, a.month]),
      path: smoothPath(
        shape.points.slice(0, 6).map((p) => [p.x * 100, p.y * 100] as [number, number]),
      ),
    }).toMatchSnapshot();
  });

  it("finds the nearest index", () => {
    expect(nearestIndex([0, 0.25, 0.5, 1], 0.6)).toBe(2);
    expect(nearestIndex([0, 0.25, 0.5, 1], 0.9)).toBe(3);
  });
});

describe("small formatters", () => {
  it("npm formatDelta", () => {
    expect(formatDelta(null)).toBe("—");
    expect(formatDelta(12.44)).toBe("+12.4%");
    expect(formatDelta(-3.06)).toBe("−3.1%");
    expect(formatDelta(5, ["▲ ", "▼ "])).toBe("▲ 5.0%");
  });

  it("knob detents", () => {
    const d = detents(0, 100, 5);
    expect([0, 24, 26, 74, 100].map(d.toIndex)).toEqual([0, 1, 1, 3, 4]);
    expect([0, 1, 2, 3, 4].map(d.toValue)).toEqual([0, 25, 50, 75, 100]);
    expect(detents(0, 1, 4).toValue(1)).toBe(0.333);
  });

  it("bundle labels", () => {
    const base = { version: "1.2.0", raw: 12.34, gzip: 4.1, scale: 40, fill: 0.3, percent: 31 };
    const down = {
      ...base,
      previous: { version: "1.1.0", raw: 13.5 },
      delta: 8.43,
      trend: "down",
      budget: 40,
      over: false,
    } as const;
    const first = { ...base, delta: 0, trend: "first", over: false } as const;
    const same = { ...down, trend: "same", delta: 0 } as const;
    expect([signedDelta(down), deltaLabel(down), barLabel(down)]).toEqual([
      "-8.4%",
      "-8.4% VS 1.1.0",
      "12.3 kB of 40 kB budget, 31%",
    ]);
    expect([signedDelta(same), deltaLabel(first), barLabel(first)]).toEqual([
      "±0%",
      "FIRST RELEASE",
      "12.3 kB of a 40 kB scale, 31%",
    ]);
  });

  it("QR cells path", () => {
    expect(
      cellsPath([
        [true, false],
        [false, true],
      ]),
    ).toBe("M0 0h1v1h-1zM1 1h1v1h-1z");
  });
});
